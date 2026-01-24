import type { BiasIssue } from "../type"

let activeCard: HTMLElement | null = null
let hideCardTimeout: ReturnType<typeof setTimeout> | null = null

export function showCard(
  el: HTMLElement,
  issue: BiasIssue,
  onReplace: () => void,
  onIgnore: () => void
): void {
  hideCard()

  const rect = el.getBoundingClientRect()
  const card = document.createElement("div")
  card.className = "hover-card"

  card.innerHTML = `
    <div class="card-header">
      <div>
        <span class="card-badge severity-${issue.severity}">${issue.severity}</span>
        <span class="card-category">${issue.category}</span>
      </div>
    </div>
    <p class="card-explanation">${issue.explanation}</p>
    <div class="card-suggestion">
      <div class="card-suggestion-label">Suggested replacement:</div>
      <div class="card-suggestion-text">"${issue.replacement}"</div>
    </div>
    <div class="card-actions">
      <button class="card-btn primary" data-action="replace">Replace</button>
      <button class="card-btn secondary" data-action="ignore">Ignore</button>
    </div>
  `

  // Position card below the phrase with enough gap
  let top = rect.bottom + 12
  let left = rect.left

  // Keep card within viewport horizontally
  if (left + 320 > window.innerWidth) left = window.innerWidth - 330
  if (left < 10) left = 10

  // If card would go off bottom, show above the phrase instead
  if (top + 250 > window.innerHeight) top = rect.top - 260

  // Apply inline styles for maximum compatibility (Slack, etc.)
  card.style.cssText = `
    position: fixed !important;
    top: ${top}px !important;
    left: ${left}px !important;
    z-index: 2147483647 !important;
    background: white !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
    padding: 12px !important;
    max-width: 320px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    color: #374151 !important;
  `

  card
    .querySelector('[data-action="replace"]')
    ?.addEventListener("click", () => {
      onReplace()
      hideCard()
    })
  card
    .querySelector('[data-action="ignore"]')
    ?.addEventListener("click", () => {
      onIgnore()
      hideCard()
    })

  card.addEventListener("mouseenter", () => {
    if (hideCardTimeout) clearTimeout(hideCardTimeout)
  })
  card.addEventListener("mouseleave", hideCard)

  document.body.appendChild(card)
  activeCard = card
}

export function scheduleHideCard(): void {
  hideCardTimeout = setTimeout(hideCard, 150)
}

export function hideCard(): void {
  if (activeCard) {
    activeCard.remove()
    activeCard = null
  }
}
