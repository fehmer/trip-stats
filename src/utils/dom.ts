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
