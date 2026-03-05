import { describe, it, expect } from "vitest";
import { clampZoom, zoomDeltaFromWheel } from "./camera-utils";
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "../constants";

describe("CameraController pure helpers", () => {
  describe("clampZoom", () => {
    it("clamps zoom below minimum to ZOOM_MIN", () => {
      expect(clampZoom(0.1)).toBe(ZOOM_MIN);
      expect(clampZoom(-1)).toBe(ZOOM_MIN);
      expect(clampZoom(0)).toBe(ZOOM_MIN);
    });

    it("clamps zoom above maximum to ZOOM_MAX", () => {
      expect(clampZoom(5)).toBe(ZOOM_MAX);
      expect(clampZoom(10)).toBe(ZOOM_MAX);
    });

    it("returns zoom within range unchanged", () => {
      expect(clampZoom(1.0)).toBe(1.0);
      expect(clampZoom(ZOOM_MIN)).toBe(ZOOM_MIN);
      expect(clampZoom(ZOOM_MAX)).toBe(ZOOM_MAX);
      expect(clampZoom(2.0)).toBe(2.0);
    });
  });

  describe("zoomDeltaFromWheel", () => {
    it("returns negative delta for positive deltaY (zoom out on scroll down)", () => {
      expect(zoomDeltaFromWheel(100)).toBe(-ZOOM_STEP);
      expect(zoomDeltaFromWheel(1)).toBe(-ZOOM_STEP);
    });

    it("returns positive delta for negative deltaY (zoom in on scroll up)", () => {
      expect(zoomDeltaFromWheel(-100)).toBe(ZOOM_STEP);
      expect(zoomDeltaFromWheel(-1)).toBe(ZOOM_STEP);
    });
  });
});
