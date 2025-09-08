export type DataPoint = {
  timestamp: Date;
  elapsed_time: number;
  timer_time: number;
  cadence: number;
  distance: number;
  speed: number;
  power: number;
  position_lat?: number;
  position_long?: number;
  altitude?: number;
};

/**
 * merge by time, expect both arrays to be sorted by time
 * @param src
 * @param data
 * @param fn merge function
 */
export function mergeByTime(
  src: DataPoint[],
  data: (Partial<DataPoint> & Pick<DataPoint, "timestamp">)[],
  fn: (src: DataPoint, data: Partial<DataPoint>) => void,
): void {
  let index = 0;
  for (let point of src) {
    const time = point.timestamp.getTime();

    while (
      index + 1 < data.length &&
      Math.abs(data[index + 1].timestamp.getTime() - time) <
        Math.abs(data[index].timestamp.getTime() - time)
    ) {
      index++;
    }

    fn(point, data[index]);
  }
}
