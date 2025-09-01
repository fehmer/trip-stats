import { stringify } from "csv-stringify/browser/esm/sync";
import type { DataPoint } from "./fit-parser";

export function toCsv(data: DataPoint[]): string {
  return stringify(data, {
    columns: [
      { key: "timestamp" },
      { key: "position_lat" },
      { key: "position_long" },
      { key: "distance" },
      { key: "speed" },
      { key: "power" },
      { key: "cadence" },
    ],
    header: true,
  });
}
