import React, { useState } from "react";
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
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function App(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    interests: "",
    suggestedContent: [],
    writingStyle: "",
    frequency: "",
    selectedStyleId: null,
  });
  const [loading, setLoading] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stylePreviews, setStylePreviews] = useState([]);

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newSuggestedContent = [
      {
        title: "The Ultimate Guide to Urban Gardening",
        preview:
          "Transform any space into a thriving garden! From tiny balconies to windowsills, learn how to grow fresh herbs & veggies in urban spaces. Perfect for beginners wanting to join the urban farming revolution.",
        link: "/urban-gardening-guide",
        emoji: "🌱",
      },
      {
        title: "10 Must-Read Books for Tech Enthusiasts",
        preview:
          "Curated for both beginners & veterans: from AI ethics to quantum computing. These game-changing books will reshape how you think about technology's future. Features recommendations from top tech leaders.",
        link: "/tech-books-2024",
        emoji: "📚",
      },
      {
        title: "Latest Developments in Renewable Energy",
        preview:
          "Breakthrough innovations making clean energy more accessible & affordable. Discover how new solar tech, wind power advances & energy storage solutions are accelerating our sustainable future.",
        link: "/renewable-energy-updates",
        emoji: "⚡",
      },
    ];

    setFormData((prev) => {
      const updated = {
        ...prev,
        suggestedContent: newSuggestedContent,
      };
      console.log("Updated formData:", updated); // Debug log
      return updated;
    });

    setPreviewGenerated(true);
    setLoading(false);
  };

  const sendTestNewsletter = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFeedback("Test newsletter sent successfully! Check your inbox.");
    setLoading(false);
  };

  const generateStylePreviews = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStylePreviews([
      {
        id: 1,
        style: "Witty and Clever",
        preview: `🎭 Well, well, well... look who's diving into the world of urban gardening!...`,
      },
      {
        id: 2,
        style: "Professional and Insightful",
        preview: `📊 Urban Gardening: A Modern Approach to Sustainable Living

                 As urban spaces continue to evolve, the integration of natural elements becomes increasingly vital. This week's carefully curated selection explores innovative approaches to incorporating greenery into your living space.

                 Featured Articles:
                 - "Strategic Planning for Optimal Indoor Gardens: A Data-Driven Approach"
                 - "Maximizing Yield in Limited Spaces: Expert Insights and Analysis"`,
      },
      {
        id: 3,
        style: "Friendly and Casual",
        preview: `🌿 Hey plant friends!

                 Ready to get your hands dirty? We've got some super fun gardening ideas that'll work even in the tiniest spaces. Trust me, if I can keep plants alive in my tiny apartment, you totally can too!

                 Check these out:
                 - "Super Easy Plants That Are Pretty Much Unkillable" (yes, really!)
                 - "Weekend Project: Create Your Own Mini Herb Garden"`,
      },
    ]);
    setPreviewGenerated(true);
    setLoading(false);
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
              placeholder="What are you into? What topics would you want to follow? What content you'd like to see..."
              className="h-32"
            />
            <Button
              onClick={generateSuggestions}
              disabled={loading}
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
                "Generate Content Suggestions"
              )}
            </Button>
            {formData.suggestedContent.length > 0 && (
              <div className="mt-4 space-y-4">
                <p>
                  Here are some content suggestions based on your interests. Do
                  they resonate with you?
                </p>
                <div className="space-y-4">
                  {formData.suggestedContent.map((content, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <h3 className="font-medium text-lg mb-2">
                        {content.emoji} {content.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{content.preview}</p>
                      <a
                        href={content.link}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 Read more
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Describe your preferred writing style:</Label>
              <Textarea
                name="writingStyle"
                value={formData.writingStyle}
                onChange={handleInputChange}
                placeholder="Example: 'witty and clever' or 'professional and insightful'"
                className="h-24"
              />
              <Button
                onClick={generateStylePreviews}
                disabled={loading || !formData.writingStyle}
                className="w-full mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {previewGenerated ? "Sending Feedback..." : "Generating..."}
                  </>
                ) : previewGenerated ? (
                  "Send Feedback"
                ) : (
                  "Generate Style Previews"
                )}
              </Button>
            </div>

            {stylePreviews.length > 0 && (
              <Card className="p-4">
                Okay, here's what I've got for you. Anything you like?
                <CardHeader>
                  <CardTitle>Preview Styles</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.selectedStyleId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedStyleId: value,
                      }))
                    }
                    className="space-y-6"
                  >
                    {stylePreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className={`relative p-4 rounded-lg border ${
                          formData.selectedStyleId === preview.id.toString()
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={preview.id.toString()}
                            id={`style-${preview.id}`}
                          />
                          <Label
                            htmlFor={`style-${preview.id}`}
                            className="font-medium"
                          >
                            {preview.style}
                          </Label>
                        </div>
                        <div className="mt-4 pl-6 whitespace-pre-line text-sm text-gray-600">
                          {preview.preview}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 3:
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
            <Button
              onClick={sendTestNewsletter}
              disabled={loading}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Newsletter
            </Button>
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

  const nextStep = () => {
    // Validate current step before allowing progression
    if (currentStep === 1 && formData.suggestedContent.length === 0) {
      return; // Don't proceed if no content has been generated
    }
    if (currentStep === 2 && !formData.selectedStyleId) {
      return; // Don't proceed if no style has been selected
    }
    if (currentStep === 3 && !formData.frequency) {
      return; // Don't proceed if no frequency selected
    }

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
            (currentStep === 1 && formData.suggestedContent.length === 0) ||
            (currentStep === 2 && stylePreviews.length === 0) ||
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
