import type { BiasIssue } from "../type"
import { scheduleHideCard, showCard } from "./card"

export function highlightIssues(
  element: HTMLElement,
  issues: BiasIssue[]
): void {
  clearHighlights(element)

  let html = element.innerHTML

  issues.forEach((issue, index) => {
    const escaped = issue.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi")
    html = html.replace(regex, (match) => {
      return `<span class="bias-highlight severity-${issue.severity}" data-bias-index="${index}">${match}</span>`
    })
  })

  element.innerHTML = html

  element.querySelectorAll(".bias-highlight").forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      const target = e.target as HTMLElement
      const index = parseInt(target.dataset.biasIndex || "0")
      const issue = issues[index]
      if (issue) {
        showCard(
          target,
          issue,
          () => target.replaceWith(document.createTextNode(issue.replacement)),
          () =>
            target.replaceWith(
              document.createTextNode(target.textContent || "")
            )
        )
      }
    })
    el.addEventListener("mouseleave", scheduleHideCard)
  })
}

export function clearHighlights(element: HTMLElement): void {
  const highlights = element.querySelectorAll(".bias-highlight")
  highlights.forEach((el) => {
    el.replaceWith(document.createTextNode(el.textContent || ""))
  })
  element.normalize()
}
