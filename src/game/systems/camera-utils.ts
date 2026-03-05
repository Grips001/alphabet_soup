import { ZOOM_MAX, ZOOM_MIN } from "../constants";

/** Clamp zoom value to allowed range. */
export function clampZoom(zoom: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
}

/** Calculate zoom delta from wheel event deltaY. */
export function zoomDeltaFromWheel(deltaY: number): number {
  return deltaY > 0 ? -0.1 : 0.1;
}
