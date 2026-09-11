"""
FastAPI Server for Comply Filing Extraction
Exposes POST /extract to receive filing PDFs, validates them,
and returns structured headings and body text JSON.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_pdf_sections
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("comply-api")

app = FastAPI(
    title="Comply Filing Extractor API",
    description="Structured PDF extraction engine for compliance and regulatory filings",
    version="1.0.0",
)

# CORS configuration allowing React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Comply Filing Extraction API",
        "health": "/api/health",
        "extract": "POST /extract"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "engine": "PyMuPDF"}

@app.get("/extract")
@app.get("/api/extract")
def extract_help():
    return {
        "status": "ready",
        "service": "Comply Filing Extraction API",
        "endpoint": "POST /extract",
        "method": "POST",
        "expected_field": "file",
        "supported_formats": [".pdf"],
        "description": "Upload a PDF filing using multipart/form-data with the 'file' field to extract structured headings and content."
    }

@app.post("/extract")
@app.post("/api/extract")
async def extract_filing(file: UploadFile = File(...)):
    # 1. Validate filename and extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF filing documents (.pdf) are supported."
        )

    # 2. Read file contents
    try:
        content = await file.read()
    except Exception as e:
        logger.error(f"Error reading uploaded file: {e}")
        raise HTTPException(status_code=400, detail="Failed to read the uploaded file.")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded PDF file is empty.")

    # 3. Check PDF header signature (%PDF)
    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid PDF (invalid file signature)."
        )

    # 4. Extract structured sections using Python extractor
    try:
        sections = extract_pdf_sections(content)
        return {
            "filename": file.filename,
            "total_sections": len(sections),
            "sections": sections
        }
    except ValueError as val_err:
        logger.warning(f"Validation error during extraction: {val_err}")
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as exc:
        logger.error(f"Unexpected extraction failure: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while extracting text from the PDF: {str(exc)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
