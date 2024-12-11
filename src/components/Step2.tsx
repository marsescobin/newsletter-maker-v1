import React from "react";
import { Button, Textarea } from "@/components/ui";
import { Loader2 } from "lucide-react";

function Step2({
  formData,
  handleInputChange,
  loading,
  api,
  setChatHistory,
  setFormData,
  setLoading,
}) {
  return (
    <div className="space-y-4">
      <Textarea
        name="writingStyle"
        value={formData.writingStyle}
        onChange={handleInputChange}
        placeholder="How would you like to improve this? (e.g., 'Make it more casual', 'Add more details about...')"
        className="h-32"
        disabled={loading}
      />
      <Button
        onClick={async () => {
          setLoading(true);
          try {
            const userMessage = {
              role: "user",
              content: formData.writingStyle,
              timestamp: Date.now(),
            };

            const response = await api.generateSuggestions({
              action: "addWritingVoice",
              chatHistory: [
                {
                  role: "user",
                  content: JSON.stringify({
                    suggestions: formData.suggestedContent,
                    understanding: formData.understanding,
                  }),
                },
              ],
            });

            const assistantMessage = {
              role: "assistant",
              content: JSON.stringify(response),
              timestamp: Date.now(),
            };

            setChatHistory((prev) => [...prev, userMessage, assistantMessage]);

            setFormData((prev) => ({
              ...prev,
              writingStyle: "",
              newsletterSubject: response.subject,
              newsletterBody: response.body,
            }));
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || !formData.writingStyle.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Newsletter...
          </>
        ) : (
          "Send Feedback"
        )}
      </Button>
      <div className="prose max-w-none p-4 border rounded-lg bg-white">
        {formData.newsletterSubject && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Subject</h3>
            <p className="text-lg font-medium">{formData.newsletterSubject}</p>
          </div>
        )}

        {formData.newsletterBody && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Preview</h3>
            <div
              className="mt-2 text-gray-600 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-4"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(formData.newsletterBody),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Step2;
