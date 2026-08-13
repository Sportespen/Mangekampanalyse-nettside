# Women history QA – Birmingham 2026

Fresh rebuild source: World Athletics results, seasons 2025–2026, cutoff before Birmingham competition start.

Rules used by `scripts/build_wa_history.mjs`:
- senior results only
- legal wind only for 100 m hurdles, 200 m and long jump
- invalid marks (DNS/DNF/DQ/NM/NH/NT) excluded
- duplicates removed
- maximum four most recent valid results per event
- women only rebuild preserves verified men history

## Fresh rebuild status

The fresh women rebuild completed successfully and produced 39 event gaps with fewer than four valid results. Gaps are retained unless World Athletics evidence proves a valid senior 2025–2026 performance is missing.

## Priority review – one-result gaps

### Katarina Johnson-Thompson
- High jump: 1
- 200 m: 1
- 800 m: 1
- World Athletics confirms her Tokyo 2025 heptathlon included 1.86 high jump and 23.51 (+0.4) 200 m. Current one-result counts are retained unless contrary WA evidence is found.

### Sophie Weißenberg
- 200 m: 1
- 800 m: 1
- World Athletics confirms her Götzis 2026 heptathlon and 23.25 200 m. Current counts retained unless contrary WA evidence is found.

### Noor Vidts
- Javelin: 1
- 800 m: 1
- World Athletics confirms her 2026 combined-events activity. Current counts retained unless additional qualifying senior outdoor results are verified.

### Jana Koščak
- 100 m hurdles: 1
- 200 m: 1
- European U20 Championships 2025 results remain excluded by the senior-only rule.

## Two-result gap review in progress

### Sveva Gerevini
- 100 m hurdles: 2
- 200 m: 2
- Javelin: 2
- WA confirms Tokyo 2025: 13.52 in 100 m hurdles and 44.16 in javelin.
- WA confirms 2026 season activity and her 6413 heptathlon national record on 31 May 2026.
- Older Rome 2024 performances are outside the 2025–2026 source window and must not be used to inflate coverage.
- Current two-result counts are retained unless another qualifying 2025–2026 outdoor result is verified.

## QA rule reinforced

A field with only 1–3 results is not automatically an error. It is acceptable when WA contains fewer than four qualifying senior performances in the source window. Do not backfill with U20 results, 2024 results, indoor substitutes for outdoor disciplines, illegal-wind marks, invalid marks, or duplicates.

## Remaining QA order

1. Finish all remaining two-result gaps against World Athletics.
2. Finish all remaining three-result gaps.
3. Modify `history_web.js` only where a missing qualifying performance is positively verified.
4. Do not use old women history patch files or legacy bulk files as a source.
