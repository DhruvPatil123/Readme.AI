export async function analyzeRepo(url: string) {
  try {
    const response = await fetch("/api/analyze-repo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to analyze repo");
    }
    return await response.json();
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}

export async function generateReadme(projectDetails: any) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate README");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Generator Error:", error);
    throw error;
  }
}
