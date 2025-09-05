import "./style.css";
import "./nav";
import { getFitFile } from "./global";
import { formatDate, formatDuration } from "./utils/date-and-time";
import type { DataPoint, Session } from "./utils/fit-parser";
import * as DomUtils from "./utils/dom";
import { updateChart } from "./chart";
import { getTown } from "./utils/geo";
import { updateMap } from "./map";

export function update(): void {
  const fitFile = getFitFile();

  const start = fitFile?.records.at(0);
  const end = fitFile?.records.at(fitFile.records.length - 1);
  void updateSession(fitFile?.sessions[0], start, end);
  void updateChart(fitFile?.records);
  void updateMap(fitFile?.records);
}

async function updateSession(
  session: Session | undefined,
  start: DataPoint | undefined,
  end: DataPoint | undefined,
): Promise<void> {
  const sessionCard = document.getElementById("session") as HTMLElement;
  if (session === undefined) {
    sessionCard.classList.add("hidden");
    return;
  }

  const startTown = await getTown(start);
  const endTown = await getTown(end);
  const setText = (path: string, content: string) => {
    DomUtils.setText(sessionCard, path, content);
  };

  setText("h2", `Bike ride from ${startTown} to ${endTown}`);
  setText(
    ".timestamp",
    `Start: ${formatDate(session.timestamp)}, Duration ${formatDuration(session.total_elapsed_time)}`,
  );

  setText(".distance span", session.total_distance.toFixed(2));
  setText(".ascent span", (session.total_ascent * 1000).toFixed(2));
  setText(".descent span", (session.total_descent * 1000).toFixed(2));

  setText(".speed span", session.avg_speed.toFixed(2));
  setText(".speed span.muted", `(max ${session.max_speed.toFixed(2)})`);

  setText(".power span", session.avg_power.toFixed(2));
  setText(".power span.muted", `(max ${session.max_power.toFixed(2)})`);

  setText(".cadence span", session.avg_cadence.toFixed(2));
  setText(".cadence span.muted", `(max ${session.max_cadence.toFixed(2)})`);

  sessionCard.classList.remove("hidden");
}

window.onerror = (message) => {
  DomUtils.showToast("Error:" + message);
};

window.addEventListener("unhandledrejection", (event) => {
  DomUtils.showToast(event.reason);
});
