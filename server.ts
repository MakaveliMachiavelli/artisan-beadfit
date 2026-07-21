import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authRouter } from './src/server/auth';
import { commerceRouter } from './src/server/commerce';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

app.use(cookieParser());
app.use(
  express.json({
    limit: '50mb',
    // Stash the exact bytes received alongside the parsed body. PayMongo's
    // webhook signature is an HMAC over the raw request bytes; verifying it
    // against a re-serialized JSON.stringify(req.body) would silently fail
    // for the same reason webhook signatures never verify against a
    // reformatted payload - JSON.stringify does not round-trip byte-for-byte.
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply strict rate limiting to auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false }
});
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/commerce', commerceRouter);

// Initialize GoogleGenAI client lazy-style to prevent crashes if missing key
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Generate Video Endpoint
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const ai = getAIClient();
    
    // Model requested: veo-3.1-fast-generate-preview
    // Let's strip standard data:image/png;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'A high-end luxury animation of this bespoke gemstone bracelet sparkling under studio lighting, slowly rotating. Elegant and realistic.',
      image: {
        imageBytes: base64Data,
        mimeType: mimeType || 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
      }
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Poll Video Status Endpoint
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ 
      done: updated.done,
      error: updated.error,
      response: updated.response
    });
  } catch (error: any) {
    console.error('Error polling video status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. Download Video Endpoint
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found in operation results' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to fetch video from source' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    
    const reader = videoRes.body?.getReader();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Setup Vite development middleware or static asset hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
