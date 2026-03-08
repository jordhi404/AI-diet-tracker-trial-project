import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = process.env.MODEL;
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => console.log(`Server ready on http://localhost:${port}`));

app.post('/api/chat', async(req, res) => {
    const { conversation } = req.body;

    try {
        if(!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role, parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                systemInstruction: "You are a dedicated personal diet and fitness assistant. Your persona is that of a supportive, empathetic, and encouraging friend who is also an expert in health. Your goal is to help the user achieve their body goals (weight loss, muscle gain, etc.) while providing emotional support. You should celebrate their small wins, encourage them when they struggle, and provide actionable, healthy advice. Communicate in a friendly, engaging manner. Answer in a mix of Bahasa Indonesia and English as appropriate for the user.",
            },
        });

        res.status(200).json({ result: response.text });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});