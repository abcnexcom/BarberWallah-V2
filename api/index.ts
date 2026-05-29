import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverless: true });
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
  res.json({ success: true, message: 'Call triggered (simulated)' });
});

export default app;
