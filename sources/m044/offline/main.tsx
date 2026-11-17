import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PoetryGame from "../app/poetry-game";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <PoetryGame />
  </StrictMode>,
);
