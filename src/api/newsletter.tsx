const WORKER_URL = "https://newsletter-workers.marsescobin.workers.dev";

// Types for API responses and requests
interface ContentSuggestion {
  title: string;
  description: string;
  link: string;
  emoji: string;
}

interface AssistantContent {
  understanding: string;
  suggestions?: ContentSuggestion[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string | AssistantContent;
  timestamp?: number;
}

interface GenerateSuggestionsRequest {
  action: string;
  chatHistory: ChatMessage[];
}

// Response types
interface ContentResponse {
  understanding_and_strategy: string;
  recommendations: ContentSuggestion[];
}

interface NewsletterPreview {
  subject: string;
  body: string;
}

export const api = {
  async generateSuggestions({
    action,
    chatHistory,
  }: GenerateSuggestionsRequest): Promise<ContentResponse | NewsletterPreview> {
    try {
      // Ensure we're sending the correct structure
      const payload = {
        action,
        chatHistory: chatHistory.map((msg) => ({
          role: msg.role,
          content:
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content),
        })),
      };

      const response = await fetch(`${WORKER_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || (await response.text());
        console.error("Server error:", {
          status: response.status,
          message: errorMessage,
          details: errorData,
        });
        throw new Error(`Server error: ${errorMessage || response.status}`);
      }

      const data = await response.json();

      // Type guard to ensure response matches expected format
      if (!isValidResponse(data)) {
        throw new Error("Invalid response format from server");
      }

      return data;
    } catch (error) {
      // Enhance error context before rethrowing
      if (error instanceof Error) {
        console.error("API Error:", {
          message: error.message,
          cause: error.cause,
          stack: error.stack,
        });
      }
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

// Add type guard (if not already present)
function isValidResponse(
  data: any
): data is ContentResponse | NewsletterPreview {
  // Add your validation logic here based on expected response structure
  return (
    data &&
    (("understanding_and_strategy" in data && "recommendations" in data) ||
      ("subject" in data && "body" in data))
  );
}
