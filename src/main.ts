import "./style.css";
import "./nav";
import { getFitFile } from "./global";
import { formatDate, formatDuration } from "./utils/date-and-time";
import type { Session } from "./utils/fit-parser";
import * as DommUtils from "./utils/dom";

export function update(): void {
  updateSession();
}

function updateSession(): void {
  const sessionCard = document.getElementById("session") as HTMLElement;
  const setText = (path: string, content: string) => {
    DommUtils.setText(sessionCard, path, content);
  };
  const fitFile = getFitFile();
  const session: Session = fitFile?.sessions[0] as Session;

  setText("h2", `Bike ride from A to B`);
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
