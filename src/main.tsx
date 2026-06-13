import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Solitaire from "./Solitaire/Solitaire";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <div className="solitaire-app">
            <Solitaire />
        </div>
    </StrictMode>,
);
