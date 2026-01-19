import type { PlasmoCSConfig } from "plasmo";
import { analyzeBias } from "./api";
import { showButton, hideButton, updateButtonPosition, setButtonLoading, setButtonSuccess } from "./components/button";
import { highlightIssues } from "./components/highlight";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

let activeElement: HTMLElement | null = null;

function isEditableElement(el: HTMLElement): boolean {
  if (!el || !el.tagName) return false;
  return (
    el.isContentEditable ||
    el.tagName.toLowerCase() === "textarea" ||
    (el.tagName.toLowerCase() === "input" &&
      ["text", "email", "search"].includes((el as HTMLInputElement).type))
  );
}

function getEditorText(el: HTMLElement): string {
  return (el as HTMLTextAreaElement).value || el.innerText || el.textContent || "";
}

function init(): void {
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("scroll", () => updateButtonPosition(activeElement), true);
  window.addEventListener("resize", () => updateButtonPosition(activeElement));

  console.log("Bias Detector loaded");
}

function handleFocusIn(e: FocusEvent): void {
  const target = e.target as HTMLElement;
  if (isEditableElement(target)) {
    activeElement = target;
    showButton(target, handleAnalyze);
  }
}

function handleFocusOut(): void {
  setTimeout(() => {
    if (!document.activeElement || !isEditableElement(document.activeElement as HTMLElement)) {
      hideButton();
      activeElement = null;
    }
  }, 200);
}

async function handleAnalyze(): Promise<void> {
  if (!activeElement) return;

  const text = getEditorText(activeElement);
  if (!text.trim()) {
    alert("No text to analyze");
    return;
  }

  setButtonLoading(true);

  try {
    const issues = await analyzeBias(text);
    if (issues.length === 0) {
      setButtonSuccess();
    } else {
      highlightIssues(activeElement, issues);
    }
  } catch (err) {
    console.error("Analysis failed:", err);
    alert("Analysis failed. Check console for details.");
  }

  setButtonLoading(false);
}

init();