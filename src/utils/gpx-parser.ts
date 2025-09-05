import { parseGPX } from "@we-gold/gpxjs";
import type { DataPoint } from "./fit-parser";

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
    altitude: (it.elevation ?? 0) / 1000,
    timestamp: it.time as Date,
  }));
}

/**
 * merge gpx positions with existing data points by timestamp.
 * @param src
 * @param gpx
 * @returns
 */
export function merge(src: DataPoint[], gpx: GpxWaypoint[]): DataPoint[] {
  let gpxIndex = 0;

  for (let point of src) {
    const time = point.timestamp.getTime();

    while (
      gpxIndex + 1 < gpx.length &&
      Math.abs(gpx[gpxIndex + 1].timestamp.getTime() - time) <
        Math.abs(gpx[gpxIndex].timestamp.getTime() - time)
    ) {
      gpxIndex++;
    }

    const closest = gpx[gpxIndex];
    point.altitude = closest.altitude;
    point.position_lat = closest.position_lat;
    point.position_long = closest.position_long;
  }

  return src;
}
