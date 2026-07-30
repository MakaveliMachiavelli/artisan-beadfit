import express from 'express';
import serverless from 'serverless-http';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authRouter } from '../../src/server/auth';
import { commerceRouter } from '../../src/server/commerce';
import { shopRouter } from '../../src/server/shop';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false }
});

const apiRouter = express.Router();

apiRouter.use('/auth', authLimiter, authRouter);
apiRouter.use('/commerce', commerceRouter);
apiRouter.use('/shop', shopRouter);

app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

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

apiRouter.post('/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const ai = getAIClient();
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

apiRouter.post('/video-status', async (req, res) => {
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

apiRouter.post('/video-download', async (req, res) => {
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

export const handler = serverless(app);
