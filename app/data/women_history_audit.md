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

The fresh women rebuild completed successfully and produced 39 event gaps with fewer than four valid results. These gaps are reviewed before any manual addition is accepted.

## Priority review – one-result gaps

### Katarina Johnson-Thompson
- High jump: 1
- 200 m: 1
- 800 m: 1
- World Athletics confirms her Tokyo 2025 heptathlon included 1.86 high jump and 23.51 (+0.4) 200 m. Her 2026 pre-Birmingham competition activity includes standalone events such as shot put, but no additional verified senior 200 m/high jump/800 m result has been identified yet. Current one-result counts are therefore retained pending contrary WA evidence.

### Sophie Weißenberg
- 200 m: 1
- 800 m: 1
- World Athletics confirms her Götzis 2026 heptathlon (6449) and 23.25 200 m. No second verified senior 2025–2026 200 m or 800 m result has yet been identified. Current counts retained.

### Noor Vidts
- Javelin: 1
- 800 m: 1
- World Athletics confirms her Götzis 2026 heptathlon. No additional verified senior outdoor 2025–2026 javelin/800 m result has yet been identified. Current counts retained.

### Jana Koščak
- 100 m hurdles: 1
- 200 m: 1
- Her European U20 Championships 2025 results are intentionally excluded by the senior-only rule. Current counts therefore must not be increased using U20 performances.

## Next QA order

1. Review all remaining two-result gaps against World Athletics.
2. Review all remaining three-result gaps.
3. Add only performances that satisfy the same senior/wind/date/deduplication rules.
4. Do not use old women history patch files or legacy bulk files as a source.
