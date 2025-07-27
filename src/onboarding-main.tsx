import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Onboarding from "./pages/onboarding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Onboarding />
  </StrictMode>
);
