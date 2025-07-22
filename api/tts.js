// api/tts.js

import { config } from 'dotenv';
config();

export const configSettings = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ssml } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey || !ssml) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  const requestBody = {
    input: { ssml },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Wavenet-D', // default voice; overridden by SSML
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  };

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      console.error("Google TTS API response not JSON:", text);
      return res.status(500).json({
        error: "Invalid response from Google TTS",
        detail: text,
      });
    }

    if (!response.ok) {
      console.error("Google TTS API Error Response:", data);
      return res.status(500).json({
        error: data?.error?.message || 'Google TTS API failed',
        detail: typeof data === 'string' ? data : JSON.stringify(data),
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('TTS Server Error:', error);
    res.status(500).json({ error: error.message });
  }
}