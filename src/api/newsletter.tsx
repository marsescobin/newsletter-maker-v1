const WORKER_URL = "https://newsletter-workers.marsescobin.workers.dev";
const NEWSIES_URL = "https://newsies.marsescobin.workers.dev";

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
  async generateSuggestions(request: {
    userPrompt: string;
  }): Promise<ContentResponse | NewsletterPreview> {
    try {
      console.log("Received userPrompt:", request.userPrompt);
      const response = await fetch(`${NEWSIES_URL}/createQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ userPrompt: request.userPrompt }),
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
      console.log("Received data:", data);

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

  async massageContent(
    query: string,
    content: ContentSuggestion[]
  ): Promise<ContentSuggestion[]> {
    try {
      console.log("Original content being sent for massage:", content);

      const response = await fetch(`${NEWSIES_URL}/massageContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          searchQuery: query,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw massaged response:", data);

      const massagedData = JSON.parse(data.massagedContent);
      console.log("Parsed massaged data:", massagedData);

      // Map through original content and only update description and emoji
      const updatedContent = content.map((item) => {
        // Find corresponding massaged article by matching title
        const massagedArticle = massagedData.articles.find(
          (article) => article.title === item.title
        );

        console.log("Matching for title:", item.title);
        console.log("Found massaged article:", massagedArticle);

        if (massagedArticle) {
          return {
            ...item, // Keep all original properties
            description: massagedArticle.description, // Only update description
            emoji: massagedArticle.emoji, // Only update emoji
          };
        }
        return item; // If no match found, return original item unchanged
      });

      console.log("Final updated content:", updatedContent);
      return updatedContent;
    } catch (error) {
      console.error("Error massaging content:", error);
      throw new Error("Failed to massage content");
    }
  },

  async scrapeAndSearch(
    query: string
  ): Promise<ContentResponse | NewsletterPreview> {
    try {
      const response = await fetch(`${NEWSIES_URL}/searchAndScrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          searchQuery: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Scraped data", JSON.stringify(data, null, 2));
      // Return in the correct ContentResponse format
      return {
        understanding_and_strategy: `Search results for: ${query}`,
        recommendations: data.results.map((result) => ({
          title: result.title,
          description: result.snippet,
          link: result.link,
          emoji: "📰", // Adding the required emoji field
          source: result.source, // These are optional fields
          date: result.date, // from your original code
        })),
      };
    } catch (error) {
      console.error("Error scraping and searching:", error);
      throw new Error("Failed to scrape and search");
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
    content,
  }: NewsletterPreviewRequest): Promise<NewsletterPreview> {
    try {
      const response = await fetch(`${WORKER_URL}/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ content: content }),
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

  async writeNewsletter(request: {
    searchQuery: string;
    content: ContentSuggestion[];
  }): Promise<any> {
    const response = await fetch(`${NEWSIES_URL}/writeNewsletter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to generate newsletter");
    }

    return response.json();
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
