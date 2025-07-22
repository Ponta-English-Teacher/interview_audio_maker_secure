import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  const { ssml } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { ssml },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-D' // Placeholder
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'TTS synthesis failed' });
  }
});

export default router;
