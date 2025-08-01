import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Leaf, Clock, Heart } from "lucide-react";
import { TruncatedUrl } from "../components/ui/truncated-url";

interface MindfulPauseProps {
  navigate: (page: string, params?: Record<string, string>) => void;
}
interface TimingSettings {
  pauseDuration: number; // in seconds
  reflectionDelay: number; // in seconds
}

export default function MindfulPause({ navigate }: MindfulPauseProps) {
  // Get URL parameters directly from the window location
  const urlParams = new URLSearchParams(window.location.search);
  const targetSite = urlParams.get("target") || "social media";
  const tabId = urlParams.get("tabId") || "";

  const onContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("intention-check", { target: targetSite, tabId });
  };
  const [timingSettings, setTimingSettings] = useState<TimingSettings | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const [breathCount, setBreatheCount] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    chrome.runtime
      .sendMessage({
        action: "getInitialData",
      })
      .then((response) => {
        if (response && response.settings) {
          setTimingSettings({
            pauseDuration: response.settings.pauseDuration || 15,
            reflectionDelay: response.settings.reflectionDelay || 30,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch settings:", error);
        // Fallback to default values
        setTimingSettings({
          pauseDuration: 15,
          reflectionDelay: 30,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || !timingSettings) return;

    // Convert seconds to milliseconds
    const reflectionDelayMs = timingSettings.reflectionDelay * 1000;
    const pauseDurationMs = timingSettings.pauseDuration * 1000;

    // Show reflection questions after reflectionDelay seconds
    const reflectionTimer = setTimeout(() => {
      setShowReflection(true);
    }, reflectionDelayMs);

    // Show continue button after pauseDuration seconds
    const continueTimer = setTimeout(() => {
      setShowContinue(true);
    }, pauseDurationMs);

    return () => {
      clearTimeout(reflectionTimer);
      clearTimeout(continueTimer);
    };
  }, [isLoading, timingSettings]);

  const handleBreathe = () => {
    setBreatheCount((prev) => prev + 1);
    if (breathCount >= 2) {
      // If user completes 3 breaths, show reflection and continue earlier
      setShowReflection(true);
      // Show continue button earlier based on timing settings
      const earlyContinueDelay = timingSettings
        ? (timingSettings.pauseDuration / 2) * 1000
        : 15000;
      setTimeout(() => setShowContinue(true), earlyContinueDelay);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xs">
        <CardContent className="p-12 text-center flex flex-col gap-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Loading mindful pause settings...</p>
            </div>
          ) : (
            <>
              {/* Animated Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 animate-pulse rounded-full bg-blue-200 opacity-20"
                    style={{ animationDuration: "3s" }}
                  ></div>
                  <div className="relative bg-blue-100 p-6 rounded-full">
                    <Leaf className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="flex flex-col gap-4 animate-fade-in">
                <h1 className="text-3xl font-light text-gray-800">
                  Take a mindful moment
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  You were about to visit{" "}
                  <TruncatedUrl
                    url={targetSite}
                    className="font-medium text-blue-600"
                  />
                  .
                  <br />
                  Let's pause and check in with yourself first.
                </p>
              </div>

              {/* Breathing Exercise */}
              <div className="flex flex-col items-center gap-6 animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">Take three deep breaths</span>
                </div>

                <Button
                  onClick={handleBreathe}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 bg-transparent"
                >
                  Breathe {breathCount > 0 && `(${breathCount}/3)`}
                </Button>
              </div>

              {/* Reflection Questions */}
              {showReflection && (
                <div className="bg-blue-50/50 rounded-lg p-6 flex flex-col gap-3 animate-fade-in">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Gentle reflection:
                  </h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <p>• How are you feeling right now?</p>
                    <p>• What brought you here in this moment?</p>
                    <p>• Is this aligned with your intentions for today?</p>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              {showContinue && (
                <div className="pt-4 animate-fade-in">
                  <Button
                    onClick={onContinue}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                </div>
              )}

              {!showContinue && (
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
                  <span>Taking a mindful pause...</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
