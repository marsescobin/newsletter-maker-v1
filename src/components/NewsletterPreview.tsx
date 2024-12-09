import React, { useState } from "react";
import { api, ChatMessage, ContentSuggestion } from "@/api/newsletter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface NewsletterPreviewProps {
  selectedContent: ContentSuggestion[];
  initialPreview: string;
  onPreviewGenerated?: (preview: string) => void;
}

export function NewsletterPreview({
  selectedContent,
  initialPreview,
  onPreviewGenerated,
}: NewsletterPreviewProps) {
  const [preview, setPreview] = useState(initialPreview);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState("");

  const generatePreview = async (userFeedback?: string) => {
    setIsLoading(true);
    try {
      const updatedHistory = userFeedback
        ? [
            ...chatHistory,
            {
              role: "user",
              content: userFeedback,
              timestamp: Date.now(),
            },
          ]
        : chatHistory;

      const result = await api.generateNewsletterPreview({
        selectedContent,
        chatHistory: updatedHistory,
        writingStyle,
      });

      setPreview(result.content);
      onPreviewGenerated?.(result.content);

      setChatHistory([
        ...updatedHistory,
        {
          role: "assistant",
          content: result.content,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Want to improve it?</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How would you like to improve this? (e.g., 'Make it more casual', 'Add more details about...')"
                className="mt-2"
              />
            </div>
            <Button
              onClick={() => {
                if (feedback.trim()) {
                  generatePreview(feedback);
                  setFeedback("");
                }
              }}
              disabled={isLoading || !feedback.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
