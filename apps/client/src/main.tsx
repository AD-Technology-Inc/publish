import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/app.css";
import App from "./App.tsx";
import { initializeTheme } from "./hooks/use-appearance";

// Initialize theme on load
initializeTheme();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
