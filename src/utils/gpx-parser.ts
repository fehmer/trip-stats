import { parseGPX } from "@we-gold/gpxjs";
import type { DataPoint } from "./data-point";
type GpxWaypoint = Pick<
  DataPoint,
  "timestamp" | "position_lat" | "position_long" | "altitude"
>;
export function parseGpx(content: ArrayBuffer): GpxWaypoint[] {
  const decoded = new TextDecoder("utf-8").decode(content);
  const [gpx, error] = parseGPX(decoded);
  if (error) {
    throw error;
  }

  if (gpx.tracks.length !== 1) {
    throw new Error("Expect exactly one track");
  }

  return gpx.tracks[0].points.map((it) => ({
    position_lat: it.latitude,
    position_long: it.longitude,
    altitude: it.elevation !== null ? it.elevation / 1000 : undefined,
    timestamp: it.time as Date,
  }));
}
