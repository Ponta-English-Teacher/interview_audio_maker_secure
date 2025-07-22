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
  console.log("Incoming TTS request:", { ssml, voice });

  if (!apiKey || !ssml || !voice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isStudio = voice.startsWith('en-US-Studio');
  const url = isStudio
    ? 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'
    : 'https://texttospeech.googleapis.com/v1/text:synthesize';

  const requestBody = {
    input: { ssml },
    voice: {
      languageCode: 'en-US',
      name: voice,
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

    const data = await response.json();

    if (!response.ok) {
      console.error("Google TTS API Error Response:", data);
      return res.status(500).json({ error: data.error?.message || 'TTS API failed' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('TTS Server Error:', error);
    res.status(500).json({ error: error.message });
  }
}