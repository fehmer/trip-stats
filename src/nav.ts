import { getFitFile, setFitFile } from "./global";
import { toCsv } from "./utils/csv";
import { formatDate } from "./utils/date-and-time";
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

document.getElementById("export-json")?.addEventListener("click", () => {
  const fitFile = getFitFile();
  if (!fitFile) return;
  const content = JSON.stringify(getFitFile(), null, 2);
  downloadFile(
    content,
    fitFile.sessions[0].sport +
      " " +
      formatDate(fitFile.sessions[0].timestamp) +
      ".json",
    "application/json",
  );
});

document.getElementById("export-csv")?.addEventListener("click", async () => {
  const fitFile = getFitFile();
  if (!fitFile) return;
  const content = await toCsv(fitFile.records);
  downloadFile(
    content,
    fitFile.sessions[0].sport +
      " " +
      formatDate(fitFile.sessions[0].timestamp) +
      ".csv",
    "text/csv",
  );
});
function downloadFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
