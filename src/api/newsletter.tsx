const WORKER_URL = "http://localhost:8787/chat";

// Types for API responses and requests
interface ContentSuggestion {
  title: string;
  description: string;
  link: string;
  emoji: string;
}

// For the content suggestion agent
interface ContentAgentResponse {
  understanding_and_strategy: string;
  recommendations: ContentSuggestion[];
}

// For the newsletter preview agent
interface NewsletterAgentResponse {
  preview: string; // or whatever structure the newsletter preview will have
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Add new interface for the complete response
interface ContentResponse {
  understanding: string;
  suggestions: ContentSuggestion[];
}

export const api = {
  async generateSuggestions(interests: string): Promise<ContentResponse> {
    try {
      console.log("Sending request to worker with interests:", interests);

      const response = await fetch(`${WORKER_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "generateContent",
          content: interests,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received items from worker:", data);

      return {
        understanding: data.understanding_and_strategy,
        suggestions: data.recommendations.map((item) => ({
          title: item.title,
          preview: item.description,
          link: item.link,
          emoji: item.emoji,
        })),
      };
    } catch (error) {
      console.error("Detailed error:", error);
      throw new Error(
        `Failed to generate content suggestions: ${error.message}`
      );
    }
  },

  async generateStylePreviews(
    content: any[],
    style: string
  ): Promise<StylePreview[]> {
    try {
      const response = await fetch(`${WORKER_URL}/generate-style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateStyle",
          content: {
            articles: content,
            style: style,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the response into our StylePreview format
      return data.styles.map((style, index) => ({
        id: index + 1,
        style: style.name,
        preview: style.content,
      }));
    } catch (error) {
      console.error("Error generating style previews:", error);
      throw new Error("Failed to generate style previews");
    }
  },

  async sendTestNewsletter(
    content: string,
    email: string,
    frequency: string
  ): Promise<string> {
    try {
      const response = await fetch(`${WORKER_URL}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendNewsletter",
          content: content,
          email: email,
          frequency: frequency,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message || "Newsletter sent successfully!";
    } catch (error) {
      console.error("Error sending test newsletter:", error);
      throw new Error("Failed to send test newsletter");
    }
  },
};
