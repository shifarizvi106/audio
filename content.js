
const GROQ_API_KEY = "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";

async function processVoiceNote(audioBlob) {
  try {
    // 1. Prepare Audio 
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.ogg");
    formData.append("model", "whisper-large-v3");
    
    // Explicit prompt 
    formData.append(
      "prompt",
      "Transcribe audio in Hinglish using Roman script. Words: scene, cringe, bakchodi, sorted, system, yaar, gawar, logg, Khwab, gang, kya bolti public, pagal-wagal, mereko, ulti, Dhruv ke level wale, kya hai na bhai."
    );

    // 2. Speech-to-Text Call
    const sttRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: formData
    });

    const sttData = await sttRes.json();
    const rawTranscript = sttData.text;
    console.log("Raw STT Output:", rawTranscript);

    if (!rawTranscript) {
      console.warn("No transcription output returned.");
      return;
    }

    // 3. LLM Translation Call 
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
            content: `You decode Indian Hinglish youth slang and street speech into plain English. 
Return a valid JSON object with two fields:
1. "clean_hinglish": The clean sentence written in Romanized Hinglish script.
2. "english_translation": Natural English translation capturing local slang, vibe, and intent.`
          },
          { role: "user", content: rawTranscript }
        ],
        response_format: { type: "json_object" }
      })
    });

    const llmData = await llmRes.json();
    const decoded = JSON.parse(llmData.choices[0].message.content);

    console.log("Clean Hinglish:", decoded.clean_hinglish);
    console.log("English Translation:", decoded.english_translation);

    return decoded;

  } catch (error) {
    console.error("Error processing voice note:", error);
  }
}
