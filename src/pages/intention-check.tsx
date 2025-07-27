import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import {
  Sparkles,
  Coffee,
  Book,
  TreePine,
  ArrowRight,
  X,
  Clock,
  Heart,
} from "lucide-react";

interface IntentionCheckProps {
  navigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function IntentionCheck({
  navigate,
  params,
}: IntentionCheckProps) {
  console.log(navigate, params);
  const targetSite = params.target || "";
  const tabId = params.tabId || "";

  const [reason, setReason] = useState("");
  const [selectedBreak, setSelectedBreak] = useState("");
  console.log(selectedBreak);

  // Log pause event when component mounts
  useEffect(() => {
    if (tabId && targetSite) {
      chrome.runtime
        .sendMessage({
          action: "logPause",
          payload: {
            site: decodeURIComponent(targetSite),
            timestamp: Date.now(),
            tabId: parseInt(tabId),
          },
        })
        .catch((error) => console.error("Error logging pause:", error));
    }
  }, [tabId, targetSite]);

  const mindfulBreaks = [
    {
      id: "meditate",
      label: "Meditate",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "walk",
      label: "Take a walk",
      icon: TreePine,
      color: "bg-green-100 text-green-700",
    },
    {
      id: "tea",
      label: "Make tea/coffee",
      icon: Coffee,
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "read",
      label: "Read something",
      icon: Book,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "organize",
      label: "Organize space",
      icon: Sparkles,
      color: "bg-teal-100 text-teal-700",
    },
    {
      id: "todos",
      label: "Check todos",
      icon: Clock,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: "projects",
      label: "Review old projects",
      icon: Book,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "connect",
      label: "Connect with loved ones",
      icon: Heart,
      color: "bg-rose-100 text-rose-700",
    },
  ];

  const handleProceed = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (reason.trim() && tabId && targetSite) {
      chrome.runtime
        .sendMessage({
          action: "proceedToSite",
          payload: {
            targetSite: decodeURIComponent(targetSite),
            intention: reason,
            tabId: parseInt(tabId),
          },
        })
        .catch((error) => console.error("Error proceeding to site:", error));
    }
  };

  const handleBreak = (activity: string) => {
    setSelectedBreak(activity);
    chrome.runtime
      .sendMessage({
        action: "tookMindfulBreak",
        payload: {
          targetSite: decodeURIComponent(targetSite ?? ""),
          breakActivity: activity,
          tabId: parseInt(tabId ?? "-1"),
        },
      })
      .then(() => window.close())
      .catch((error) => {
        console.error("Error logging break:", error);
        window.close();
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 backdrop-blur-xs">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-gray-800">
            What's your intention?
          </CardTitle>
          <p className="text-gray-600 mt-2">
            You're about to visit{" "}
            <span className="font-medium text-indigo-600">{targetSite}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Reason Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2 text-indigo-500" />
              Why do you want to visit this site right now?
            </h3>
            <Textarea
              placeholder="I want to check... / I need to... / I'm looking for..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] border-2 border-gray-200 focus:border-indigo-300 resize-none"
            />
            <Button
              onClick={handleProceed}
              disabled={!reason.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with this intention
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                or choose a mindful break instead
              </span>
            </div>
          </div>

          {/* Mindful Breaks */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 text-center">
              What would nourish you right now?
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {mindfulBreaks.map((breakOption) => {
                const Icon = breakOption.icon;
                return (
                  <Button
                    key={breakOption.id}
                    onClick={() => handleBreak(breakOption.label)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                  >
                    <div className={`p-2 rounded-full ${breakOption.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">
                      {breakOption.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Cancel Option */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={window.close}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Close tab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
