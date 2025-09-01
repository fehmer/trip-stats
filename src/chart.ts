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
import type { DataPoint } from "./utils/fit-parser";
import { getCssVar } from "./utils/dom";

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
  const speedData = data.map((d) => ({ x: d.distance, y: d.speed }));
  const powerData = data.map((d) => ({ x: d.distance, y: d.power }));
  const cadenceData = data.map((d) => ({ x: d.distance, y: d.cadence }));

  const axisColor = getCssVar("--text-color");
  const tickColor = getCssVar("--muted-color");

  chart?.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Speed (km/h)",
          data: speedData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y",
          parsing: false,
          pointRadius: 0,
        },
        {
          label: "Power (W)",
          data: powerData,
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y1",
          parsing: false,
          pointRadius: 0,
          fill: true,
        },
        {
          label: "Cadence (rpm)",
          data: cadenceData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          borderWidth: 1.5,
          tension: 0.3,
          yAxisID: "y2",
          parsing: false,
          pointRadius: 0,
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
              return "km " + items[0].parsed.x.toFixed(2);
            },
          },
        },
        legend: {
          position: "top",
        },
        decimation: {
          enabled: true,
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
      },
    },
  });

  element.classList.remove("hidden");
}

document.getElementById("resetZoom")?.addEventListener("click", () => {
  chart.resetZoom();
});
