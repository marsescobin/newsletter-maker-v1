const WORKER_URL = "https://newsletter-workers.marsescobin.workers.dev";

// Types for API responses and requests
interface ContentSuggestion {
  title: string;
  description: string;
  link: string;
  emoji: string;
}

// Add new interface for the complete response
interface ContentResponse {
  understanding: string;
  suggestions: ContentSuggestion[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface GenerateSuggestionsRequest {
  action: string;
  content: string;
}

// Add new interfaces for newsletter preview
interface NewsletterPreviewRequest {
  selectedContent: ContentSuggestion[];
  chatHistory?: ChatMessage[]; // Optional for first request
  writingStyle?: string; // Optional custom style preferences
}

interface NewsletterPreview {
  subject: string;
  body: string;
}

// Add this interface for the moreLikeThis response
interface MoreLikeThisResponse {
  recommendation: ContentSuggestion;
}

export const api = {
  async generateSuggestions({
    action,
    content,
  }: GenerateSuggestionsRequest): Promise<
    ContentResponse | NewsletterPreview | MoreLikeThisResponse
  > {
    try {
      const response = await fetch(`${WORKER_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Return based on action type
      if (action === "generateContent") {
        return {
          understanding: data.understanding_and_strategy,
          suggestions: data.recommendations.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            emoji: item.emoji,
          })),
        };
      } else if (action === "moreLikeThis") {
        return {
          recommendation: {
            title: data.recommendation.title,
            description: data.recommendation.description,
            link: data.recommendation.link,
            emoji: data.recommendation.emoji,
          },
        };
      } else {
        return {
          subject: data.subject,
          body: data.body,
        };
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },

  async generateStylePreviews({
    chatHistory,
  }: GenerateSuggestionsRequest): Promise<StylePreview[]> {
    try {
      const response = await fetch(`${WORKER_URL}/generate-style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateStyle",
          chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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

  async generateNewsletterPreview({
    selectedContent,
    chatHistory,
    writingStyle,
  }: NewsletterPreviewRequest): Promise<NewsletterPreview> {
    try {
      const response = await fetch(`${WORKER_URL}/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "addWritingVoice",
          selectedContent,
          chatHistory,
          writingStyle,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating newsletter preview:", error);
      throw new Error("Failed to generate newsletter preview");
    }
  },
};
