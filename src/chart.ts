import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { getCssVar } from "./utils/dom";
import type { DataPoint } from "./utils/data-point";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
  zoomPlugin,
);

let chart: Chart | null;

export async function updateChart(
  data: DataPoint[] | undefined,
): Promise<void> {
  const element = document.getElementById("chart") as HTMLElement;
  if (data === undefined) {
    element.classList.add("hidden");
    return;
  }
  const ctx = document.getElementById("rideChart") as HTMLCanvasElement;

  const labels = data.map((d) => d.distance);

  const pickData = (
    key: Exclude<keyof DataPoint, "timestamp">,
    convert?: (value: number | undefined) => number | undefined,
  ): { x: number; y: number }[] =>
    data
      .map((d) => ({
        x: d.distance,
        y: (convert?.(d[key]) ?? d[key]) as number,
      }))
      .filter((it) => it.y !== undefined);

  const axisColor = getCssVar("--text-color");
  const tickColor = getCssVar("--muted-color");

  chart?.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Speed (km/h)",
          data: pickData("speed"),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y",
          parsing: false,
          pointRadius: 1,
          spanGaps: true,
        },
        {
          label: "Power (W)",
          data: pickData("power"),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y1",
          parsing: false,
          pointRadius: 1,
          spanGaps: true,
        },
        {
          label: "Cadence (rpm)",
          data: pickData("cadence"),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y2",
          parsing: false,
          pointRadius: 1,
          spanGaps: true,
        },
        {
          label: "Altitude (m)",
          data: pickData("altitude", (it) =>
            it === undefined ? undefined : Math.round(it * 1000),
          ),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y3",
          parsing: false,
          pointRadius: 1,
          fill: true,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      aspectRatio: 2,
      parsing: false,
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      plugins: {
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              return "km " + items[0].parsed.x.toFixed(3);
            },
          },
        },
        legend: {
          position: "top",
        },
        decimation: {
          enabled: false,
          algorithm: "lttb", // or 'min-max'
          samples: 250,
          threshold: 1000,
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            //modifierKey: "ctrl",
          },
          zoom: {
            wheel: {
              enabled: true,
              //              modifierKey: "ctrl",
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
          limits: {
            x: { min: "original", max: "original" },
            y: { min: "original", max: "original" },
          },
        },
      },
      scales: {
        /*  x: {
          type: "time",
          time: {
            unit: "minute",
            tooltipFormat: "HH:mm:ss",
          },
          title: {
            display: true,
            text: "Time",
          },
        },
        */
        x: {
          type: "linear",

          title: {
            display: true,
            text: "Distance",
            color: axisColor,
          },
          ticks: {
            color: tickColor,
          },
          max: Math.max(...labels),
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Speed (km/h)",
            color: axisColor,
          },
          ticks: {
            color: tickColor,
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Power (W)",
            color: axisColor,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: tickColor,
          },
        },
        y2: {
          type: "linear",
          display: true,
          position: "right",
          offset: true,
          title: {
            display: true,
            text: "Cadence (rpm)",
            color: axisColor,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: tickColor,
          },
        },
        y3: {
          type: "linear",
          display: true,
          position: "left",
          offset: true,
          title: {
            display: true,
            text: "Altitude (m)",
            color: axisColor,
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: tickColor,
          },
        },
      },
    },
  });

  element.classList.remove("hidden");
}

document.getElementById("resetZoom")?.addEventListener("click", () => {
  chart?.resetZoom();
});
