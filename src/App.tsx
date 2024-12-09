import React, { useState, useEffect } from "react";
import { api, ChatMessage } from "./api/newsletter";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Send, Plus, Heart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { presetContents } from "./data/presetContent";

function App(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    interests: "",
    suggestedContent: [],
    writingStyle: "",
    frequency: "",
    selectedStyleId: null,
    understanding: "",
  });
  const [loading, setLoading] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stylePreviews, setStylePreviews] = useState([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [animatingHearts, setAnimatingHearts] = useState<number[]>([]);

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  useEffect(() => {
    console.log("Chat history updated:", chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    // Show 5 random preset contents on initial load
    const randomContents = [...presetContents]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setFormData((prev) => ({
      ...prev,
      suggestedContent: randomContents,
      understanding:
        "Here are some interesting topics you might enjoy. Feel free to enter your interests to get personalized suggestions!",
    }));
  }, []); // Empty dependency array means this runs once on component mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFrequencyChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      frequency: value,
    }));
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: formData.interests,
        timestamp: Date.now(),
      };

      const response = (await api.generateSuggestions({
        action: "generateContent",
        content: formData.interests,
      })) as ContentResponse;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: JSON.stringify(response),
        timestamp: Date.now(),
      };

      setChatHistory((prev) => [...prev, userMessage, assistantMessage]);

      setFormData((prev) => ({
        ...prev,
        understanding: response.understanding,
        suggestedContent: response.suggestions,
      }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setPreviewGenerated(true);
    }
  };

  const sendTestNewsletter = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFeedback("Test newsletter sent successfully! Check your inbox.");
    setLoading(false);
  };

  const handleLessLikeThis = (content: any, index: number) => {
    // Remove the item from suggestedContent array
    setFormData((prev) => ({
      ...prev,
      suggestedContent: prev.suggestedContent.filter((_, i) => i !== index),
    }));

    // Optionally, you can also add this to chat history
    const userMessage: ChatMessage = {
      role: "user",
      content: `Not interested in: ${content.title}`,
      timestamp: Date.now(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
  };

  const handleSuggestMore = async () => {
    setIsLoadingMore(true);

    try {
      // Create a message describing what content we currently like
      const contentSummary = formData.suggestedContent
        .map((content) => content.title)
        .join(", ");

      const response = (await api.generateSuggestions({
        action: "generateContent",
        content: JSON.stringify({
          content: `Generate more content similar to these topics: ${contentSummary}`,
          chatHistory: chatHistory,
        }),
      })) as ContentResponse;

      // Concatenate new suggestions with existing ones
      setFormData((prev) => ({
        ...prev,
        suggestedContent: [...prev.suggestedContent, ...response.suggestions],
      }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoveThis = (content: any, index: number) => {
    // Toggle like state
    setLikedItems((prev) => {
      const isCurrentlyLiked = prev.includes(index);
      return isCurrentlyLiked
        ? prev.filter((i) => i !== index)
        : [...prev, index];
    });

    // Trigger animation
    setAnimatingHearts((prev) => [...prev, index]);
    setTimeout(() => {
      setAnimatingHearts((prev) => prev.filter((i) => i !== index));
    }, 300);

    // Only add to chat history if it's a new like
    if (!likedItems.includes(index)) {
      const userMessage: ChatMessage = {
        role: "user",
        content: `Loved this content: ${content.title}`,
        timestamp: Date.now(),
      };
      setChatHistory((prev) => [...prev, userMessage]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Textarea
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              placeholder="What are you into? What content would you like to see..."
              className="h-32"
            />
            <Button
              onClick={generateSuggestions}
              disabled={loading || !formData.interests.trim()} // Add this condition
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {previewGenerated ? "Sending Feedback..." : "Generating..."}
                </>
              ) : previewGenerated ? (
                "Send Feedback"
              ) : (
                "Send Feedback"
              )}
            </Button>
            {formData.suggestedContent.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="space-y-4">
                  {formData.suggestedContent.map((content, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors space-y-3"
                    >
                      {loadingItemId === index ? (
                        <div className="flex flex-col items-center justify-center h-[200px] space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <p className="text-sm text-gray-500">
                            Finding similar content...
                          </p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <a
                              href={content.link}
                              className="block mb-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <h3 className="font-medium text-lg hover:text-blue-500">
                                {content.emoji} {content.title}
                              </h3>
                              <p className="text-gray-600">{content.preview}</p>
                            </a>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoveThis(content, index)}
                              className={`
                                group
                                ${
                                  likedItems.includes(index)
                                    ? "border-red-200 bg-red-50"
                                    : ""
                                }
                              `}
                            >
                              <Heart
                                className={`
                                  h-4 w-4 mr-1 transition-all duration-300
                                  ${
                                    likedItems.includes(index)
                                      ? "fill-red-500 stroke-red-500"
                                      : "stroke-gray-600"
                                  }
                                  ${
                                    animatingHearts.includes(index)
                                      ? "animate-pulse"
                                      : ""
                                  }
                                  group-hover:${
                                    likedItems.includes(index)
                                      ? "fill-red-600 stroke-red-600"
                                      : "stroke-red-500"
                                  }
                                `}
                              />
                              {likedItems.includes(index)
                                ? "Loved"
                                : "Love this"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLessLikeThis(content, index)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Not relevant
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    className="w-full bg-black text-white"
                    variant="outline"
                    onClick={handleSuggestMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding more suggestions...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Suggest more like this
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {/* Show the formatted newsletter first */}
            <div className="prose max-w-none p-4 border rounded-lg bg-white">
              {formData.newsletterSubject && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500">
                    Subject
                  </h3>
                  <p className="text-lg font-medium">
                    {formData.newsletterSubject}
                  </p>
                </div>
              )}

              {formData.newsletterBody && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">
                    Preview
                  </h3>
                  <div
                    className="mt-2 text-gray-600"
                    // Use dangerouslySetInnerHTML only if your AI returns HTML-formatted content
                    // Otherwise, use white-space: pre-wrap to preserve formatting
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {formData.newsletterBody}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback input below the preview */}
            <Textarea
              name="writingStyle"
              value={formData.writingStyle}
              onChange={handleInputChange}
              placeholder="How would you like to improve this? (e.g., 'Make it more casual', 'Add more details about...')"
              className="h-32"
            />

            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const userMessage: ChatMessage = {
                    role: "user",
                    content: formData.writingStyle,
                    timestamp: Date.now(),
                  };

                  const response = (await api.generateSuggestions({
                    action: "addWritingVoice",
                    content: JSON.stringify({
                      feedback: formData.writingStyle,
                      chatHistory: chatHistory,
                    }),
                  })) as NewsletterPreview;

                  const assistantMessage: ChatMessage = {
                    role: "assistant",
                    content: JSON.stringify(response),
                    timestamp: Date.now(),
                  };

                  setChatHistory((prev) => [
                    ...prev,
                    userMessage,
                    assistantMessage,
                  ]);

                  // Update the newsletter preview
                  setFormData((prev) => ({
                    ...prev,
                    writingStyle: "", // Clear the input
                    newsletterSubject: response.subject, // Update with new version
                    newsletterBody: response.body, // Update with new version
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
                  Generating...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </div>
        );
      case 3:
        console.log("Step 3 newsletter data:", {
          subject: formData.newsletterSubject,
          body: formData.newsletterBody,
        });
        return (
          <Select
            value={formData.frequency}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 4:
        console.log("Step 4 newsletter data:", {
          subject: formData.newsletterSubject,
          body: formData.newsletterBody,
        });
        // Add this function outside the JSX
        const handleEmailClick = () => {
          console.log("Email button clicked");
          try {
            const mailtoLink = `mailto:?subject=${encodeURIComponent(
              formData.newsletterSubject || ""
            )}&body=${encodeURIComponent(formData.newsletterBody || "")}`;
            console.log("Generated mailto link:", mailtoLink);
            window.location.href = mailtoLink;
          } catch (error) {
            console.error("Error generating email:", error);
          }
        };

        return (
          <div className="space-y-4">
            {/* Summary section */}
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

            {/* Newsletter Preview */}
            <div className="prose max-w-none p-4 border rounded-lg bg-white">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Subject</h3>
                <p className="text-lg font-medium">
                  {formData.newsletterSubject}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Preview</h3>
                <div
                  className="mt-2 text-gray-600"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {formData.newsletterBody}
                </div>
              </div>
            </div>

            {/* Email button */}
            <Button onClick={handleEmailClick} className="w-full" type="button">
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </Button>

            {/* Log the current values */}
            <div className="hidden">
              {console.log("Current formData:", formData)}
            </div>

            {feedback && (
              <Alert variant="success">
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const nextStep = async () => {
    // If moving from step 1 to step 2
    if (currentStep === 1 && formData.suggestedContent.length > 0) {
      setLoading(true);
      try {
        const response = (await api.generateSuggestions({
          action: "addWritingVoice",
          content: JSON.stringify({
            suggestions: formData.suggestedContent,
            understanding: formData.understanding,
          }),
        })) as NewsletterPreview;

        // Save the formatted newsletter
        setFormData((prev) => ({
          ...prev,
          newsletterSubject: response.subject,
          newsletterBody: response.body,
        }));
      } catch (error) {
        console.error("Error formatting newsletter:", error);
      } finally {
        setLoading(false);
      }
    }

    // Proceed to next step
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    setPreviewGenerated(false);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setPreviewGenerated(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Newsletter Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-1/4 h-2 rounded ${
                  step <= currentStep ? "bg-blue-500" : "bg-gray-200"
                } ${step < 4 ? "mr-1" : ""}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep} of 4:{" "}
            {currentStep === 1
              ? "Content Preferences"
              : currentStep === 2
              ? "Writing Style"
              : currentStep === 3
              ? "Frequency"
              : "Review & Test"}
          </p>
        </div>
        {renderStep()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={
            currentStep === 4 ||
            // (currentStep === 1 && formData.suggestedContent.length === 0) ||
            (currentStep === 3 && !formData.frequency)
          }
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default App;
