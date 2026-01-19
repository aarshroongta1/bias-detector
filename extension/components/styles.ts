const STYLES = `
.bias-highlight {
  border-radius: 2px;
  padding: 1px 0;
  cursor: pointer;
}

.severity-low {
  background: rgba(34, 197, 94, 0.25);
  border-bottom: 2px solid #22c55e;
}

.severity-medium {
  background: rgba(234, 179, 8, 0.25);
  border-bottom: 2px solid #eab308;
}

.severity-high {
  background: rgba(239, 68, 68, 0.25);
  border-bottom: 2px solid #ef4444;
}

.hover-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px;
  max-width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-badge.severity-low {
  background: rgba(34, 197, 94, 0.2);
  color: #15803d;
}

.card-badge.severity-medium {
  background: rgba(234, 179, 8, 0.2);
  color: #a16207;
}

.card-badge.severity-high {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.card-category {
  color: #6b7280;
  font-size: 12px;
  margin-left: 8px;
}

.card-explanation {
  margin: 0 0 10px 0;
  color: #374151;
}

.card-suggestion {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.card-suggestion-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-suggestion-text {
  font-weight: 500;
  color: #111827;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.card-btn.primary {
  background: #3b82f6;
  color: white;
}

.card-btn.primary:hover {
  background: #2563eb;
}

.card-btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.card-btn.secondary:hover {
  background: #d1d5db;
}

.check-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease, background 0.15s ease;
}

.check-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}
`

let injected = false

export function injectStyles(): void {
  if (injected) return

  const style = document.createElement("style")
  style.textContent = STYLES
  document.head.appendChild(style)
  injected = true
}
