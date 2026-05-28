import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API Route for AI Insights
  app.post('/api/insights', async (req, res) => {
    try {
      const { dataSummary } = req.body;
      if (!dataSummary) {
        return res.status(400).json({ error: 'Missing dataSummary' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY is not defined in the environment variables.');
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this barber shop data and provide 3 actionable business insights. 
        Data: ${JSON.stringify(dataSummary)}
        
        Return the response in JSON format with an array of objects, each having 'title', 'description', and 'icon' (one of: trending, users, clock, alert).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                icon: { type: Type.STRING, enum: ['trending', 'users', 'clock', 'alert'] }
              },
              required: ['title', 'description', 'icon']
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini API.');
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (err: any) {
      console.error('API Insights Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI insights' });
    }
  });

  // Proxy for Exotel (Simulated for now)
  app.post('/api/call', async (req, res) => {
    const { phone, audioUrl, sid, token, callerId } = req.body;
    console.log(`Simulating call to ${phone} with audio ${audioUrl}`);
    // In a real app, we'd use axios to call Exotel API here
    res.json({ success: true, message: 'Call triggered (simulated)' });
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
