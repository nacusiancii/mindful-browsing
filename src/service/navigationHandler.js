import { getState } from "./storage";

const addNavListener = ()=> chrome.webNavigation.onBeforeNavigate.addListener(
    handleNav,
    {url:[{schemes:["http","https"]}]}
);

const handleNav = async (details) => {
 if (details.frameId !== 0) return; // Ignore sub-frames

 const { settings, mindfulSites = [] } = await getState([
   'settings', 'mindfulSites'
 ]);

 if (!settings?.enabled) return;

 try {
   const url = new URL(details.url);
   const isMindfulSite = mindfulSites.some(site => url.hostname.includes(site));

   if (isMindfulSite) {
     const pauseUrl = chrome.runtime.getURL('mindful-pause.html');
     const redirectUrl = `${pauseUrl}?target=${encodeURIComponent(details.url)}&tabId=${details.tabId}`;
     chrome.tabs.update(details.tabId, { url: redirectUrl });
   }
 } catch (error) {
   console.error('Error handling navigation:', error);
 }
}

export default addNavListener;