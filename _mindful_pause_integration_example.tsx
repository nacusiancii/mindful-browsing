/**
 * This shows how to integrate your MindfulPause component
 * with the background service communication
 */

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Leaf, Clock, Heart } from "lucide-react"

// Updated MindfulPause component with communication
export default function ConnectedMindfulPause() {
  const [breathCount, setBreatheCount] = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const [showContinue, setShowContinue] = useState(false)
  const [targetSite, setTargetSite] = useState("social media")
  const [tabId, setTabId] = useState<number | null>(null)
  const [intention, setIntention] = useState("")

  // Read URL parameters when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const target = urlParams.get('target')
    const tab = urlParams.get('tabId')
    
    if (target) setTargetSite(new URL(target).hostname)
    if (tab) setTabId(parseInt(tab))
  }, [])

  const handleContinue = async () => {
    if (!tabId || !targetSite) {
      console.error('Missing tabId or targetSite')
      return
    }

    try {
      // Send message to background to proceed to site
      const response = await chrome.runtime.sendMessage({
        action: 'proceedToSite',
        payload: {
          targetSite: `https://${targetSite}`,
          intention,
          tabId
        }
      })

      if (response.success) {
        console.log('Redirecting to site...')
      } else {
        console.error('Failed to redirect:', response.error)
      }
    } catch (error) {
      console.error('Error communicating with background:', error)
    }
  }

  const handleTakeBreak = async (breakActivity: string) => {
    if (!tabId || !targetSite) return

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'tookMindfulBreak',
        payload: {
          targetSite: `https://${targetSite}`,
          breakActivity,
          tabId
        }
      })

      if (response.success) {
        // Maybe close the tab or show a thank you message
        window.close()
      }
    } catch (error) {
      console.error('Error logging break:', error)
    }
  }

  // Rest of your existing component logic...
  // The breathing exercises, reflection questions, etc.
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xs">
        <CardContent className="p-12 text-center flex flex-col gap-8">
          {/* Your existing UI... */}
          
          {/* Add intention input when reflection shows */}
          {showReflection && (
            <div className="bg-blue-50/50 rounded-lg p-6">
              <h3 className="font-medium text-gray-700 mb-4">What's your intention?</h3>
              <textarea 
                className="w-full p-3 border rounded-md"
                placeholder="I want to check this site because..."
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
              />
            </div>
          )}

          {showContinue && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleContinue}
                disabled={!intention.trim()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Continue to {targetSite}
              </Button>
              
              <Button
                onClick={() => handleTakeBreak("chose not to visit")}
                variant="outline"
                className="px-8 py-3"
              >
                I'll come back later
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Usage in mindful-pause-main.tsx would need to be updated
// to use the connected component instead of the basic one