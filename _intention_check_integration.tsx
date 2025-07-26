/**
 * How to integrate IntentionCheck with background service
 * This shows the missing communication pieces
 */

// In intention-check.tsx, you need to add:

import { useSearchParams } from "react-router-dom";

export default function ConnectedIntentionCheck() {
  const [searchParams] = useSearchParams();
  const targetSite = searchParams.get('targetSite') || "social media";
  const tabId = searchParams.get('tabId');

  const handleProceed = async (reason: string) => {
    if (!tabId || !targetSite) {
      console.error('Missing tabId or targetSite');
      return;
    }

    try {
      // Send message to background to proceed to site
      const response = await chrome.runtime.sendMessage({
        action: 'proceedToSite',
        payload: {
          targetSite: decodeURIComponent(targetSite),
          intention: reason,
          tabId: parseInt(tabId)
        }
      });

      if (response.success) {
        console.log('Successfully redirected to site');
        // The background service will handle the redirect
      } else {
        console.error('Failed to redirect:', response.error);
      }
    } catch (error) {
      console.error('Error communicating with background:', error);
    }
  };

  const handleBreak = async (activity: string) => {
    if (!tabId || !targetSite) return;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'tookMindfulBreak',
        payload: {
          targetSite: decodeURIComponent(targetSite),
          breakActivity: activity,
          tabId: parseInt(tabId)
        }
      });

      if (response.success) {
        console.log('Break activity logged');
        // Close the tab or navigate away
        window.close();
      }
    } catch (error) {
      console.error('Error logging break:', error);
    }
  };

  const handleCancel = () => {
    // User chose to stay on current page
    window.close();
  };

  // Your existing JSX would use these handlers:
  // <Button onClick={() => handleProceed(reason)}>Continue</Button>
  // <Button onClick={() => handleBreak(breakOption.label)}>Take Break</Button>
  // <Button onClick={handleCancel}>Cancel</Button>
}