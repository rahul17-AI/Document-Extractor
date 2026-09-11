"""
PDF Extraction Script for Regulatory Compliance Filings
- Identifies headings programmatically using structural layout, font sizes, weights, and numbering patterns.
- Associates each heading with its corresponding narrative body text.
- Preserves document reading order.
- Returns structured JSON data.
"""

import os
import re
import pymupdf as fitz  # PyMuPDF
from collections import Counter
from typing import List, Dict, Any, Optional

def clean_text(text: str) -> str:
    """Normalize whitespace and strip unprintable characters."""
    if not text:
        return ""
    # Normalize unicode spaces and trailing/leading space
    text = text.replace('\xa0', ' ').replace('\r', '')
    # Collapse multiple spaces while preserving newlines
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

def is_page_number_or_footer(text: str, page_height: float, y0: float, y1: float) -> bool:
    """Check if span is a standalone page number or header/footer artifact."""
    clean = text.strip()
    if not clean:
        return True
    if re.match(r'^(page\s+)?\d+(\s+of\s+\d+)?$', clean, re.IGNORECASE):
        return True
    # Bottom margin page numbers
    if y1 > page_height - 45 and (re.match(r'^\d+$', clean) or len(clean) < 15):
        return True
    # Top margin running header artifacts (e.g. "DOCUMENT TITLE - CONTINUED", page headers)
    if y0 < 55 and (re.search(r'(continued|\bpage\b|\bfiling\b)', clean, re.IGNORECASE) or len(clean) < 40):
        return True
    return False

