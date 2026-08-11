# PB audit – Birmingham 2026

## MEN — COMPLETE 250/250

The Birmingham men's field has now been bulk-audited directly against the `personalbests` data attached to each World Athletics athlete profile.

Scope: exactly the 25 men present in the Birmingham project data × 10 decathlon events = **250 individual-event PBs**.

Senior-only rule used for the audit:
- 100 Metres
- Long Jump
- Shot Put = senior 7.26 kg only
- High Jump
- 400 Metres
- 110 Metres Hurdles = senior 106.7 cm only
- Discus Throw = senior 2 kg only
- Pole Vault
- Javelin Throw = senior 800 g only
- 1500 Metres

Junior implement/hurdle variants are excluded by requiring the exact senior World Athletics discipline name. All 250 senior PB entries were found; **0 are missing**.

### Bulk comparison result
- Athletes: **25/25**
- Senior PBs found and verified: **250/250**
- Values already matching after the earlier correction layer: **235**
- Remaining discrepancies found by the bulk audit: **15**
- Missing WA senior PB entries: **0**

The complete machine-readable audit is stored in `app/data/wa_men_pb_audit.json`.
The authoritative generated web override is stored in `app/data/wa_men_pb_verified.js` and contains all 250 verified senior PB marks, event points, PB date and PB venue.

## 15 residual discrepancies found and corrected by the bulk audit

1. Amadeus Gräber — Shot Put: **14.77 → 13.61** (senior Shot Put), Mösle-Stadium, Götzis (AUT), 2026-05-30.
2. Amadeus Gräber — 110 Metres Hurdles: **13.95 → 14.53** (senior hurdles), Rhein-Wied-Stadion, Neuwied (GER), 2026-05-16.
3. Rasmus Roosleht — Shot Put: **16.59 → 16.62** (senior Shot Put), Spordikooli Kergejõustikuhall, Pärnu (EST) (i), 2024-12-27.
4. Rasmus Roosleht — Discus Throw: **52.83 → 49.30** (senior Discus Throw), Malmö Stadion, Malmö (SWE), 2022-07-17.
5. Dario Dester — Discus Throw: **45.98 → 43.83** (senior Discus Throw), Stadionring, Ratingen (GER), 2026-06-28.
6. Ondřej Kopecký — 110 Metres Hurdles: **14.04 → 14.06** (senior hurdles), Stadion Juliska, Praha (CZE), 2023-05-20.
7. Andrin Huber — Shot Put: **15.19 → 14.87** (senior Shot Put), Landhaus, Teufen (SUI), 2026-06-27.
8. Andrin Huber — 110 Metres Hurdles: **14.00 → 14.12** (senior hurdles), Kleine Allmend, Frauenfeld (SUI), 2025-08-24.
9. Dai Keïta — Discus Throw: **39.43 → 41.32** (senior Discus Throw), Stadionring, Ratingen (GER), 2026-06-28.
10. Zsombor Gálpál — Discus Throw: **45.10 → 42.04** (senior Discus Throw), Ikarus BSE Sporttelep, Budapest (HUN), 2025-06-09.
11. Alberto Nonino — Shot Put: **13.39 → 13.09** (senior Shot Put), Centro Gabre Gabric, Brescia (ITA), 2026-04-25.
12. Alberto Nonino — 110 Metres Hurdles: **14.27 → 14.60** (senior hurdles), Centro Gabre Gabric, Brescia (ITA), 2026-04-26.
13. Alberto Nonino — Discus Throw: **43.98 → 42.26** (senior Discus Throw), Stadio M.S. Cozzoli, Molfetta (ITA), 2026-07-11.
14. Leon Krummenacher — 110 Metres Hurdles: **14.52 → 14.54** (senior hurdles), Landhaus, Teufen (SUI), 2026-06-28.
15. Leon Krummenacher — Discus Throw: **47.00 → 47.58** (senior Discus Throw), Letzigrund, Zürich (SUI), 2026-07-26.

## Earlier senior/junior corrections retained

The bulk audit was run after the existing correction layer, so earlier documented corrections such as Sander Skotheim shot put, Sven Roosen 110H, Tomas Järvinen 110H/discus, Makenson Gletty shot, Luuk Pelkmans senior implement/hurdle values and Zsombor Gálpál shot were already represented in the effective project values. The generated `wa_men_pb_verified.js` now supersedes these piecemeal corrections for the Birmingham men's single-event PB display by applying the complete set of 250 exact senior World Athletics PBs.

## Web publication

`app/index.html` loads `data/wa_men_pb_verified.js` after the older correction/venue files, so the verified senior World Athletics values and PB venues are authoritative in the Birmingham men's web view.

## Women

Women are not included in this completed men's audit. Their 24 × 7 audit remains a separate task.
