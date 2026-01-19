let floatingBtn: HTMLButtonElement | null = null;

export function showButton(element: HTMLElement, onAnalyze: () => void): void {
  if (!floatingBtn) {
    floatingBtn = document.createElement("button");
    floatingBtn.className = "check-btn";
    floatingBtn.innerHTML = "Check";
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
  floatingBtn.style.top = `${rect.top + 5}px`;
  floatingBtn.style.left = `${rect.right - 90}px`;
  floatingBtn.style.zIndex = "1000000000";
}

export function setButtonLoading(loading: boolean): void {
  if (!floatingBtn) return;
  floatingBtn.innerHTML = loading ? "Analyzing" : "Check";
}

export function setButtonSuccess(): void {
  if (!floatingBtn) return;
  floatingBtn.innerHTML = "Done";
  setTimeout(() => {
    if (floatingBtn) floatingBtn.innerHTML = "Check";
  }, 1500);
}