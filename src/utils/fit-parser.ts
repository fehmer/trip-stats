//@ts-expect-error missing types
import FitParser from "fit-file-parser";
import { mergeByTime, type DataPoint } from "./data-point";

export type FitFile = {
  protocolVersion: number;
  profileVersion: number;
  activity: Activity;
  sessions: Session[];
  laps: Lap[];
  records: DataPoint[];
};

type Activity = {
  timetamp: Date;
  total_timer_time: number;
  num_sessions: number;
  local_timestamp: Date;
};

export type Session = {
  sport: "e_biking";
  timestamp: Date;
  start_time: Date;
  total_elapsed_time: number;
  total_timer_time: number;
  avg_cadence: number;
  avg_power: number;
  avg_speed: number;
  total_distance: number;
  max_cadence: number;
  max_power: number;
  max_speed: number;
  total_ascent: number;
  total_descent: number;
};

type Lap = {
  timestamp: Date;
  start_time: Date;
  total_elapsed_time: number;
  total_timer_time: number;
};

export async function parseFit(content: ArrayBuffer): Promise<FitFile> {
  const parser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    elapsedRecordField: true,
    mode: "list",
  });

  return new Promise((resolve, reject) => {
    parser.parse(content, (err: unknown, data: FitFile) => {
      if (err !== null) {
        reject(err);
      }
      //group activities
      data.records = groupRecords(data.records);

      resolve(data);
    });
  });
}

function groupRecords(records: DataPoint[]): DataPoint[] {
  //group by timestamp
  const grouped = Object.values(
    records.reduce<Record<number, DataPoint>>((acc, it) => {
      const ts = it.timestamp.getTime();
      acc[ts] = mergePoint(acc[ts] ?? {}, it) as DataPoint;
      return acc;
    }, {}),
  );

  //if the record is missing the position use the position of the nearest
  const pointsWIthPosition = grouped.filter(
    (it) => it.position_lat !== undefined && it.position_long !== undefined,
  );

  mergeByTime(grouped, pointsWIthPosition, (src, data) => {
    src.position_lat = src.position_lat ?? data.position_lat;
    src.position_long = src.position_long ?? data.position_long;
    src.distance = src.distance ?? data.distance;
  });

  return grouped;
}

function mergePoint(
  a: Partial<DataPoint>,
  b: Partial<DataPoint>,
): Partial<DataPoint> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: Record<string, any> = {};

  for (const key of keys as Set<keyof DataPoint>) {
    const left = a[key];
    const right = b[key];

    if (left === undefined || left === null) {
      result[key] = right;
    } else if (right === undefined || right === null) {
      result[key] = left;
    } else if (typeof left === "number" && typeof right === "number") {
      result[key] = Math.max(left, right);
    } else {
      result[key] = left;
    }
  }
  return result;
}
