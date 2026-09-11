# Backend - Comply Filing Extractor API

FastAPI service powering structured heading and narrative body text extraction from regulatory filing PDFs using PyMuPDF (`fitz`).

## Architecture

- **`server.py`**: FastAPI application exposing `POST /extract` and `GET /api/health`.
- **`extractor.py`**: Heuristic typography & coordinate layout engine that identifies heading spans, baseline font stats, multi-line titles, and narrative body paragraphs.
- **`requirements.txt`**: Python dependencies.

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server on port 8001
python3 server.py
```

## API Endpoints

- `GET /api/health` -> `{"status": "ok", "engine": "PyMuPDF"}`
- `POST /extract` -> Accepts multipart `file` (`.pdf`), returns JSON `{ filename, total_sections, sections: [{ heading, text }, ...] }`
