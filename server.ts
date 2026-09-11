import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { spawn, execSync, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// 1. Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PYTHON_PORT = 8001;

// Configure in-memory upload handler (up to 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Enable CORS for all incoming requests (crucial for iframe preview and cross-origin fetch)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Cross-platform Python detection & background lifecycle management
let pythonProcess: ChildProcess | null = null;
let isStartingPython = false;

function detectPythonCommand(): string {
  // On Windows PowerShell/CMD, python is typically 'python' or 'py'
  // On Linux/macOS, it is usually 'python3' or 'python'
  const candidates = process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // Continue searching
    }
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

function checkPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensurePythonBackend(): Promise<boolean> {
  const isOpen = await checkPortOpen(PYTHON_PORT);
  if (isOpen) {
    return true;
  }

  if (pythonProcess || isStartingPython) {
    return false;
  }

  isStartingPython = true;
  const pythonCmd = detectPythonCommand();
  const scriptPath = path.join(__dirname, 'backend', 'server.py');

  console.log(`[Express Backend] Starting Python extraction backend with '${pythonCmd}' on 127.0.0.1:${PYTHON_PORT}...`);
  try {
    pythonProcess = spawn(pythonCmd, [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname,
      windowsHide: true,
    });

    pythonProcess.on('error', (err) => {
      console.warn(`[Express Backend] Notice: Could not spawn Python using '${pythonCmd}': ${err.message}`);
      pythonProcess = null;
      isStartingPython = false;
    });

    pythonProcess.on('exit', () => {
      pythonProcess = null;
      isStartingPython = false;
    });

    // Brief delay to allow FastAPI / uvicorn to bind
    await new Promise((r) => setTimeout(r, 600));
    isStartingPython = false;
    return await checkPortOpen(PYTHON_PORT);
  } catch (err: any) {
    console.warn(`[Express Backend] Error starting Python process: ${err.message}`);
    isStartingPython = false;
    return false;
  }
}

// Clean up child process cleanly on exit or SIGINT/SIGTERM (Windows & Unix)
function cleanupChildProcess() {
  if (pythonProcess && !pythonProcess.killed) {
    console.log('[Express Backend] Terminating Python child process...');
    try {
      if (process.platform === 'win32' && pythonProcess.pid) {
        try {
          execSync(`taskkill /pid ${pythonProcess.pid} /T /F`, { stdio: 'ignore' });
        } catch {
          pythonProcess.kill('SIGKILL');
        }
      } else {
        pythonProcess.kill('SIGTERM');
      }
    } catch {
      // Ignore
    }
    pythonProcess = null;
  }
}

process.on('SIGINT', () => {
  cleanupChildProcess();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupChildProcess();
  process.exit(0);
});

process.on('exit', () => {
  cleanupChildProcess();
});

// Fallback high-performance pure Node PDF extractor if Python/PyMuPDF is not installed or offline
async function extractPdfWithNode(pdfBuffer: Buffer, filename: string) {
  const parser = new PDFParse({ data: pdfBuffer });
  await parser.load();
  const textResult = await parser.getText();
  const fullText = textResult?.text || '';

  if (!fullText.trim()) {
    throw new Error('The uploaded PDF does not contain extractable text layers.');
  }

  const rawLines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  const sections: { heading: string; text: string }[] = [];

  const headingRegex = /^(ITEM\s+[0-9]+[A-Z]?|Item\s+[0-9]+[A-Z]?|PART\s+[IVXLCDM0-9]+|Part\s+[IVXLCDM0-9]+|SECTION\s+[0-9]+|Section\s+[0-9]+|ARTICLE\s+[IVXLCDM0-9]+|Article\s+[IVXLCDM0-9]+|[0-9]+(\.[0-9]+)*[\.\:\-]\s+)/i;

  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of rawLines) {
    if (/^(page\s+)?\d+(\s+of\s+\d+)?$/i.test(line)) {
      continue;
    }

    const isMatch =
      (line.length <= 130 && headingRegex.test(line)) ||
      (line.length <= 80 && line === line.toUpperCase() && /[A-Z]{3,}/.test(line));

    if (isMatch) {
      if (currentHeading || currentBody.length > 0) {
        sections.push({
          heading: currentHeading || 'Introduction & Overview',
          text: currentBody.join('\n').trim(),
        });
        currentBody = [];
      }
      currentHeading = line;
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading || currentBody.length > 0) {
    sections.push({
      heading: currentHeading || 'Summary',
      text: currentBody.join('\n').trim(),
    });
  }

  if (sections.length === 0) {
    sections.push({
      heading: filename || 'Filing Overview',
      text: fullText.trim(),
    });
  }

  return {
    filename,
    total_sections: sections.length,
    sections,
    engine: 'Node PDF Parser (PyMuPDF fallback)',
  };
}

// 3. API Routes FIRST

// Informational GET endpoints for /extract
const handleExtractHelp = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ready',
    service: 'Comply Filing Extraction API',
    endpoint: 'POST /extract',
    method: 'POST',
    expected_field: 'file',
    supported_formats: ['.pdf'],
    description: 'Upload a PDF filing using multipart/form-data with the "file" field to extract structured headings and content.',
  });
};

