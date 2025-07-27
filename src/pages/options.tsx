import { useState, useEffect, type ComponentType } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Slider } from "../components/ui/slider";
import {
  Leaf,
  Plus,
  X,
  Save,
  RotateCcw,
  Globe,
  Clock,
  Heart,
  Brain,
  Sparkles,
  Coffee,
  Book,
  TreePine,
  type LucideIcon,
} from "lucide-react";

import { defaultState, type MindfulBreak, type Settings } from "../default.js";

type MindfulBreakWithIcon = MindfulBreak & {
  icon: LucideIcon;
};
export default function Options() {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [pauseDuration, setPauseDuration] = useState([30]);
  const [reflectionDelay, setReflectionDelay] = useState([30]);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [mindfulBreaks, setMindfulBreaks] = useState<MindfulBreakWithIcon[]>(
    []
  );

  const getIconForBreak = (id: string) => {
    const iconMap: Record<string, ComponentType> = {
      meditate: Sparkles,
      walk: TreePine,
      tea: Coffee,
      read: Book,
      organize: Sparkles,
      todos: Clock,
      projects: Book,
      connect: Heart,
    };
    return iconMap[id] || Book;
  };

  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    showStats: true,
    gentleReminders: true,
    soundEnabled: false,
    darkMode: false,
    pauseDuration: 30, // in seconds
    reflectionDelay: 20, // in seconds
  });

  useEffect(() => {
    // Load existing settings when component mounts
    chrome.runtime
      .sendMessage({
        action: "getInitialData",
      })
      .then((data) => {
        if (data) {
          // Map data to component state
          if (data.mindfulSites) {
            setBlockedSites(data.mindfulSites);
          }

          if (data.settings) {
            // Map timing settings

            // Map general settings
            setSettings({
              enabled:
                data.settings.enabled !== undefined
                  ? data.settings.enabled
                  : true,
              showStats:
                data.settings.showStats !== undefined
                  ? data.settings.showStats
                  : true,
              gentleReminders:
                data.settings.gentleReminders !== undefined
                  ? data.settings.gentleReminders
                  : true,
              soundEnabled:
                data.settings.soundEnabled !== undefined
                  ? data.settings.soundEnabled
                  : false,
              darkMode:
                data.settings.darkMode !== undefined
                  ? data.settings.darkMode
                  : false,
              pauseDuration:
                data.settings.pauseDuration !== undefined
                  ? data.settings.pauseDuration
                  : 30,
              reflectionDelay:
                data.settings.reflectionDelay !== undefined
                  ? data.settings.reflectionDelay
                  : 20,
            });
          }

          if (data.reflectionPrompts) {
            setCustomPrompts(data.reflectionPrompts);
          }

          if (data.mindfulBreaks) {
            // Map mindful breaks data to component state
            setMindfulBreaks(
              data.mindfulBreaks.map((opt: MindfulBreak) => ({
                ...opt,
                icon: getIconForBreak(opt.id), // Assign icon based on id
              }))
            );
          }
        }
      })
      .catch((error) => {
        console.error("Error loading settings:", error);
        // Initialize with default values if loading fails
        initializeWithDefaults();
      });
  }, []);

  const initializeWithDefaults = () => {
    // Initialize with default values
    setBlockedSites([
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "youtube.com",
    ]);
    setCustomPrompts([
      "How are you feeling right now?",
      "What brought you here in this moment?",
      "Is this aligned with your intentions for today?",
    ]);
  };

  const saveSettings = () => {
    // Map component state to extension state structure
    const extensionState = {
      mindfulSites: blockedSites,
      settings: {
        enabled: settings.enabled,
        pauseDuration: pauseDuration[0],
        reflectionDelay: reflectionDelay[0],
        showStats: settings.showStats,
        gentleReminders: settings.gentleReminders,
        soundEnabled: settings.soundEnabled,
        darkMode: settings.darkMode,
      },
      reflectionPrompts: customPrompts,
      mindfulBreaks: mindfulBreaks,
    };

    // Save settings to chrome.storage
    chrome.runtime
      .sendMessage({
        action: "saveState",
        payload: extensionState,
      })
      .then((response) => {
        if (response && response.success) {
          console.log("Settings saved successfully");
          // Show success message to user
          alert("Settings saved successfully!");
        } else {
          console.error("Failed to save settings:", response?.error);
          // Show error message to user
          alert("Failed to save settings. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error saving settings:", error);
        // Show error message to user
        alert("Error saving settings. Please try again.");
      });
  };

  const resetToDefaults = () => {
    // Reset to default values
    setBlockedSites(defaultState.mindfulSites);
    setPauseDuration([defaultState.settings.pauseDuration]);
    setReflectionDelay([defaultState.settings.reflectionDelay]);
    setCustomPrompts(defaultState.reflectionPrompts);
    setMindfulBreaks((prevBreaks) =>
      prevBreaks.map((breakOption) => {
        const defaultBreak = defaultState.mindfulBreaks.find(
          (b: { id: string; enabled: boolean }) => b.id === breakOption.id
        );
        return defaultBreak
          ? { ...breakOption, enabled: defaultBreak.enabled }
          : breakOption;
      })
    );
    setSettings({
      enabled: defaultState.settings.enabled,
      showStats: defaultState.settings.showStats,
      gentleReminders: defaultState.settings.gentleReminders,
      soundEnabled: defaultState.settings.soundEnabled,
      darkMode: defaultState.settings.darkMode,
      pauseDuration: defaultState.settings.pauseDuration,
      reflectionDelay: defaultState.settings.reflectionDelay,
    });
  };

  const toggleBreak = (id: string) => {
    setMindfulBreaks((prevBreaks) =>
      prevBreaks.map((breakOption) =>
        breakOption.id === id
          ? { ...breakOption, enabled: !breakOption.enabled }
          : breakOption
      )
    );
  };

  const addSite = () => {
    if (newSite.trim() && !blockedSites.includes(newSite.trim())) {
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite("");
    }
  };

  const removeSite = (site: string) => {
    setBlockedSites(blockedSites.filter((s) => s !== site));
  };

  const addPrompt = () => {
    if (newPrompt.trim() && !customPrompts.includes(newPrompt.trim())) {
      setCustomPrompts([...customPrompts, newPrompt.trim()]);
      setNewPrompt("");
    }
  };

  const removePrompt = (prompt: string) => {
    setCustomPrompts(customPrompts.filter((p) => p !== prompt));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Leaf className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-gray-800">
            Mindful Browsing Settings
          </h1>
          <p className="text-gray-600">
            Customize your mindful browsing experience
          </p>
        </div>

        <Tabs defaultValue="sites" className="flex flex-col gap-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60">
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Sites</span>
            </TabsTrigger>
            <TabsTrigger value="timing" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Timing</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Breaks</span>
            </TabsTrigger>
          </TabsList>

          {/* Sites Tab */}
          <TabsContent value="sites">
            <Card className="bg-white/80 backdrop-blur-xs border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>Mindful Sites</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose which websites will trigger the mindful pause
                  experience
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label>Add new site</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="example.com"
                      value={newSite}
                      onChange={(e) => setNewSite(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSite()}
                    />
                    <Button onClick={addSite} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Your mindful sites ({blockedSites.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {blockedSites.map((site) => (
                      <Badge
                        key={site}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {site}
                        <X
                          className="h-3 w-3 ml-2 cursor-pointer hover:text-red-500"
                          onClick={() => removeSite(site)}
                        />
                      </Badge>
                    ))}
                  </div>
                  {blockedSites.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No sites added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing">
            <Card className="bg-white/80 backdrop-blur-xs border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Timing Settings</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Adjust the timing of your mindful pause experience
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>
                    Minimum pause duration: {pauseDuration[0]} seconds
                  </Label>
                  <Slider
                    value={pauseDuration}
                    onValueChange={setPauseDuration}
                    max={120}
                    min={15}
                    step={15}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    How long before the continue button appears
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Label>
                    Reflection prompt delay: {reflectionDelay[0]} seconds
                  </Label>
                  <Slider
                    value={reflectionDelay}
                    onValueChange={setReflectionDelay}
                    max={60}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    When to show reflection questions after breathing exercise
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts">
            <Card className="bg-white/80 backdrop-blur-xs border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>Reflection Prompts</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Customize the questions that help you reflect during the pause
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label>Add custom prompt</Label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="What question would help you reflect?"
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button onClick={addPrompt} size="sm" className="self-end">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Your reflection prompts</Label>
                  <div className="flex flex-col gap-2">
                    {customPrompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-blue-50/50 rounded-lg"
                      >
                        <p className="text-sm text-gray-700 flex-1">
                          • {prompt}
                        </p>
                        <X
                          className="h-4 w-4 cursor-pointer hover:text-red-500 ml-2 shrink-0"
                          onClick={() => removePrompt(prompt)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breaks Tab */}
          <TabsContent value="breaks">
            <Card className="bg-white/80 backdrop-blur-xs border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <span>Mindful Breaks</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Choose which nourishing activities to suggest as alternatives
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {mindfulBreaks.map((breakOption) => {
                    const Icon = breakOption.icon;
                    return (
                      <div
                        key={breakOption.id}
                        className="flex items-center justify-between p-4 bg-blue-50/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">
                            {breakOption.label}
                          </span>
                        </div>
                        <Switch
                          checked={breakOption.enabled}
                          onCheckedChange={() => toggleBreak(breakOption.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* General Settings */}
        <Card className="bg-white/80 backdrop-blur-xs border-0 shadow-md">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label>Extension enabled</Label>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show daily stats</Label>
                <Switch
                  checked={settings.showStats}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showStats: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Gentle reminders</Label>
                <Switch
                  checked={settings.gentleReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, gentleReminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sound notifications</Label>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, soundEnabled: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="px-6 bg-transparent"
            onClick={resetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            className="px-6 bg-blue-600 hover:bg-blue-700"
            onClick={saveSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
