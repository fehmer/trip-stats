import { getFitFile, setFitFile } from "./global";
import { toCsv } from "./utils/csv";
import { formatDate } from "./utils/date-and-time";
import { parse as parseFit } from "./utils/fit-parser";
import { merge, parseGpx } from "./utils/gpx-parser";

async function importFile(accept: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";

    // Listen for file selection
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        reject("no file");
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async () => {
        const content = reader.result as ArrayBuffer;
        resolve(content);
      };
    });

    // Trigger the file dialog
    document.body.appendChild(input); // Required for Firefox
    input.click();

    // Clean up
    input.remove();
  });
}

const importFit = document.getElementById("import-fit");
importFit?.addEventListener("click", async (event) => {
  event.preventDefault();
  const content = await importFile(".fit");
  const fitFile = await parseFit(content);
  setFitFile(fitFile);
});

const importGpx = document.getElementById("import-gpx");
importGpx?.addEventListener("click", async (event) => {
  event.preventDefault();
  const fitFile = getFitFile();
  if (fitFile === undefined) {
    throw new Error("import fit-file first");
  }

  const content = await importFile(".gpx");
  const gpxFile = parseGpx(content);

  fitFile.records = merge(fitFile.records, gpxFile);
  setFitFile(fitFile);
  console.log(gpxFile);
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
