import type { PlasmoCSConfig } from "plasmo"

import { analyzeBias } from "./api"
import {
  hideButton,
  setButtonLoading,
  setButtonSuccess,
  showButton,
  updateButtonPosition
} from "./components/button"
import { highlightIssues } from "./components/highlight"
import { injectStyles } from "./components/styles"
import { highlightTextarea } from "./components/textarea-overlay"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

injectStyles()

let activeElement: HTMLElement | null = null

function isEditableElement(el: HTMLElement): boolean {
  if (!el || !el.tagName) return false
  return (
    el.isContentEditable ||
    el.tagName.toLowerCase() === "textarea" ||
    (el.tagName.toLowerCase() === "input" &&
      ["text", "email", "search"].includes((el as HTMLInputElement).type))
  )
}

function getEditorText(el: HTMLElement): string {
  return (
    (el as HTMLTextAreaElement).value || el.innerText || el.textContent || ""
  )
}

function init(): void {
  document.addEventListener("focusin", handleFocusIn)
  document.addEventListener("focusout", handleFocusOut)
  document.addEventListener(
    "scroll",
    () => updateButtonPosition(activeElement),
    true
  )
  window.addEventListener("resize", () => updateButtonPosition(activeElement))

  console.log("Bias Detector loaded")
}

function handleFocusIn(e: FocusEvent): void {
  const target = e.target as HTMLElement
  if (isEditableElement(target)) {
    activeElement = target
    showButton(target, handleAnalyze)
  }
}

function handleFocusOut(): void {
  setTimeout(() => {
    if (
      !document.activeElement ||
      !isEditableElement(document.activeElement as HTMLElement)
    ) {
      hideButton()
      activeElement = null
    }
  }, 200)
}

async function handleAnalyze(): Promise<void> {
  if (!activeElement) return

  const element = activeElement // Store reference before async call
  const text = getEditorText(element)

  if (!text.trim()) {
    alert("No text to analyze")
    return
  }

  setButtonLoading(true)

  try {
    const issues = await analyzeBias(text)
    console.log("Issues received:", issues)
    console.log(
      "Element type:",
      element.tagName,
      "isContentEditable:",
      element.isContentEditable
    )

    if (issues.length === 0) {
      setButtonSuccess()
    } else if (element.tagName.toLowerCase() === "textarea") {
      highlightTextarea(element as HTMLTextAreaElement, issues)
    } else {
      highlightIssues(element, issues)
    }
  } catch (err) {
    console.error("Analysis failed:", err)
    alert("Analysis failed. Check console for details.")
  }

  setButtonLoading(false)
}

init()
