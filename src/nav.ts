import { setFitFile } from "./global";
import { parse } from "./utils/fit-parser";

const importFile = document.getElementById("importFile");
importFile?.addEventListener("click", (event) => {
  event.preventDefault();

  // Create a hidden file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".fit"; // Only allow .fit files
  input.style.display = "none";

  // Listen for file selection
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const content = reader.result as ArrayBuffer;
      const fitFile = await parse(content);
      setFitFile(fitFile);
    };
  });

  // Trigger the file dialog
  document.body.appendChild(input); // Required for Firefox
  input.click();

  // Clean up
  input.remove();
});
