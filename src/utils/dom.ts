export function setText(root: HTMLElement, path: string, content: string) {
  const element = root.querySelector(path);
  if (element === null) throw new Error("Cannot find " + path + " in " + root);
  element.textContent = content;
}

export function setInnerHtml(root: HTMLElement, path: string, content: string) {
  const element = root.querySelector(path);
  if (element === null) throw new Error("Cannot find " + path + " in " + root);
  element.innerHTML = content;
}

export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

const shownMessages = new Set();
export function showToast(message: string): void {
  if (shownMessages.has(message)) return;
  shownMessages.add(message);

  const container = document.getElementById(
    "toast-container",
  ) as HTMLDivElement;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  // Remove toast after 5s
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
