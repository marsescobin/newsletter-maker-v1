const WORKER_URL = "https://newsletter-workers.marsescobin.workers.dev";

// Types for API responses and requests
interface ContentSuggestion {
  title: string;
  preview: string;
  link: string;
  emoji: string;
}

interface StylePreview {
  id: number;
  style: string;
  preview: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export const api = {
  async generateSuggestions(interests: string): Promise<ContentSuggestion[]> {
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

      // Get the array of items directly from the response
      const items = await response.json();
      console.log("Received items from worker:", items);

      // Transform each item into our frontend format
      return items.map((item) => ({
        title: item.Title,
        preview: item.Description,
        link: item.Link,
        emoji: item.Emoji,
      }));
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
