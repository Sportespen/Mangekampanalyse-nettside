# PB audit – Birmingham 2026

## COMPLETE — 418/418

The Birmingham PB audit is complete for the exact project start fields:
- Men: 25 athletes × 10 events = **250/250**
- Women: 24 athletes × 7 events = **168/168**
- Total: **418/418 verified**

The audit uses the `personalbests` data attached to each World Athletics athlete profile and requires the exact senior discipline name. Age-group/junior variants are therefore excluded where World Athletics stores them as separate disciplines. PB mark, PB date and PB venue are stored in the generated verified web layers.

## Men — COMPLETE 250/250

- Athletes: **25/25**
- Senior PBs found: **250/250**
- Already matching effective project data: **235**
- Discrepancies corrected by bulk audit: **15**
- Missing senior PBs: **0**

Authoritative files:
- `app/data/wa_men_pb_audit.json`
- `app/data/wa_men_pb_verified.js`

Men's residual corrections found by the bulk audit:
1. Amadeus Gräber — Shot Put 14.77 → 13.61.
2. Amadeus Gräber — 110 Metres Hurdles 13.95 → 14.53.
3. Rasmus Roosleht — Shot Put 16.59 → 16.62.
4. Rasmus Roosleht — Discus Throw 52.83 → 49.30.
5. Dario Dester — Discus Throw 45.98 → 43.83.
6. Ondřej Kopecký — 110 Metres Hurdles 14.04 → 14.06.
7. Andrin Huber — Shot Put 15.19 → 14.87.
8. Andrin Huber — 110 Metres Hurdles 14.00 → 14.12.
9. Dai Keïta — Discus Throw 39.43 → 41.32.
10. Zsombor Gálpál — Discus Throw 45.10 → 42.04.
11. Alberto Nonino — Shot Put 13.39 → 13.09.
12. Alberto Nonino — 110 Metres Hurdles 14.27 → 14.60.
13. Alberto Nonino — Discus Throw 43.98 → 42.26.
14. Leon Krummenacher — 110 Metres Hurdles 14.52 → 14.54.
15. Leon Krummenacher — Discus Throw 47.00 → 47.58.

Earlier documented senior/junior corrections in the project are retained, but the generated `wa_men_pb_verified.js` is now authoritative for Birmingham men's single-event PB values, points, dates and venues.

## Women — COMPLETE 168/168

- Athletes: **24/24**
- Senior PBs found: **168/168**
- Already matching effective project data: **164**
- Discrepancies corrected by bulk audit: **4**
- Missing senior PBs: **0**

Authoritative files:
- `app/data/wa_women_pb_audit.json`
- `app/data/wa_women_pb_verified.js`

Women's discrepancies found and corrected:
1. Adrianna Sułek-Schubert — 200 m: **23.69 → 23.77**, Hayward Field, Eugene (USA), 2022-07-17.
2. Beatričė Juškevičiūtė — 200 m: **23.56 → 23.58**, Mösle-Stadium, Götzis (AUT), 2024-05-18.
3. Jéssica Barreira — 200 m: **24.13 → 24.25**, Estadio Atlético de la VIDENA, Lima (PER), 2026-05-29.
4. Anastasia Ntragkomirova — 200 m: **25.13 → 25.36**, Panthessaliko Stadium, Volos (GRE), 2025-07-26.

## Web publication

`app/index.html` loads both generated verified layers after the older correction and venue files:
- `data/wa_men_pb_verified.js`
- `data/wa_women_pb_verified.js`

Therefore the verified World Athletics senior PB marks, event points, PB dates and PB venues are authoritative in the Birmingham web view.

**CONTROL COMPLETE: 418/418.**
