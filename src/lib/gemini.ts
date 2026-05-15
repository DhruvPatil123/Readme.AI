import { GoogleGenAI } from "@google/genai";

export async function analyzeRepo(url: string) {
  try {
    const response = await fetch("/api/analyze-repo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error("Failed to analyze repo");
    return await response.json();
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}

export async function generateReadme(projectDetails: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const { 
    name, 
    description, 
    techStack, 
    files, 
    template = "Standard", 
    language = "English", 
    roadmap = [],
    supplemental = [] 
  } = projectDetails;

  const prompt = `
    You are an elite developer advocate and technical writer. 
    Generate a professional documentation suite for the following project.
    
    PROJECT CONTEXT:
    - Name: ${name}
    - Description: ${description}
    - Tech Stack: ${techStack}
    - Detected Files: ${files?.join(", ")}
    - Template Style: ${template}
    - Target Language: ${language}
    - Roadmap Items: ${roadmap.join(", ")}
    
    TEMPLATES GUIDELINES:
    - Minimalist: Focus on brevity and speed. Short sections.
    - Enterprise: Very detailed, long sections, formal tone, compliance-focused.
    - CLI Pro: Focuses on terminal commands, usage examples, and command flags.
    - Hero: Visual focus, larger headings, focuses on "Why this project?".

    OUTPUT REQUIREMENTS:
    1. Return ONLY valid Markdown.
    2. If supplemental files are requested (${supplemental.join(", ")}), include them at the end separated by a custom divider "---FILE_SEPARATOR---[FILENAME]---".
    3. Use professional shields.io badges.
    4. Add a "Show your support" section with a "Give a ⭐ if this project helped you!" call to action.
    5. Use GitHub styled emojis effectively.
    6. For the roadmap, use a nice checklist or table format.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("Empty response from AI.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
