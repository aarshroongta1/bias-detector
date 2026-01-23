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

  let top = rect.bottom + 8
  let left = rect.left
  if (left + 320 > window.innerWidth) left = window.innerWidth - 330
  if (top + 200 > window.innerHeight) top = rect.top - 210

  card.style.position = "fixed"
  card.style.top = `${top}px`
  card.style.left = `${left}px`
  card.style.zIndex = "2147483647"

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
