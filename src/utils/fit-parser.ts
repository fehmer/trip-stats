//@ts-expect-error missing types
import FitParser from "fit-file-parser";

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

export type DataPoint = {
  timestamp: Date;
  elapsed_time: number;
  timer_time: number;
  cadence: number;
  distance: number;
  speed: number;
  power: number;
  position_lat: number;
  position_long: number;
  altitude: number;
};

export async function parse(content: ArrayBuffer): Promise<FitFile> {
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
  const grouped = Object.values(
    records.reduce<Record<number, DataPoint>>((acc, it) => {
      const ts = it.timestamp.getTime();
      acc[ts] = { ...(acc[ts] ?? {}), ...it };
      return acc;
    }, {}),
  );

  //make sure all entries have a position
  for (let i = 0; i < grouped.length; i++) {
    const current = grouped[i];
    if (
      current.position_lat !== undefined &&
      current.position_long !== undefined
    )
      continue;

    const nearest = nearestPosition(grouped, i);

    grouped[i] = {
      ...current,
      position_lat: nearest.position_lat,
      position_long: nearest.position_long,
    };
  }
  return grouped;
}

/**
 * find the nearest dataPoint with a position,
 * @param records
 * @param i
 * @returns
 */
function nearestPosition(
  records: DataPoint[],
  i: number,
): Pick<DataPoint, "position_lat" | "position_long"> {
  let previous;
  let next;
  let search = i;

  while (search > 1 && previous === undefined) {
    search--;
    if (
      records[search].position_lat !== undefined &&
      records[search].position_long !== undefined
    ) {
      previous = records[search];
    }
  }
  search = i;
  while (search < records.length - 1 && next === undefined) {
    search++;
    if (
      records[search].position_lat !== undefined &&
      records[search].position_long !== undefined
    ) {
      next = records[search];
    }
  }

  if (next === undefined && previous === undefined) {
    throw new Error("no positions found");
  }
  if (next === undefined) return previous as DataPoint;
  if (previous === undefined) return next;

  return Math.abs(records[i].elapsed_time - previous.elapsed_time) <
    Math.abs(records[i].elapsed_time - next.elapsed_time)
    ? previous
    : next;
}
