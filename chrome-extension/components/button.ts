let floatingBtn: HTMLButtonElement | null = null;
let currentContainer: HTMLElement | null = null;

function getButtonContainer(element: HTMLElement): HTMLElement {
  // Only look for modal container on sites known to have z-index issues
  if (location.hostname.includes("linkedin")) {
    const modal = element.closest<HTMLElement>('[role="dialog"], [aria-modal="true"], .artdeco-modal');
    if (modal) return modal;
  }
  return document.body;
}

export function showButton(element: HTMLElement, onAnalyze: () => void): void {
  const container = getButtonContainer(element);

  // If container changed, recreate button in new container
  if (floatingBtn && currentContainer !== container) {
    floatingBtn.remove();
    floatingBtn = null;
  }

  if (!floatingBtn) {
    floatingBtn = document.createElement("button");
    floatingBtn.className = "check-btn";
    floatingBtn.innerHTML = "B";
    floatingBtn.addEventListener("mousedown", (e) => e.preventDefault());
    floatingBtn.addEventListener("click", onAnalyze);
    container.appendChild(floatingBtn);
    currentContainer = container;
  }
  updateButtonPosition(element);
  floatingBtn.style.display = "flex";
}

export function hideButton(): void {
  if (floatingBtn) {
    floatingBtn.style.display = "none";
  }
}

export function updateButtonPosition(element: HTMLElement | null): void {
  if (!floatingBtn || !element) return;

  const rect = element.getBoundingClientRect();
  floatingBtn.style.position = "fixed";
  floatingBtn.style.bottom = `${window.innerHeight - rect.bottom + 8}px`;
  floatingBtn.style.right = `${window.innerWidth - rect.right + 8}px`;
  floatingBtn.style.top = "auto";
  floatingBtn.style.left = "auto";
  floatingBtn.style.zIndex = "1000000000";
}

export function setButtonLoading(loading: boolean): void {
  if (!floatingBtn) return;
  floatingBtn.innerHTML = loading ? "..." : "B";
}

export function setButtonSuccess(): void {
  if (!floatingBtn) return;
  floatingBtn.innerHTML = "✓";
  setTimeout(() => {
    if (floatingBtn) floatingBtn.innerHTML = "B";
  }, 1500);
}