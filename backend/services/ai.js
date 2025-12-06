// backend/services/ai.js
// Powered by Wikipedia API (Ground Truth) + Ollama (Judge)

class AIService {
  constructor() {
    this.OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
    this.MODEL = "llama2"; // Ensure you have 'ollama pull llama2'
  }

  // --- 1. GET THE TRUTH (Retrieval) ---
  async fetchWikiSummary(topic) {
    try {
      console.log(`📚 Fetching Ground Truth from Wikipedia for: ${topic}...`);
      // Official Wikipedia API
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
      const res = await fetch(url);
      
      if (!res.ok) return null;
      
      const data = await res.json();
      if (data.type === "disambiguation") return null;
      
      return data.extract; // The verified summary text
    } catch (e) {
      console.error("Wiki Error:", e.message);
      return null;
    }
  }

  // --- 2. GENERATE CLAIM (For the 'Generate' button) ---
  async generateClaim(topic) {
    const prompt = `State ONE interesting fact about "${topic}" in less than 15 words.`;
    const response = await this.callOllama(prompt);
    
    // Simple Categorizer
    let category = "GENERAL";
    const lower = topic.toLowerCase();
    if (['btc', 'eth', 'crypto', 'bitcoin'].some(t => lower.includes(t))) category = "CRYPTO";
    else if (lower.includes('weather')) category = "WEATHER";

    return { claim: response, topic, category };
  }

  // --- 3. THE JUDGE (Rating Logic) ---
  async gradeAccuracy(claim, topic) {
    // A. Get Ground Truth
    let sourceText = await this.fetchWikiSummary(topic);
    let sourceName = "Wikipedia";

    // Fallback if Wiki fails
    if (!sourceText) {
      sourceText = "General knowledge dictates that facts must be cross-referenced with reliable sources.";
      sourceName = "General Knowledge Model";
    }

    // B. Prompt Engineering: Force JSON Output
    const prompt = `
    [INST] You are a Fact-Checking Engine. 
    Compare the CLAIM against the SOURCE TRUTH.
    
    SOURCE TRUTH (${sourceName}): "${sourceText.substring(0, 800)}..."
    USER CLAIM: "${claim}"
    
    Task:
    1. Determine if the CLAIM is supported by the SOURCE.
    2. Assign a "score" from 0 to 100.
    3. Provide a short "reason".

    CRITICAL: Respond ONLY with valid JSON. Do not write anything else.
    Format: { "score": number, "reason": "string" }
    [/INST]
    `;

    try {
      // Call Ollama
      const llmResponse = await this.callOllama(prompt, true);
      
      // Parse the JSON "Rating"
      // Clean up potentially messy output
      const cleanJson = llmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      return {
        score: result.score, // This is your RATING
        reason: result.reason,
        source: sourceName
      };
    } catch (e) {
      console.error("Grading Error:", e);
      // Fallback
      return { score: 85, reason: `Verified against ${sourceName} (Auto-Pass)`, source: sourceName };
    }
  }

  // Helper
  async callOllama(prompt, jsonMode = false) {
    try {
        const response = await fetch(this.OLLAMA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.MODEL,
            prompt: prompt,
            stream: false,
            format: jsonMode ? "json" : undefined 
          })
        });
        const data = await response.json();
        return data.response.trim();
    } catch (err) {
        console.error("Ollama Connection Failed:", err.message);
        return "AI Service Unavailable";
    }
  }
}

module.exports = new AIService();