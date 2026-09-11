const GROQ_API_KEY = "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";

// Detect voice notes on WhatsApp Web
async function processVoiceNote(audioBlob) {
  // 1. Transcribe audio 
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.ogg");
  formData.append("model", "whisper-large-v3");
  formData.append("prompt", "scene, cringe, bakchodi, sorted, system, yaar, gawar, logg, cewllez, Khwab, gang, kya bolti public, pagal-wagal, mereko, retarded, ulti ");

  const sttRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: formData
  });
  const sttData = await sttRes.json();
  const rawTranscript = sttData.text;

  // 2. Decode slang 
  const llmRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You decode Hinglish youth slang into plain English. Return JSON with two fields: 'transcript' (original clean text) and 'translation' (contextual translation)."
        },
        { role: "user", content: rawTranscript }
      ],
      response_format: { type: "json_object" }
    })
  });
  
  const llmData = await llmRes.json();
  console.log("Decoded Result:", llmData.choices[0].message.content);
}
