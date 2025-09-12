import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { getCssVar } from "./utils/dom";
import { zoomToDistance } from "./chart";
import type { DataPoint } from "./utils/data-point";
import { getFitFile } from "./global";

let map: L.Map | null = null;
let highlightLine: L.Polyline | null = null;
let data: DataPoint[] | null = null;

export async function updateMap(
  points: DataPoint[] | undefined,
): Promise<void> {
  data = points ?? null;
  if (!data) return;

  const element = document.getElementById("map") as HTMLElement;

  const color = getCssVar("--link-color");

  if (data === undefined) {
    element.classList.add("hidden");
    return;
  }
  // Convert to LatLngs
  const latlngs: L.LatLngExpression[] = toLatLng(data);

  if (latlngs.length === 0) {
    map?.remove();
    return;
  }

  map?.remove(); // remove existing map instance

  map = L.map("leaflet", {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView(latlngs[0], 13); // center at first point

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add route as polyline
  const routeLine = L.polyline(latlngs, {
    color: color,
    weight: 5,
    opacity: 0.8,
  }).addTo(map);

  //show popup on hover
  routeLine.addEventListener("mouseover", (e: L.LeafletMouseEvent) => {
    if (!map || !data) return;

    const nearest = findNearestPoint(e.latlng, latlngs);
    const point = data.find(
      (it) =>
        it.position_lat === nearest.lat && it.position_long === nearest.lng,
    );

    if (point) {
      const popup = L.popup()
        .setLatLng(nearest)
        .setContent(formatPopupTable(point))
        .openOn(map);

      // Store popup to close it later if needed
      (routeLine as any)._hoverPopup = popup;
    }
  });

  //remove popup when mouse leaves the track
  routeLine.addEventListener("mouseout", () => {
    // Close popup on mouse out
    if ((routeLine as any)._hoverPopup) {
      map?.closePopup((routeLine as any)._hoverPopup);
      delete (routeLine as any)._hoverPopup;
    }
  });

  routeLine.addEventListener("click", (e: L.LeafletMouseEvent) => {
    if (!map || !data) return;
    const nearest = findNearestPoint(e.latlng, latlngs);
    const point = data.find(
      (it) =>
        it.position_lat === nearest.lat && it.position_long === nearest.lng,
    );
    if (point) {
      const min = point.distance - 0.5;
      const max = point.distance + 0.5;
      zoomToDistance(min, max);
      highlightByDistance(min, max);
    }
  });

  // Fit bounds to route
  map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

  const CenterControl = L.Control.extend({
    options: { position: "topleft" },

    onAdd: function () {
      const button = L.DomUtil.create("button", "leaflet-bar leaflet-control");
      button.innerHTML = " ✛ ";
      button.title = "Center map";
      button.style.padding = "6px";
      button.style.background = "white";
      button.style.cursor = "pointer";

      // Prevent map drag on click
      L.DomEvent.disableClickPropagation(button);

      button.onclick = function () {
        const max = getFitFile()!.sessions[0].total_distance;

        zoomToDistance(0, max);
        if (highlightLine !== null) {
          map?.removeLayer(highlightLine);
        }
        map?.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      };

      return button;
    },
  });

  map.addControl(new CenterControl());

  element.classList.remove("hidden");
}

function findNearestPoint(
  latlng: L.LatLng,
  points: L.LatLngExpression[],
): L.LatLng {
  let minDist = Infinity;
  let nearest = latlng;

  points.forEach((p) => {
    const point = L.latLng(p);
    const dist = latlng.distanceTo(point); // meters
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  });

  return nearest;
}

function formatPopupTable(data: DataPoint): string {
  const fieldsToDisplay: {
    key: keyof DataPoint;
    label: string;
    unit?: string;
  }[] = [
    { key: "timestamp", label: "Time" },
    { key: "altitude", label: "Altitude", unit: "m" },
    { key: "distance", label: "Distance", unit: "km" },
    { key: "speed", label: "Speed", unit: "km/h" },
    { key: "power", label: "Power", unit: "W" },
    { key: "cadence", label: "Cadence", unit: "rpm" },
  ];

  const rows = fieldsToDisplay.map(({ key, label, unit }) => {
    if (!(key in data)) return "";

    let value: unknown = data[key];

    if (key === "timestamp") {
      value = (value as Date).toLocaleString(); // format timestamp
    } else if (typeof value === "number" && value !== 0) {
      value = value.toFixed(2); // round to 2 decimals
    }

    return `<tr><td><strong>${label}</strong></td><td>${value}${unit ? " " + unit : ""}</td></tr>`;
  });

  return `
    <table style="font-size: 12px;">
      ${rows.join("")}
    </table>
  `;
}

export function highlightByDistance(min: number, max: number): void {
  if (!map || !data) return;

  const highlightColor = getCssVar("--chart-power");
  if (highlightLine !== null) {
    map.removeLayer(highlightLine);
  }

  const selection = data.filter(
    (it) => it.distance >= min && it.distance <= max,
  );

  highlightLine = L.polyline(toLatLng(selection), {
    color: highlightColor,
    weight: 3,
    opacity: 1,
  }).addTo(map);
  map.fitBounds(highlightLine.getBounds(), { padding: [50, 50] });
}

function toLatLng(points: DataPoint[]): L.LatLngExpression[] {
  return points
    .filter(
      (p) => p.position_lat !== undefined && p.position_long !== undefined,
    )
    .map((p) => [
      p.position_lat as number,
      p.position_long as number,
    ]) as L.LatLngExpression[];
}