def extract_pdf_sections(pdf_bytes: bytes) -> List[Dict[str, str]]:
    """
    Extract structured sections from PDF binary data.
    Returns: List of dicts with 'heading' and 'text'.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")

    if doc.page_count == 0:
        raise ValueError("The uploaded PDF has no pages.")

    # 1. Profile document typography to detect modal/body font size and styles
    font_sizes = []
    has_text = False
    all_lines = []

    for page_num in range(doc.page_count):
        page = doc[page_num]
        page_height = page.rect.height
        page_width = page.rect.width
        blocks = page.get_text("dict", flags=fitz.TEXTFLAGS_SEARCH)["blocks"]

        for block in blocks:
            if block.get("type") != 0:  # Text blocks only
                continue

            for line in block.get("lines", []):
                line_spans = line.get("spans", [])
                if not line_spans:
                    continue

                line_text = "".join(span.get("text", "") for span in line_spans).strip()
                if not line_text:
                    continue

                has_text = True
                avg_size = sum(s.get("size", 10) * len(s.get("text", "")) for s in line_spans) / max(1, sum(len(s.get("text", "")) for s in line_spans))
                is_bold = any("bold" in s.get("font", "").lower() or (s.get("flags", 0) & 2 != 0) for s in line_spans)
                
                # Check for page numbers/headers
                y0 = line.get("bbox", [0, 0, 0, 0])[1]
                y1 = line.get("bbox", [0, 0, 0, 0])[3]
                x0 = line.get("bbox", [0, 0, 0, 0])[0]

                if is_page_number_or_footer(line_text, page_height, y0, y1):
                    continue

                font_sizes.append(round(avg_size, 1))
                all_lines.append({
                    "page": page_num + 1,
                    "text": line_text,
                    "size": round(avg_size, 1),
                    "is_bold": is_bold,
                    "y0": y0,
                    "y1": y1,
                    "x0": x0,
                    "bbox": line.get("bbox"),
                })

    if not has_text or not all_lines:
        raise ValueError("The uploaded PDF does not contain extractable text layers. It may be a scanned or image-only document.")

    # Calculate baseline body font size (most frequent font size)
    size_counts = Counter(font_sizes)
    body_font_size = size_counts.most_common(1)[0][0]

    # Heading patterns commonly seen in filings
    # E.g. "1. Introduction", "Item 1A.", "Section 2", "Part I", "A. Overview", "ARTICLE III"
    numbered_heading_regex = re.compile(
        r'^\s*('
        r'(Item|ITEM)\s+([0-9]+[A-Z]?|[IVXLCDM]+)[\.\:\-]?\s*'
        r'|(Section|SECTION)\s+([0-9]+(\.[0-9]+)*|[A-Z])[\.\:\-]?\s*'
        r'|(Part|PART)\s+([IVXLCDM]+|[0-9]+)[\.\:\-]?\s*'
        r'|(Article|ARTICLE)\s+([IVXLCDM]+|[0-9]+)[\.\:\-]?\s*'
        r'|([0-9]+(\.[0-9]+)*)[\.\:\-]\s+'
        r'|([A-Z]\.)\s+'
        r'|\(([0-9]+|[a-z]|[ivx]+)\)\s+'
        r')',
        re.IGNORECASE
    )

    def is_heading(line: Dict[str, Any], prev_line: Optional[Dict[str, Any]], next_line: Optional[Dict[str, Any]]) -> bool:
        text = line["text"].strip()
        size = line["size"]
        bold = line["is_bold"]

        # If text is too long, it's typically a narrative paragraph, not a heading
        if len(text) > 180:
            return False

        # If it ends with sentence punctuation like period followed by lowercase, it's body
        if text.endswith((';', ',')):
            return False

        has_numbering = bool(numbered_heading_regex.match(text))

        # Criterion 1: Significant font size difference
        if size >= body_font_size * 1.15:
            # Must not be a whole standard sentence ending with typical punctuation unless numbered
            if not text.endswith('.') or has_numbering or len(text) < 80:
                return True

        # Criterion 2: Numbered prefix (Item 1, 1.01, Section 2) + bold or slightly larger
        if has_numbering:
            if bold or size >= body_font_size or text.isupper():
                return True
            # Even if normal weight, short numbered items on their own line are headings
            if len(text) < 90:
                return True

        # Criterion 3: Bold font and noticeably isolated / shorter than typical paragraphs
        if bold and size >= body_font_size:
            # If line is short and uppercase or title-case
            if len(text) < 100 and not text.endswith('.'):
                return True
            # If all caps and under 120 chars
            if text.isupper() and len(text) < 120 and len(text.split()) < 12:
                return True

        # Criterion 4: Centered or isolated standalone short titles in All Caps
        if text.isupper() and len(text) < 80 and not text.endswith('.'):
            # Check if standalone (distinct gap or short line)
            words = text.split()
            if 1 <= len(words) <= 8 and size >= body_font_size:
                return True

        return False

    # 2. Group into structured sections
    sections = []
    current_heading = None
    current_body_lines = []

    for i, line in enumerate(all_lines):
        prev_line = all_lines[i - 1] if i > 0 else None
        next_line = all_lines[i + 1] if i < len(all_lines) - 1 else None

        if is_heading(line, prev_line, next_line):
            # Check if this heading line is a continuation of a multi-line heading
            is_same_page = prev_line is not None and line["page"] == prev_line["page"]
            line_has_new_numbering = bool(numbered_heading_regex.match(line["text"].strip()))

            if current_heading and not current_body_lines and is_same_page and not line_has_new_numbering:
                # Merge multi-line headings if adjacent and similar styling without their own new heading prefix
                if prev_line and abs(line["size"] - prev_line["size"]) < 1.0 and (line["y0"] - prev_line["y1"] <= line["size"] * 1.8):
                    current_heading += " " + line["text"].strip()
                    continue

            # Save previous section
            if current_heading is not None or current_body_lines:
                heading_title = current_heading if current_heading else "Introduction / Document Overview"
                body_content = clean_text("\n".join(current_body_lines))
                sections.append({
                    "heading": heading_title,
                    "text": body_content
                })

            current_heading = line["text"].strip()
            current_body_lines = []
        else:
            # It's body text belonging to current heading
            current_body_lines.append(line["text"])

    # Append the final section
    if current_heading is not None or current_body_lines:
        heading_title = current_heading if current_heading else "Document Content"
        body_content = clean_text("\n".join(current_body_lines))
        sections.append({
            "heading": heading_title,
            "text": body_content
        })

    # If no headings were identified at all, produce a structured single section
    if not sections:
        sections.append({
            "heading": "Document Content",
            "text": clean_text("\n".join(l["text"] for l in all_lines))
        })

    return sections


if __name__ == "__main__":
    import sys
    import json

    try:
        if len(sys.argv) > 1 and sys.argv[1] != "-":
            pdf_path = sys.argv[1]
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            filename = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(pdf_path)
        else:
            pdf_bytes = sys.stdin.buffer.read()
            filename = sys.argv[2] if len(sys.argv) > 2 else "document.pdf"

        sections = extract_pdf_sections(pdf_bytes)
        print(json.dumps({
            "filename": filename,
            "total_sections": len(sections),
            "sections": sections
        }))
    except Exception as e:
        print(json.dumps({
            "error": True,
            "detail": str(e)
        }), file=sys.stderr)
        sys.exit(1)

