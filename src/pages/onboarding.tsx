import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Leaf, Shield, Heart, Brain, Plus, X, ArrowRight, Check } from "lucide-react"

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [blockedSites, setBlockedSites] = useState<string[]>([])
  const [newSite, setNewSite] = useState("")

  const commonSites = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "tiktok.com",
    "youtube.com",
    "reddit.com",
    "linkedin.com",
    "snapchat.com",
  ]

  const steps = [
    {
      title: "Welcome to Mindful Browsing",
      subtitle: "Transform your digital habits with intention",
      content: (
        <div className="flex flex-col gap-6 text-center">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-8 rounded-full">
              <Leaf className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-lg text-gray-600 leading-relaxed">
              This extension helps you pause before visiting distracting websites, giving you a moment to reflect and
              choose mindfully.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center gap-2 p-4">
                <Shield className="h-8 w-8 text-blue-500" />
                <h3 className="font-medium">Gentle Intervention</h3>
                <p className="text-sm text-gray-500 text-center">Pause before mindless browsing</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <Heart className="h-8 w-8 text-green-500" />
                <h3 className="font-medium">Mindful Reflection</h3>
                <p className="text-sm text-gray-500 text-center">Check in with your intentions</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <Brain className="h-8 w-8 text-purple-500" />
                <h3 className="font-medium">Conscious Choice</h3>
                <p className="text-sm text-gray-500 text-center">Choose what truly serves you</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Choose Your Mindful Sites",
      subtitle: "Select websites where you'd like a mindful pause",
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-gray-600 text-center">
            These are sites where you'll get a gentle reminder to pause and reflect before browsing.
          </p>

          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-gray-700">Common sites:</h3>
            <div className="flex flex-wrap gap-2">
              {commonSites.map((site) => (
                <Badge
                  key={site}
                  variant={blockedSites.includes(site) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 hover:bg-blue-50"
                  onClick={() => {
                    if (blockedSites.includes(site)) {
                      setBlockedSites(blockedSites.filter((s) => s !== site))
                    } else {
                      setBlockedSites([...blockedSites, site])
                    }
                  }}
                >
                  {site}
                  {blockedSites.includes(site) && <Check className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-gray-700">Add custom site:</h3>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSite.trim()) {
                    setBlockedSites([...blockedSites, newSite.trim()])
                    setNewSite("")
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newSite.trim()) {
                    setBlockedSites([...blockedSites, newSite.trim()])
                    setNewSite("")
                  }
                }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {blockedSites.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-gray-700">Your mindful sites:</h3>
              <div className="flex flex-wrap gap-2">
                {blockedSites.map((site) => (
                  <Badge key={site} variant="secondary" className="px-3 py-1">
                    {site}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500"
                      onClick={() => setBlockedSites(blockedSites.filter((s) => s !== site))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "You're All Set!",
      subtitle: "Start your mindful browsing journey",
      content: (
        <div className="flex flex-col gap-6 text-center">
          <div className="flex justify-center">
            <div className="bg-green-100 p-8 rounded-full">
              <Check className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-lg text-gray-600">
              Perfect! You've set up {blockedSites.length} sites for mindful browsing.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 flex flex-col gap-3">
              <h3 className="font-medium text-gray-700">What happens next:</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-600 text-left">
                <p>• When you visit these sites, you'll see a gentle pause screen</p>
                <p>• Take a moment to breathe and reflect on your intentions</p>
                <p>• Choose to continue mindfully or take a nourishing break instead</p>
                <p>• You can always adjust your settings later</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Remember: This isn't about restriction, it's about conscious choice.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save mindful sites when onboarding is completed
      chrome.runtime.sendMessage({
        action: 'saveState',
        payload: {
          mindfulSites: blockedSites
        }
      }).then(() => {
        console.log('Mindful sites saved successfully');
        window.close();
      }).catch((error) => {
        console.error('Error saving mindful sites:', error);
        window.close();
      });
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const canProceed = currentStep !== 1 || blockedSites.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg border-0 bg-white/90 backdrop-blur-xs">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-light text-gray-800">{steps[currentStep].title}</CardTitle>
          <p className="text-gray-600 mt-2">{steps[currentStep].subtitle}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <div className="min-h-[400px]">{steps[currentStep].content}</div>

          <div className="flex justify-between pt-6 border-t border-gray-100">
            <Button onClick={prevStep} variant="outline" disabled={currentStep === 0} className="px-6 bg-transparent">
              Back
            </Button>

            <Button onClick={nextStep} disabled={!canProceed} className="px-6 bg-blue-600 hover:bg-blue-700">
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
