import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  Leaf,
  Settings,
  BarChart3,
  Heart,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ActivityLogItem } from "../default";

// Define types for our data
type ActivityItem = {
  site: string;
  action: string;
  time: string;
};

type Stats = {
  pauses: number;
  mindfulChoices: number;
  breaksChosen: number;
};

type InitialData = {
  settings?: {
    enabled: boolean;
  };
  activityLog?: ActivityLogItem[];
};

export default function Popup() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [todayStats, setTodayStats] = useState<Stats>({
    pauses: 0,
    mindfulChoices: 0,
    breaksChosen: 0,
  });
  const [recentSites, setRecentSites] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Fetch initial data when popup opens
    chrome.runtime
      .sendMessage({
        action: "getInitialData",
      })
      .then((data: InitialData) => {
        if (data && data.settings) {
          setIsEnabled(data.settings.enabled);
        }

        // Process activity log for stats and recent activity
        if (data && data.activityLog) {
          // Calculate today's stats
          const today = new Date().toDateString();
          let pauses = 0;
          let mindfulChoices = 0;
          let breaksChosen = 0;

          // Filter today's activities
          const todayActivities = data.activityLog.filter((activity) => {
            const activityDate = new Date(activity.timestamp).toDateString();
            return activityDate === today;
          });

          // Count different types of activities
          todayActivities.forEach((activity) => {
            if (activity.action === "took_pause") {
              pauses++;
            } else if (activity.action === "continued_mindfully") {
              mindfulChoices++;
            } else if (activity.action === "took_break") {
              breaksChosen++;
            }
          });

          // Update stats state
          setTodayStats({
            pauses,
            mindfulChoices,
            breaksChosen,
          });

          // Process recent activity for display (last 3 activities)
          const recent = data.activityLog
            .slice(0, 3)
            .map((activity: ActivityLogItem) => {
              // Format time ago
              const now = Date.now();
              const diffMs = now - activity.timestamp;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);

              let timeAgo;
              if (diffMins < 1) {
                timeAgo = "just now";
              } else if (diffMins < 60) {
                timeAgo = `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
              } else if (diffHours < 24) {
                timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
              } else {
                timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
              }

              return {
                site: activity.site,
                action:
                  activity.action === "continued_mindfully"
                    ? "continued mindfully"
                    : activity.action === "took_break"
                    ? `chose to ${activity.breakActivity || "take a break"}`
                    : activity.action === "took_pause"
                    ? "took a mindful pause"
                    : activity.action,
                time: timeAgo,
              };
            });

          setRecentSites(recent);
        }
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
      });
  }, []);

  return (
    <div className="w-80 bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Leaf className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">
                  Mindful Browsing
                </h1>
                <p className="text-xs text-gray-500">Stay present online</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isEnabled ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {isEnabled ? "Active" : "Paused"}
              </span>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                setIsEnabled(checked);
                // Save the enabled state
                chrome.runtime
                  .sendMessage({
                    action: "saveState",
                    payload: {
                      settings: {
                        enabled: checked,
                      },
                    },
                  })
                  .catch((error) => {
                    console.error("Error saving state:", error);
                  });
              }}
            />
          </div>

          {/* Today's Stats */}
          <div className="bg-white/60 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Today's Mindfulness
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-blue-600">
                  {todayStats.pauses}
                </div>
                <div className="text-xs text-gray-500">Pauses</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-green-600">
                  {todayStats.mindfulChoices}
                </div>
                <div className="text-xs text-gray-500">Continues</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-purple-600">
                  {todayStats.breaksChosen}
                </div>
                <div className="text-xs text-gray-500">Breaks</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/60 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Recent Activity
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {recentSites.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span className="text-gray-600">{item.site}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-700">{item.action}</div>
                    <div className="text-gray-400">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs bg-transparent"
              onClick={() => {
                // Open mindful pause page in a new tab
                chrome.tabs.create({
                  url: chrome.runtime.getURL("mindful-pause.html"),
                });
              }}
            >
              <Heart className="h-3 w-3 mr-2" />
              Take a mindful break now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs bg-transparent"
              onClick={() => {
                // Open options page
                chrome.tabs.create({
                  url: chrome.runtime.getURL("options.html"),
                });
              }}
            >
              <Sparkles className="h-3 w-3 mr-2" />
              View full dashboard
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Breathe. Reflect. Choose mindfully.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
