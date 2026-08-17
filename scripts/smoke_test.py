from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'app'

failures = []

def check(condition, message):
    if not condition:
        failures.append(message)

required = [
    APP / 'index.html',
    APP / 'app.js',
    APP / 'live-engine.js',
    APP / 'live-attempt-details.js',
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
check('live-attempt-details.js' in index, 'Live-attempt script not loaded')

basis = (APP / 'athlete-compare-basis-modal.js').read_text(encoding='utf-8')
check('onclick' not in basis or 'dblclick' not in basis.lower(), 'Unexpected double-click logic found in forecast basis popup')
check('basis-rank' in basis and '#f4f7fb' in basis, 'Forecast row numbers are not explicitly neutral/white')
check("n===2?'#ff8a19'" in basis, 'Two-result forecast colour is not orange')
check("n===3?'#ffd84d'" in basis, 'Three-result forecast colour is not yellow')
check("n>=4?'#45d483'" in basis, 'Four-result forecast colour is not green')
check("'#ff5b62'" in basis, 'One-result forecast colour is not red')

live = (APP / 'live-attempt-details.js').read_text(encoding='utf-8')
check('window.MKA_LIVE_DETAILS={getSection}' in live, 'Combined live result/attempt API is missing')
check('cell.onclick=' in live, 'Single-click live result handler is missing')
check('ondblclick=null' in live, 'Double-click cleanup is missing')
check('live-attempt-table' in live, 'Dedicated compact live-attempt table is missing')

for fname in ['i18n.js', 'i18n-final-data.js', 'i18n-final-runtime.js']:
    txt = (APP / fname).read_text(encoding='utf-8')
    check(any(token in txt for token in ['nb', "'nb'", '"nb"']), f'Norwegian language support missing in {fname}')
    check(any(token in txt for token in ['en', "'en'", '"en"']), f'English language support missing in {fname}')
    check(any(token in txt for token in ['de', "'de'", '"de"']), f'German language support missing in {fname}')

# Guard against accidental reintroduction of double-click behaviour in active app scripts.
for p in APP.glob('*.js'):
    txt = p.read_text(encoding='utf-8', errors='ignore').lower()
    if 'ondblclick' in txt and 'ondblclick=null' not in txt:
        failures.append(f'Potential active double-click handler in {p.name}')
    if 'addEventListener("dblclick"' in txt or "addEventListener('dblclick'" in txt:
        failures.append(f'Potential active double-click listener in {p.name}')

if failures:
    print('SMOKE TEST FAILED')
    for f in failures:
        print(f'- {f}')
    sys.exit(1)

print('SMOKE TEST OK: critical Mangekampanalyse Pro invariants are present.')
