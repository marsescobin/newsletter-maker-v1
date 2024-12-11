import React from "react";
import { Button, Alert, AlertDescription } from "@/components/ui";
import { Loader2, Send } from "lucide-react";

function Step4({
  formData,
  testEmail,
  setTestEmail,
  handleEmailClick,
  loading,
  feedback,
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Summary:</h3>
        <p>
          <strong>Interests:</strong> {formData.interests}
        </p>
        <p>
          <strong>Writing Style:</strong> {formData.writingStyle}
        </p>
        <p>
          <strong>Frequency:</strong> {formData.frequency}
        </p>
      </div>

      <div className="prose max-w-none p-4 border rounded-lg bg-white">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500">Subject</h3>
          <p className="text-lg font-medium">{formData.newsletterSubject}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Preview</h3>
          <div
            className="mt-2 text-gray-600 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(formData.newsletterBody),
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter test email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <Button
          onClick={handleEmailClick}
          disabled={!testEmail || loading}
          className="whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test
            </>
          )}
        </Button>
      </div>

      {feedback && (
        <Alert variant={feedback.includes("error") ? "destructive" : "success"}>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default Step4;
