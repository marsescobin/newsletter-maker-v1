import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Heart, ThumbsDown } from "lucide-react";

function Step1({
  formData,
  handleInputChange,
  generateSuggestions,
  loading,
  previewGenerated,
  formData,
  handleLoveThis,
  handleLessLikeThis,
  handleSuggestMore,
  loadingItemId,
  likedItems,
  animatingHearts,
  isLoadingMore,
}) {
  return (
    <div className="space-y-4">
      {!loading && (
        <Textarea
          name="interests"
          value={formData.interests}
          onChange={handleInputChange}
          placeholder="What are you into? What content would you like to see..."
          className="h-32"
        />
      )}
      <Button
        onClick={generateSuggestions}
        disabled={loading || !formData.interests.trim()}
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
          "Generate Content"
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
                        {likedItems.includes(index) ? "Loved" : "Love this"}
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
              className="w-full "
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
}

export default Step1;
