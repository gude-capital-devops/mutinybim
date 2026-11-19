# @permitzip/bim-pack-structural

The MutinyBIM Structural pack (namespace `struct`). Apache-2.0, private, version 0.1.0.

## What it proves

That a whole discipline can be added to MutinyBIM as a pack, through the add-on
contract only, with **no kernel edits**. It imports `@permitzip/bim-pack`,
`@permitzip/bim-units`, zod and the kernel's published subpaths, nothing else
(`packages/bim-kernel/__tests__/c5k-proof-pack-isolation.test.ts`).

## What it contributes

- **Classes** with IFC 4.3 hints: steel beams (`IfcBeam` BEAM) and columns
  (`IfcColumn` COLUMN) placed along lines, pad footings (`IfcFooting`
  PAD_FOOTING) at points, roof and floor decks (`IfcSlab` ROOF / FLOOR) over
  areas with a span direction.
- **A wide-flange catalogue** (eight W-shapes, AISC Steel Construction Manual
  16th Ed. Table 1-1 dimensions / Ix / Sx as typed quantities). Every row
  ships with `verified: false` until a licensed professional confirms the
  printed table. See **W-shape catalogue verification** below.
- **Parameters** (section, steel grade, live load use) on the parameter-set
  point, so the Inspector, schedules, agent tools and IFC export offer them.
- **Live load by use**: a `struct.live_load` space-use rate (psf over area),
  its value on the built-in office, corridor, retail and storage uses, and a
  roof use; ASCE 7-22 Table 4.3-1, unreduced.
- **Tributary areas** as a derived-zone rule (`struct.tributary`) with a
  dependency signature, and a `struct.tributary` zone purpose.
- **The gravity load path**: a `struct.gravity_load` service row and a
  network-to-total adapter (`struct.load_path`); the kernel walks and totals
  reactions down deck → beam → column → footing (`serviceNetworkTotals`), by
  load case (dead, live, equipment).
- **A lint rule** (`struct.footing_unsupported`) and **a calc**
  (`struct.simple_beam`: reactions, largest moment, utilisation).

## W-shape catalogue verification

**Source:** AISC Steel Construction Manual, 16th Edition, **Table 1-1**
(W-shapes). Citation of table and edition only — do not paste Manual prose
(copyright).

**Status:** all eight rows (`W8X31` … `W24X55`) remain `verified: false`.
Internal consistency tests (weight ≈ area × 490 pcf; Sx ≈ Ix / (d/2)) and a
golden lock of the in-repo property values guard against silent edits. Those
checks are **not** a substitute for comparing each number to the printed
Manual.

**Needs licensed review:** before any row is marked `verified: true` or the
catalogue is claimed ready for permit work, **Phillip Dixon, PE (Civil)**
must review each property against Table 1-1. Anthony Gude is not a PE and
must not sign engineering correctness. Export `W_SHAPE_CATALOGUE_REVIEW`
documents this gate for reviewers.

**PE checklist (Table 1-1):** for each of the eight ids, confirm depth,
nominal weight, area, Ix and Sx match the Manual; then flip that row’s
`verified` flag (and update tests that assert `false`) in a follow-up change
that cites the review.

## Limits

- One service-level load case. No load factors or combinations (scenarios,
  round 6), no live-load reduction, no deflection, no lateral loads.
- One-way rectangular decks; beams square to the span; simple spans only.
- Footing and deck self-weight are not counted.
- Beam ends are network nodes of their own (`<beamId>@start`), because one
  edge factor can't split a beam's loads case by case. Open gaps are listed in
  the internal design note, "Foundation gaps found".
- Wide-flange and live-load table values are unverified until licensed review.
