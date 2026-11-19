/**
 * @jest-environment node
 */
import { to } from "@permitzip/bim-units";
import {
  AISC_TABLE_1_1,
  sectionById,
  W_SHAPE_CATALOGUE_REVIEW,
  WIDE_FLANGE_SECTIONS,
} from "../src/sections";

/**
 * Golden expected properties for the eight shipped catalogue ids.
 *
 * These numbers are the values already in `sections.ts` (repo baseline),
 * locked here so a silent edit is caught. They are **not** a claim that the
 * printed AISC Manual Table 1-1 has been PE-verified in this change.
 * Flipping `verified` requires Phillip Dixon, PE (Civil), against the Manual.
 */
const GOLDEN_W_SHAPES: readonly {
  readonly id: string;
  readonly depthIn: number;
  readonly weightPlf: number;
  readonly areaIn2: number;
  readonly ixIn4: number;
  readonly sxIn3: number;
}[] = Object.freeze([
  { id: "W8X31", depthIn: 8.0, weightPlf: 31, areaIn2: 9.13, ixIn4: 110, sxIn3: 27.5 },
  { id: "W10X33", depthIn: 9.73, weightPlf: 33, areaIn2: 9.71, ixIn4: 171, sxIn3: 35.0 },
  { id: "W12X26", depthIn: 12.2, weightPlf: 26, areaIn2: 7.65, ixIn4: 204, sxIn3: 33.4 },
  { id: "W14X22", depthIn: 13.7, weightPlf: 22, areaIn2: 6.49, ixIn4: 199, sxIn3: 29.0 },
  { id: "W16X26", depthIn: 15.7, weightPlf: 26, areaIn2: 7.68, ixIn4: 301, sxIn3: 38.4 },
  { id: "W18X35", depthIn: 17.7, weightPlf: 35, areaIn2: 10.3, ixIn4: 510, sxIn3: 57.6 },
  { id: "W21X44", depthIn: 20.7, weightPlf: 44, areaIn2: 13.0, ixIn4: 843, sxIn3: 81.6 },
  { id: "W24X55", depthIn: 23.6, weightPlf: 55, areaIn2: 16.2, ixIn4: 1350, sxIn3: 114 },
]);

describe("c5x the wide-flange catalogue is typed data", () => {
  it("reads a section by the name drawings use, whatever its case or times sign", () => {
    expect(sectionById("W16X26")?.id).toBe("W16X26");
    expect(sectionById(" w16x26 ")?.id).toBe("W16X26");
    expect(sectionById("W16×26")?.id).toBe("W16X26");
    expect(sectionById("W40X999")).toBeNull();
  });

  it("carries depth, weight, area, Ix and Sx as typed quantities", () => {
    const s = sectionById("W16X26");
    if (!s) throw new Error("W16X26 missing");
    expect(to(s.depth, "in")).toBeCloseTo(15.7, 9);
    expect(to(s.depth, "mm")).toBeCloseTo(398.78, 6);
    expect(to(s.weight, "plf")).toBeCloseTo(26, 9);
    expect(to(s.area, "in2")).toBeCloseTo(7.68, 9);
    expect(to(s.ix, "in4")).toBeCloseTo(301, 9);
    expect(to(s.sx, "in3")).toBeCloseTo(38.4, 9);
    // 301 in⁴ × (25.4 mm/in)⁴ = 125,287,000 mm⁴; held in SI as 1.25287e-4 m⁴.
    expect(to(s.ix, "mm4")).toBeCloseTo(301 * 25.4 ** 4, 0);
    expect(s.ix).toBeCloseTo(1.25287e-4, 8);
    expect(s.verified).toBe(false);
  });

  it("every row is internally consistent: weight = area × 490 pcf and Sx = Ix ÷ (d/2), each within 1%", () => {
    // A transcription slip in any one column breaks one of these two identities.
    for (const s of WIDE_FLANGE_SECTIONS) {
      const plfFromArea = (to(s.area, "in2") / 144) * 490;
      expect({ id: s.id, ok: Math.abs(plfFromArea / to(s.weight, "plf") - 1) < 0.01 }).toEqual({ id: s.id, ok: true });
      const sxFromIx = to(s.ix, "in4") / (to(s.depth, "in") / 2);
      expect({ id: s.id, ok: Math.abs(sxFromIx / to(s.sx, "in3") - 1) < 0.01 }).toEqual({ id: s.id, ok: true });
    }
  });

  it("ships exactly the eight golden W-shape ids with locked property values", () => {
    expect(WIDE_FLANGE_SECTIONS.map((s) => s.id)).toEqual(GOLDEN_W_SHAPES.map((g) => g.id));
    for (const g of GOLDEN_W_SHAPES) {
      const s = sectionById(g.id);
      if (!s) throw new Error(`${g.id} missing`);
      expect(to(s.depth, "in")).toBeCloseTo(g.depthIn, 9);
      expect(to(s.weight, "plf")).toBeCloseTo(g.weightPlf, 9);
      expect(to(s.area, "in2")).toBeCloseTo(g.areaIn2, 9);
      expect(to(s.ix, "in4")).toBeCloseTo(g.ixIn4, 9);
      expect(to(s.sx, "in3")).toBeCloseTo(g.sxIn3, 9);
    }
  });

  it("cites AISC Manual 16th Ed. Table 1-1 and stays unverified until PE review", () => {
    expect(W_SHAPE_CATALOGUE_REVIEW.source).toBe(AISC_TABLE_1_1);
    expect(W_SHAPE_CATALOGUE_REVIEW.verified).toBe(false);
    expect(W_SHAPE_CATALOGUE_REVIEW.needsLicensedReview).toBe(true);
    expect(W_SHAPE_CATALOGUE_REVIEW.reviewerRole).toBe("Phillip Dixon, PE (Civil)");
    expect(WIDE_FLANGE_SECTIONS).toHaveLength(8);
    for (const s of WIDE_FLANGE_SECTIONS) {
      expect(s.source).toBe(AISC_TABLE_1_1);
      expect(s.verified).toBe(false);
    }
  });
});
