import { FitFileStore } from "./fit-file-store";
import { toCsv } from "./utils/csv";
import { mergeByTime } from "./utils/data-point";
import { formatDate } from "./utils/date-and-time";
import { parseFit, type FitFile } from "./utils/fit-parser";
import { parseGpx } from "./utils/gpx-parser";

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
  FitFileStore.set(fitFile);
});

const importGpx = document.getElementById("import-gpx");
importGpx?.addEventListener("click", async (event) => {
  event.preventDefault();
  const fitFile = FitFileStore.get();
  if (fitFile === undefined) {
    throw new Error("import fit-file first");
  }

  const content = await importFile(".gpx");
  const waypoints = parseGpx(content);

  mergeByTime(fitFile.records, waypoints, (point, waypoint) => {
    point.altitude = waypoint.altitude;
    point.position_lat = waypoint.position_lat;
    point.position_long = waypoint.position_long;
  });

  FitFileStore.set(fitFile);
});

document.getElementById("export-json")?.addEventListener("click", () => {
  const fitFile = FitFileStore.get();
  if (!fitFile) return;
  const content = JSON.stringify(FitFileStore.get(), null, 2);
  downloadFile(
    new Blob([content], { type: "application/json" }),
    getFileName(fitFile, "json"),
  );
});

document.getElementById("export-csv")?.addEventListener("click", async () => {
  const fitFile = FitFileStore.get();
  if (!fitFile) return;
  const content = toCsv(fitFile.records);
  downloadFile(
    new Blob([content], { type: "text/csv" }),
    getFileName(fitFile, "csv "),
  );
});
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function getFileName(fitFile: FitFile, extension: string) {
  return (
    fitFile.sessions[0].sport +
    " " +
    formatDate(fitFile.sessions[0].timestamp) +
    "." +
    extension
  );
}
