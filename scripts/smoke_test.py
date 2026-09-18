from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'app'

failures = []

def check(condition, message):
    if not condition:
        failures.append(message)

required = [
    APP / 'index.html',
    APP / 'app-fix20260918.js',
    APP / 'live-engine-fix20260918.js',
    APP / 'live-attempt-details-fix20260918.js',
    APP / 'athlete-compare-basis-modal.js',
    APP / 'i18n.js',
    APP / 'i18n-final-data.js',
    APP / 'i18n-final-runtime.js',
    APP / 'data' / 'live_birmingham.js',
]
for p in required:
    check(p.exists() and p.stat().st_size > 0, f'Missing or empty required file: {p.relative_to(ROOT)}')

index = (APP / 'index.html').read_text(encoding='utf-8')
check('data-tab="analyse"' in index, 'Startanalyse tab missing')
check('data-tab="ranking"' in index, 'PB-by-event tab missing')
check('data-tab="forecast"' in index, 'Forecast tab missing')
check('data-type="men"' in index and 'data-type="women"' in index, 'Men/women event switch missing')
check('Grønn = 4 resultater' in index and 'Gul = 3 resultater' in index and 'Oransje = 2 resultater' in index and 'Rød = 1 resultat' in index, 'Forecast colour legend is incomplete')
check('athlete-compare-basis-modal.js' in index, 'Forecast-basis popup script not loaded')
check('live-attempt-details-fix20260918.js' in index, 'Live-attempt script not loaded')
# forecast-popup-fast.js was a stale duplicate of the "Opprinnelig forventet sluttpoeng"
# dropdown: it registered its own capturing document click listener for '.forecast-total-cell'
# with stopImmediatePropagation(), loaded before forecast-enhancements-*.js, so ITS buggy
# (no-fallback-to-older-seasons) originalTotal() silently won over the correct one for every
# athlete missing 2025-2026 results in any event (e.g. Markus Rooth). Never re-add this script.
check('forecast-popup-fast.js' not in index, 'Stale forecast-popup-fast.js must not be loaded (it silently overrides the forecast score dropdown - see PR #155)')

basis = (APP / 'athlete-compare-basis-modal.js').read_text(encoding='utf-8')
check('basis-rank' in basis and '#f4f7fb' in basis, 'Forecast row numbers are not explicitly neutral/white')
check("n===2?'#ff8a19'" in basis, 'Two-result forecast colour is not orange')
check("n===3?'#ffd84d'" in basis, 'Three-result forecast colour is not yellow')
check("n>=4?'#45d483'" in basis, 'Four-result forecast colour is not green')
check("'#ff5b62'" in basis, 'One-result forecast colour is not red')

live = (APP / 'live-attempt-details-fix20260918.js').read_text(encoding='utf-8')
check('window.MKA_LIVE_DETAILS={getSection}' in live, 'Combined live result/attempt API is missing')
check('cell.onclick=' in live, 'Single-click live result handler is missing')
check('ondblclick=null' in live, 'Double-click cleanup is missing')
check('live-attempt-table' in live, 'Dedicated compact live-attempt table is missing')

for fname in ['i18n.js', 'i18n-final-data.js', 'i18n-final-runtime.js']:
    txt = (APP / fname).read_text(encoding='utf-8')
    check(any(token in txt for token in ['nb', "'nb'", '"nb"']), f'Norwegian language support missing in {fname}')
    check(any(token in txt for token in ['en', "'en'", '"en"']), f'English language support missing in {fname}')
    check(any(token in txt for token in ['de', "'de'", '"de"']), f'German language support missing in {fname}')

# Verify the effective runtime contract rather than scanning every historical
# compatibility file. live-attempt-details-fix20260918.js is loaded after
# live-engine-fix20260918.js and is the authoritative layer for result-cell
# interaction (renamed from live-attempt-details.js/live-engine.js so a fresh
# fetch is guaranteed regardless of any CDN cache keyed on path alone).
check('live-attempt-details-fix20260918.js' in index, 'Authoritative single-click runtime layer is not loaded')
check('cell.ondblclick=null' in live, 'Authoritative runtime does not clear double-click handlers')
check('cell.onclick=' in live, 'Authoritative runtime does not install single-click handlers')

if failures:
    print('SMOKE TEST FAILED')
    for f in failures:
        print(f'- {f}')
    sys.exit(1)

print('SMOKE TEST OK: critical Mangekampanalyse Pro invariants are present.')
