// src/api/resume.ts
const WORKER_URL = "https://newsletter-workers.marsescobin.workers.dev";

export interface ResumeParseResponse {
  text: string;
}

export const resumeApi = {
  parseResume: async (formData: FormData): Promise<ResumeParseResponse> => {
    try {
      const response = await fetch(`${WORKER_URL}`, {
        method: "POST",
        body: formData,
        headers: {
          type: "resumeParser",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to parse resume");
      }

      const data = await response.json();
      return {
        text: data.summary,
      };
    } catch (error) {
      console.error("Resume parsing error:", error);
      throw error;
    }
  },
};
