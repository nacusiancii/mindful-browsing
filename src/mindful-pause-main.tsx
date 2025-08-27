import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import IntentionCheck from "./pages/intention-check";
import MindfulPause from "./pages/mindful-pause";

// Simple state-based navigation
type Page = "mindful-pause" | "intention-check";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("mindful-pause");
  const [navigationParams, setNavigationParams] = useState<
    Record<string, string>
  >({});

  const navigate = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page as Page);
    setNavigationParams(params);
  };

  return (
    <>
      {currentPage === "mindful-pause" && <MindfulPause navigate={navigate} />}
      {currentPage === "intention-check" && (
        <IntentionCheck navigate={navigate} params={navigationParams} />
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
