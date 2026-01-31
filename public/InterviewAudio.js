async function generateAudio() {
  const status = document.getElementById("statusMessage");
  const player = document.getElementById("audioPlayer");

  const script = document.getElementById("scriptInput").value.trim();
  const hostVoice = document.getElementById("hostVoice").value;
  const guestVoice = document.getElementById("guestVoice").value;

  if (!script) {
    alert("Please enter a script first.");
    return;
  }

  status.textContent = "🔄 Generating audio... Please wait.";
  player.src = "";

  const ssml = buildSSML(script, hostVoice, guestVoice);

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ssml })
    });

    if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Server error: ${errorText}`);
}

const data = await response.json();

    if (data.audioContent) {
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      player.src = audioUrl;
      player.play();

      window.generatedAudioBlob = audioBlob;
      status.textContent = "✅ Audio generated!";
    } else {
      status.textContent = "❌ Failed to generate audio.";
      console.error("TTS response error:", data);
    }
  } catch (err) {
    status.textContent = "❌ Error during synthesis.";
    console.error("TTS fetch error:", err);
  }
}

function buildSSML(script, hostVoice, guestVoice) {
  const lines = script.split("\n");
  let ssml = "<speak>\n";

  const speakerRegex = /^\*\*(.+?)\*\*\s*:\s*/;


  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const match = trimmed.match(speakerRegex);

    if (match) {
      const speaker = match[1].trim();
      const rawText = trimmed.replace(speakerRegex, "").trim();
      const text = removeBrackets(rawText);
      const voice = speaker.toLowerCase() === "host" ? hostVoice : guestVoice;

      ssml += `<voice name="${voice}">${escapeXML(text)}</voice><break time="500ms"/>\n`;
    } else {
      console.warn("Skipping non-dialogue line:", trimmed);
    }
  });

  ssml += "</speak>";
  return ssml;
}

function escapeXML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}

function removeBrackets(str) {
  return str.replace(/\[.*?\]/g, '').trim();
}

function downloadAudio() {
  if (!window.generatedAudioBlob) {
    alert("Please generate audio first.");
    return;
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(window.generatedAudioBlob);
  link.download = "interview-audio.mp3";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
