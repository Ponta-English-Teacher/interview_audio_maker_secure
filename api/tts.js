import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  const { ssml } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey || !ssml) {
    return res.status(400).json({ error: 'Missing API key or SSML input' });
  }

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { ssml },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-D'
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      })
    });

    // If the API didn't succeed, return the error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API Error:', errorText);
      return res.status(response.status).json({ error: 'TTS API Error', details: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'TTS synthesis failed', details: err.message });
  }
});

export default router;