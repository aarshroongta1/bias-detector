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
  console.log("[BiasDetector] highlightIssues called")
  console.log("[BiasDetector] Element innerHTML BEFORE:", element.innerHTML.substring(0, 500))

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

  // Use DOM manipulation to preserve formatting
  // Sort ranges in reverse order so we can modify from end to start
  const sortedRanges = [...filtered].sort((a, b) => b.start - a.start)

  console.log("[BiasDetector] Ranges to highlight:", sortedRanges.map(r => ({ start: r.start, end: r.end, phrase: r.issue.phrase })))

  for (const range of sortedRanges) {
    wrapTextRange(element, range.start, range.end, range.issue, range.issueIndex)
  }

  console.log("[BiasDetector] Element innerHTML AFTER:", element.innerHTML.substring(0, 500))

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

const BLOCK_TAGS = new Set(["DIV", "P", "BR", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6"])

function wrapTextRange(
  container: HTMLElement,
  start: number,
  end: number,
  issue: BiasIssue,
  issueIndex: number
): void {
  // Walk through nodes tracking position the same way as text extraction
  let currentOffset = 0
  let lastWasBlock = false

  function walk(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text
      const nodeLength = textNode.textContent?.length || 0
      const nodeStart = currentOffset
      const nodeEnd = currentOffset + nodeLength

      // Check if this text node overlaps with our target range
      if (nodeEnd > start && nodeStart < end) {
        const overlapStart = Math.max(0, start - nodeStart)
        const overlapEnd = Math.min(nodeLength, end - nodeStart)

        if (overlapStart < overlapEnd) {
          const text = textNode.textContent || ""

          // Create the highlight span with inline styles for maximum compatibility
          const span = document.createElement("span")
          span.className = `bias-highlight severity-${issue.severity}`
          span.dataset.biasIndex = String(issueIndex)
          span.textContent = text.slice(overlapStart, overlapEnd)

          // Apply inline styles to bypass CSS isolation (Slack, etc.)
          const colors = {
            low: { bg: "rgba(34, 197, 94, 0.25)", border: "#22c55e" },
            medium: { bg: "rgba(234, 179, 8, 0.25)", border: "#eab308" },
            high: { bg: "rgba(239, 68, 68, 0.25)", border: "#ef4444" }
          }
          const color = colors[issue.severity] || colors.medium
          span.style.cssText = `background: ${color.bg} !important; border-bottom: 2px solid ${color.border} !important; border-radius: 2px !important; padding: 1px 0 !important; cursor: pointer !important;`

          // Split: before | highlight | after
          const before = text.slice(0, overlapStart)
          const after = text.slice(overlapEnd)

          const parent = textNode.parentNode
          if (parent) {
            if (after) {
              parent.insertBefore(document.createTextNode(after), textNode.nextSibling)
            }
            parent.insertBefore(span, textNode.nextSibling)
            if (before) {
              textNode.textContent = before
            } else {
              parent.removeChild(textNode)
            }
          }

          return true // Found and wrapped
        }
      }

      currentOffset = nodeEnd
      lastWasBlock = false
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tagName = el.tagName

      // Add newline offset for block elements (matching text extraction logic)
      if (BLOCK_TAGS.has(tagName) && currentOffset > 0 && !lastWasBlock) {
        currentOffset += 1
        lastWasBlock = true
      }

      // BR adds a newline
      if (tagName === "BR") {
        currentOffset += 1
        lastWasBlock = true
        return false
      }

      // Recurse into children
      for (const child of Array.from(node.childNodes)) {
        if (walk(child)) return true
      }

      // Add newline after block elements
      if (BLOCK_TAGS.has(tagName) && tagName !== "BR" && !lastWasBlock) {
        currentOffset += 1
        lastWasBlock = true
      }
    }

    return false
  }

  walk(container)
}

export function clearHighlights(element: HTMLElement): void {
  const highlights = element.querySelectorAll(".bias-highlight")
  highlights.forEach((el) => {
    el.replaceWith(document.createTextNode(el.textContent || ""))
  })
  element.normalize()
}
