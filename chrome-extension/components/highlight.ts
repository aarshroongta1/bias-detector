import type { BiasIssue } from "../type"
import { scheduleHideCard, showCard } from "./card"

interface HighlightRange {
  start: number
  end: number
  issue: BiasIssue
  issueIndex: number
}

export function highlightIssues(
  element: HTMLElement,
  issues: BiasIssue[]
): void {
  clearHighlights(element)

  // Collect all ranges and sort by start position
  const ranges: HighlightRange[] = []
  issues.forEach((issue, issueIndex) => {
    issue.positions.forEach((pos) => {
      ranges.push({ start: pos.start, end: pos.end, issue, issueIndex })
    })
  })

  // Sort by start position, longer ranges first for same start
  ranges.sort((a, b) => a.start - b.start || b.end - a.end)

  // Remove overlapping ranges (keep the first/longer one)
  const filtered: HighlightRange[] = []
  for (const range of ranges) {
    const overlaps = filtered.some(
      (r) => range.start < r.end && range.end > r.start
    )
    if (!overlaps) {
      filtered.push(range)
    }
  }

  // Build HTML with highlights using positions
  const text = element.innerText || element.textContent || ""
  let html = ""
  let lastEnd = 0

  for (const range of filtered) {
    // Add text before this highlight
    html += escapeHtml(text.slice(lastEnd, range.start))
    // Add highlighted text
    const highlightedText = text.slice(range.start, range.end)
    html += `<span class="bias-highlight severity-${range.issue.severity}" data-bias-index="${range.issueIndex}">${escapeHtml(highlightedText)}</span>`
    lastEnd = range.end
  }

  // Add remaining text
  html += escapeHtml(text.slice(lastEnd))

  element.innerHTML = html

  // Add event listeners
  element.querySelectorAll(".bias-highlight").forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      const target = e.target as HTMLElement
      const index = parseInt(target.dataset.biasIndex || "0")
      const issue = issues[index]
      if (issue) {
        showCard(
          target,
          issue,
          () => replaceHighlight(target, issue.replacement, element, issues),
          () => removeHighlight(target)
        )
      }
    })
    el.addEventListener("mouseleave", scheduleHideCard)
  })
}

function replaceHighlight(
  target: HTMLElement,
  replacement: string,
  element: HTMLElement,
  issues: BiasIssue[]
): void {
  target.replaceWith(document.createTextNode(replacement))
  element.normalize()
}

function removeHighlight(target: HTMLElement): void {
  target.replaceWith(document.createTextNode(target.textContent || ""))
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function clearHighlights(element: HTMLElement): void {
  const highlights = element.querySelectorAll(".bias-highlight")
  highlights.forEach((el) => {
    el.replaceWith(document.createTextNode(el.textContent || ""))
  })
  element.normalize()
}
