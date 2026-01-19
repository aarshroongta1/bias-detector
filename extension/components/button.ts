let floatingBtn: HTMLButtonElement | null = null;

export function showButton(element: HTMLElement, onAnalyze: () => void): void {
  if (!floatingBtn) {
    floatingBtn = document.createElement("button");
    floatingBtn.className = "check-btn";
    floatingBtn.innerHTML = "B";
    floatingBtn.addEventListener("mousedown", (e) => e.preventDefault());
    floatingBtn.addEventListener("click", onAnalyze);
    document.body.appendChild(floatingBtn);
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