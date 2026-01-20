import type { BiasIssue } from "../type"
import { hideCard, scheduleHideCard, showCard } from "./card"

interface HighlightRange {
  start: number
  end: number
  issue: BiasIssue
  issueIndex: number
}

let overlay: HTMLDivElement | null = null
let backdrop: HTMLDivElement | null = null
let currentTextarea: HTMLTextAreaElement | null = null
let currentIssues: BiasIssue[] = []
let filteredRanges: HighlightRange[] = []

export function highlightTextarea(
  textarea: HTMLTextAreaElement,
  issues: BiasIssue[]
): void {
  clearTextareaOverlay()

  currentTextarea = textarea
  currentIssues = issues

  // Collect all ranges from positions
  const ranges: HighlightRange[] = []
  issues.forEach((issue, issueIndex) => {
    issue.positions.forEach((pos) => {
      ranges.push({ start: pos.start, end: pos.end, issue, issueIndex })
    })
  })

  // Sort by start position, longer ranges first for same start
  ranges.sort((a, b) => a.start - b.start || b.end - a.end)

  // Remove overlapping ranges (keep the first/longer one)
  filteredRanges = []
  for (const range of ranges) {
    const overlaps = filteredRanges.some(
      (r) => range.start < r.end && range.end > r.start
    )
    if (!overlaps) {
      filteredRanges.push(range)
    }
  }

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

  const text = currentTextarea.value

  // Build HTML with highlights using positions
  let html = ""
  let lastEnd = 0

  for (const range of filteredRanges) {
    // Add text before this highlight
    html += escapeHtml(text.slice(lastEnd, range.start))
    // Add highlighted text
    const highlightedText = text.slice(range.start, range.end)
    html += `<mark class="bias-highlight severity-${range.issue.severity}" data-bias-index="${range.issueIndex}">${escapeHtml(highlightedText)}</mark>`
    lastEnd = range.end
  }

  // Add remaining text
  html += escapeHtml(text.slice(lastEnd))

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

  // Remove old interaction layer if exists
  const oldLayer = overlay.querySelector(".interaction-layer")
  if (oldLayer) oldLayer.remove()

  // Create invisible interaction layer
  const interactionLayer = document.createElement("div")
  interactionLayer.className = "interaction-layer"
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
          () => replaceInTextarea(index),
          () => removeHighlight(index)
        )
      }
    })
    clickArea.addEventListener("mouseleave", scheduleHideCard)

    interactionLayer.appendChild(clickArea)
  })

  overlay.appendChild(interactionLayer)
}

function replaceInTextarea(issueIndex: number): void {
  if (!currentTextarea) return

  const issue = currentIssues[issueIndex]
  if (!issue) return

  // Find the range for this issue
  const range = filteredRanges.find((r) => r.issueIndex === issueIndex)
  if (!range) return

  const text = currentTextarea.value
  currentTextarea.value =
    text.slice(0, range.start) + issue.replacement + text.slice(range.end)

  // Remove this range and adjust positions of subsequent ranges
  const lengthDiff = issue.replacement.length - (range.end - range.start)
  filteredRanges = filteredRanges.filter((r) => r !== range)
  filteredRanges.forEach((r) => {
    if (r.start > range.start) {
      r.start += lengthDiff
      r.end += lengthDiff
    }
  })

  if (filteredRanges.length > 0) {
    renderHighlights()
  } else {
    clearTextareaOverlay()
  }

  // Trigger input event for any listeners
  currentTextarea.dispatchEvent(new Event("input", { bubbles: true }))
}

function removeHighlight(issueIndex: number): void {
  filteredRanges = filteredRanges.filter((r) => r.issueIndex !== issueIndex)

  if (filteredRanges.length > 0) {
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
  filteredRanges = []
  hideCard()
}