app.get('/extract', handleExtractHelp);
app.get('/api/extract', handleExtractHelp);

// Primary POST extraction handler: streams via multer, attempts Python PyMuPDF first, seamlessly falls back to Node
const handleExtractUpload = async (req: express.Request, res: express.Response) => {
  if (!req.file) {
    return res.status(400).json({
      detail: 'No file received. Please upload a PDF filing using multipart form-data with the "file" field name.',
    });
  }

  const filename = req.file.originalname || 'document.pdf';

  // 1. Try Python PyMuPDF engine if online
  const isPythonReady = await ensurePythonBackend();
  if (isPythonReady) {
    try {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/pdf' });
      const formData = new FormData();
      formData.append('file', blob, filename);

      const pyResponse = await fetch(`http://127.0.0.1:${PYTHON_PORT}/extract`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(20000),
      });

      if (pyResponse.ok) {
        const data = await pyResponse.json();
        return res.json(data);
      } else {
        const errorText = await pyResponse.text();
        console.warn('[Express Extraction] Python backend returned error:', errorText);
      }
    } catch (pyErr: any) {
      console.warn('[Express Extraction] Python backend unreachable or timed out, using fallback:', pyErr.message);
    }
  }

  // 2. Seamlessly use pure Node PDF extraction fallback
  try {
    const fallbackData = await extractPdfWithNode(req.file.buffer, filename);
    return res.json(fallbackData);
  } catch (err: any) {
    console.error('[Express Extraction] Fallback extraction failed:', err);
    return res.status(500).json({
      detail: `Extraction failed: ${err.message || 'Unable to parse PDF content'}.`,
    });
  }
};

app.post('/extract', upload.single('file'), handleExtractUpload);
app.post('/api/extract', upload.single('file'), handleExtractUpload);

// Enable JSON body parser for REST APIs (mounted after multipart extract routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isPythonAlive = await checkPortOpen(PYTHON_PORT);
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  res.json({
    status: 'ok',
    service: 'Comply Filing Intelligence Express Server',
    platform: process.platform,
    pythonBackendOnline: isPythonAlive,
    geminiConfigured: hasGeminiKey,
    pythonBackendPort: PYTHON_PORT,
    timestamp: new Date().toISOString(),
  });
});

// Gemini AI Analysis endpoint (Safe Server-Side GenAI SDK invocation)
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return res.status(400).json({
        error: 'GEMINI_API_KEY environment variable is not configured in .env file.',
        hint: 'Add GEMINI_API_KEY="your_api_key" to .env in the project root.',
      });
    }

    const { prompt, text, heading } = req.body;
    const client = new GoogleGenAI({ apiKey });

    const contents = prompt || (
      `You are an expert regulatory compliance analyst. Analyze this section from a corporate filing:\n\n` +
      `SECTION HEADING: ${heading || 'Untitled Section'}\n\n` +
      `CONTENT:\n${text || ''}\n\n` +
      `Provide a structured 3-point executive briefing:\n` +
      `1. Material Regulatory Risks\n` +
      `2. Compliance Mandates & Requirements\n` +
      `3. Key Action Items / Governance Notes`
    );

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
    });

    res.json({
      success: true,
      analysis: response.text,
    });
  } catch (err: any) {
    console.error('[Gemini API] Analysis failure:', err);
    res.status(500).json({
      error: err.message || 'Gemini processing failed',
    });
  }
});

// 4. Vite Middleware for Development or Static Serving for Production
async function startServer() {
  // Proactively check/start Python backend
  ensurePythonBackend().catch(() => {});

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Comply Intelligence] Server running at http://localhost:${PORT}`);
  });
}

startServer();
