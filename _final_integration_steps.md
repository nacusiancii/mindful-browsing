# Final Integration Steps

## What's Working ✅
- Navigation handler redirects to mindful-pause.html with params
- MindfulPause reads URL params and navigates to intention-check
- Message handlers are ready in background service

## What's Missing 🔧

### 1. Update IntentionCheck to read URL params
```typescript
// In intention-check.tsx
import { useSearchParams } from "react-router-dom";

const [searchParams] = useSearchParams();
const targetSite = searchParams.get('targetSite') || "social media";
const tabId = searchParams.get('tabId');
```

### 2. Add Chrome API types
Create `src/vite-env.d.ts` or add to existing:
```typescript
/// <reference types="vite/client" />

interface Chrome {
  runtime: {
    sendMessage: (message: any) => Promise<any>;
  };
}

declare const chrome: Chrome;
```

### 3. Connect IntentionCheck handlers
Replace the placeholder handlers in intention-check.tsx:

```typescript
const handleProceed = async () => {
  if (!reason.trim() || !tabId || !targetSite) return;
  
  const response = await chrome.runtime.sendMessage({
    action: 'proceedToSite',
    payload: {
      targetSite: decodeURIComponent(targetSite),
      intention: reason,
      tabId: parseInt(tabId)
    }
  });
  
  if (response.success) {
    // Background will handle redirect
  }
};

const handleBreak = async (activity: string) => {
  if (!tabId || !targetSite) return;
  
  const response = await chrome.runtime.sendMessage({
    action: 'tookMindfulBreak',
    payload: {
      targetSite: decodeURIComponent(targetSite),
      breakActivity: activity,
      tabId: parseInt(tabId)
    }
  });
  
  if (response.success) {
    window.close(); // Close the extension page
  }
};

const handleCancel = () => {
  window.close(); // Close the extension page
};
```

### 4. Update the JSX to use real handlers
```typescript
<Button onClick={handleProceed} disabled={!reason.trim()}>
  Continue with this intention
</Button>

<Button onClick={() => handleBreak(breakOption.label)}>
  {breakOption.label}
</Button>

<Button onClick={handleCancel}>
  Close and stay on current page
</Button>
```

## Complete Flow Test
1. Visit a mindful site → gets redirected to mindful-pause
2. Click Continue → goes to intention-check
3. Enter reason → click Continue → background redirects to original site
4. OR choose break → background logs activity → tab closes