import type { BiasIssue } from "../type"
import { hideCard, scheduleHideCard, showCard } from "./card"

let overlay: HTMLDivElement | null = null
let backdrop: HTMLDivElement | null = null
let currentTextarea: HTMLTextAreaElement | null = null
let currentIssues: BiasIssue[] = []

export function highlightTextarea(
  textarea: HTMLTextAreaElement,
  issues: BiasIssue[]
): void {
  clearTextareaOverlay()

  currentTextarea = textarea
  currentIssues = issues

  // Create backdrop (shows highlights behind text)
  backdrop = document.createElement("div")
  backdrop.className = "textarea-backdrop"

  // Create overlay container
  overlay = document.createElement("div")
  overlay.className = "textarea-overlay"

  // Copy textarea styles to backdrop
  const styles = window.getComputedStyle(textarea)
  const stylesToCopy = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "wordSpacing",
    "textAlign",
    "textIndent",
    "whiteSpace",
    "wordWrap",
    "wordBreak",
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "border",
    "borderRadius",
    "boxSizing"
  ]

  stylesToCopy.forEach((prop) => {
    ;(backdrop as HTMLDivElement).style[prop as any] = styles[prop as any]
  })

  // Position overlay exactly over textarea
  const rect = textarea.getBoundingClientRect()
  overlay.style.position = "fixed"
  overlay.style.top = `${rect.top}px`
  overlay.style.left = `${rect.left}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  overlay.style.pointerEvents = "none"
  overlay.style.zIndex = "999999"
  overlay.style.overflow = "hidden"

  backdrop.style.width = "100%"
  backdrop.style.height = "100%"
  backdrop.style.overflow = "auto"
  backdrop.style.pointerEvents = "none"
  backdrop.style.color = "transparent"
  backdrop.style.background = "transparent"

  overlay.appendChild(backdrop)
  document.body.appendChild(overlay)

  // Make textarea background transparent so highlights show through
  textarea.dataset.originalBg = textarea.style.background
  textarea.style.background = "transparent"

  // Render highlights
  renderHighlights()

  // Sync scroll
  textarea.addEventListener("scroll", syncScroll)
  textarea.addEventListener("input", onTextareaInput)
  window.addEventListener("resize", updateOverlayPosition)
  window.addEventListener("scroll", updateOverlayPosition, true)
}

function renderHighlights(): void {
  if (!backdrop || !currentTextarea) return

  let text = currentTextarea.value
  let html = escapeHtml(text)

  currentIssues.forEach((issue, index) => {
    const escaped = escapeHtml(issue.phrase).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )
    const regex = new RegExp(`(${escaped})`, "gi")
    html = html.replace(regex, (match) => {
      return `<mark class="bias-highlight severity-${issue.severity}" data-bias-index="${index}">${match}</mark>`
    })
  })

  // Add extra space at the end to match textarea behavior
  html += "<br>"
  backdrop.innerHTML = html

  // Sync scroll position
  syncScroll()

  // Add click handlers to highlights via overlay
  setupHighlightInteraction()
}

function setupHighlightInteraction(): void {
  if (!overlay || !currentTextarea) return

  // Create invisible interaction layer
  const interactionLayer = document.createElement("div")
  interactionLayer.style.position = "absolute"
  interactionLayer.style.top = "0"
  interactionLayer.style.left = "0"
  interactionLayer.style.width = "100%"
  interactionLayer.style.height = "100%"
  interactionLayer.style.pointerEvents = "none"

  // For each highlight, create an invisible clickable area
  backdrop?.querySelectorAll(".bias-highlight").forEach((el) => {
    const mark = el as HTMLElement
    const rect = mark.getBoundingClientRect()
    const overlayRect = overlay!.getBoundingClientRect()

    const clickArea = document.createElement("div")
    clickArea.style.position = "absolute"
    clickArea.style.top = `${rect.top - overlayRect.top}px`
    clickArea.style.left = `${rect.left - overlayRect.left}px`
    clickArea.style.width = `${rect.width}px`
    clickArea.style.height = `${rect.height}px`
    clickArea.style.pointerEvents = "auto"
    clickArea.style.cursor = "pointer"

    const index = parseInt(mark.dataset.biasIndex || "0")
    const issue = currentIssues[index]

    clickArea.addEventListener("mouseenter", () => {
      if (issue) {
        showCard(
          mark,
          issue,
          () => replaceInTextarea(issue.phrase, issue.replacement),
          () => removeHighlight(index)
        )
      }
    })
    clickArea.addEventListener("mouseleave", scheduleHideCard)

    interactionLayer.appendChild(clickArea)
  })

  overlay.appendChild(interactionLayer)
}

function replaceInTextarea(phrase: string, replacement: string): void {
  if (!currentTextarea) return

  const text = currentTextarea.value
  const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
  currentTextarea.value = text.replace(regex, replacement)

  // Remove this issue and re-render
  currentIssues = currentIssues.filter((i) => i.phrase.toLowerCase() !== phrase.toLowerCase())

  if (currentIssues.length > 0) {
    renderHighlights()
  } else {
    clearTextareaOverlay()
  }

  // Trigger input event for any listeners
  currentTextarea.dispatchEvent(new Event("input", { bubbles: true }))
}

function removeHighlight(index: number): void {
  currentIssues = currentIssues.filter((_, i) => i !== index)

  if (currentIssues.length > 0) {
    renderHighlights()
  } else {
    clearTextareaOverlay()
  }
}

function syncScroll(): void {
  if (!backdrop || !currentTextarea) return
  backdrop.scrollTop = currentTextarea.scrollTop
  backdrop.scrollLeft = currentTextarea.scrollLeft
}

function updateOverlayPosition(): void {
  if (!overlay || !currentTextarea) return
  const rect = currentTextarea.getBoundingClientRect()
  overlay.style.top = `${rect.top}px`
  overlay.style.left = `${rect.left}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
}

function onTextareaInput(): void {
  // Clear highlights when user edits
  clearTextareaOverlay()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
}

export function clearTextareaOverlay(): void {
  if (overlay) {
    overlay.remove()
    overlay = null
  }
  if (backdrop) {
    backdrop = null
  }
  if (currentTextarea) {
    currentTextarea.style.background = currentTextarea.dataset.originalBg || ""
    currentTextarea.removeEventListener("scroll", syncScroll)
    currentTextarea.removeEventListener("input", onTextareaInput)
    currentTextarea = null
  }
  window.removeEventListener("resize", updateOverlayPosition)
  window.removeEventListener("scroll", updateOverlayPosition, true)
  currentIssues = []
  hideCard()
}
