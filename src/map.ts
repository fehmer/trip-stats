import "leaflet/dist/leaflet.css";

import L from "leaflet";
import type { DataPoint } from "./utils/fit-parser";
import { getCssVar } from "./utils/dom";

let map: L.Map | null = null;

export async function updateMap(data: DataPoint[] | undefined): Promise<void> {
  const element = document.getElementById("map") as HTMLElement;

  const color = getCssVar("--link-color");

  if (data === undefined) {
    element.classList.add("hidden");
    return;
  }
  // Convert to LatLngs
  const latlngs: L.LatLngExpression[] = data
    .filter(
      (p) => p.position_lat !== undefined && p.position_long !== undefined,
    )
    .map((p) => [p.position_lat as number, p.position_long as number]);

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
    weight: 4,
    opacity: 0.8,
  }).addTo(map);

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
        map?.setView(latlngs[0], 13); // center at first point
        map?.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      };

      return button;
    },
  });

  map.addControl(new CenterControl());

  element.classList.remove("hidden");
}
