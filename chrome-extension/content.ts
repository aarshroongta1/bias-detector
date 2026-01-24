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
import type { BiasIssue } from "./type"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

injectStyles()

let activeElement: HTMLElement | null = null

// Traverse into iframes to find the real active element
function getDeepActiveElement(): HTMLElement | null {
  let active: Element | null = document.activeElement

  while (active && active.tagName === "IFRAME") {
    try {
      const iframeDoc = (active as HTMLIFrameElement).contentDocument
      if (!iframeDoc) break
      active = iframeDoc.activeElement
    } catch {
      return null // cross-origin iframe
    }
  }

  return active as HTMLElement | null
}

function getEditorText(el: HTMLElement): string {
  // Textarea / input
  if ("value" in el && (el as HTMLTextAreaElement).value !== undefined) {
    return (el as HTMLTextAreaElement).value
  }

  // Rich editors - walk through all nodes and preserve line breaks
  return extractTextWithLineBreaks(el).replace(/\u200B/g, "").trim()
}

function extractTextWithLineBreaks(el: HTMLElement): string {
  let text = ""
  const blockTags = new Set(["DIV", "P", "BR", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6"])

  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || ""
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tagName = el.tagName

      // Add newline before block elements (except at start)
      if (blockTags.has(tagName) && text.length > 0 && !text.endsWith("\n")) {
        text += "\n"
      }

      // BR always adds a newline
      if (tagName === "BR") {
        text += "\n"
        return
      }

      // Recurse into children
      for (const child of node.childNodes) {
        walk(child)
      }

      // Add newline after block elements
      if (blockTags.has(tagName) && tagName !== "BR" && !text.endsWith("\n")) {
        text += "\n"
      }
    }
  }

  walk(el)
  return text
}

function init(): void {
  // Poll for active editable element (like Grammarly does)
  setInterval(checkActiveElement, 500)

  document.addEventListener(
    "scroll",
    () => updateButtonPosition(activeElement),
    true
  )
  window.addEventListener("resize", () => updateButtonPosition(activeElement))

  // Watch for dynamically added iframes (Outlook recreates editor on reply/forward)
  const observer = new MutationObserver(() => {
    checkActiveElement()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  console.log("Bias Detector loaded", window.location.href)
}

function isOutlook(): boolean {
  return location.hostname.includes("outlook")
}

function showIssuesAlert(issues: BiasIssue[]): void {
  const message = issues
    .map(
      (issue, i) =>
        `${i + 1}. "${issue.phrase}" (${issue.severity})\n   → ${issue.explanation}\n   Suggestion: ${issue.replacement}`
    )
    .join("\n\n")

  alert(`Found ${issues.length} bias issue(s):\n\n${message}`)
}

function checkActiveElement(): void {
  const active = getDeepActiveElement()
  if (!active) return

  // Find closest contenteditable ancestor (fixes Outlook and similar rich editors)
  const editor = active.closest<HTMLElement>(
    [
      '[contenteditable="true"]',
      "textarea",
      'input[type="text"]',
      'input[type="email"]',
      'input[type="search"]',
      '[role="textbox"]' // Outlook uses this
    ].join(",")
  )

  if (editor && editor !== activeElement) {
    activeElement = editor
    showButton(editor, handleAnalyze)
  } else if (!editor && activeElement) {
    hideButton()
    activeElement = null
  }
}

async function handleAnalyze(): Promise<void> {
  if (!activeElement) return

  const element = activeElement // Store reference before async call
  console.log("[BiasDetector] Element innerHTML:", element.innerHTML.substring(0, 500))
  const text = getEditorText(element)
  console.log("[BiasDetector] Extracted text:", JSON.stringify(text))

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

    console.log("[BiasDetector] Issues count:", issues.length)
    console.log("[BiasDetector] isOutlook:", isOutlook())
    console.log("[BiasDetector] tagName:", element.tagName.toLowerCase())
    console.log("[BiasDetector] hostname:", location.hostname)

    if (issues.length === 0) {
      setButtonSuccess()
    } else if (isOutlook()) {
      // Outlook: DOM mutation breaks editor, show panel instead
      showIssuesAlert(issues)
    } else if (element.tagName.toLowerCase() === "textarea") {
      highlightTextarea(element as HTMLTextAreaElement, issues)
    } else {
      console.log("[BiasDetector] Calling highlightIssues...")
      highlightIssues(element, issues)
      console.log("[BiasDetector] highlightIssues completed")
    }
  } catch (err) {
    console.error("Analysis failed:", err)
    alert("Analysis failed. Check console for details.")
  }

  setButtonLoading(false)
}

init()
