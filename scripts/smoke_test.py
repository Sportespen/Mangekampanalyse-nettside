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

# Runtime single-click contract:
# live-engine.js still contains a legacy terminal-status dblclick assignment, but
# live-attempt-details.js is loaded afterwards and explicitly clears dblclick and
# installs the single-click handler on live result cells. Guard the effective
# runtime behaviour instead of rejecting the known overridden legacy assignment.
engine = (APP / 'live-engine.js').read_text(encoding='utf-8', errors='ignore').lower()
if 'ondblclick' in engine:
    check('live-attempt-details.js' in index and 'ondblclick=null' in live and 'cell.onclick=' in live,
          'Legacy double-click handler is not neutralised by the single-click runtime layer')

# No other app script may introduce a new active double-click listener.
for p in APP.glob('*.js'):
    if p.name in {'live-engine.js', 'live-attempt-details.js'}:
        continue
    txt = p.read_text(encoding='utf-8', errors='ignore').lower()
    if 'ondblclick' in txt:
        failures.append(f'Potential active double-click handler in {p.name}')
    if 'addeventlistener("dblclick"' in txt or "addeventlistener('dblclick'" in txt:
        failures.append(f'Potential active double-click listener in {p.name}')

if failures:
    print('SMOKE TEST FAILED')
    for f in failures:
        print(f'- {f}')
    sys.exit(1)

print('SMOKE TEST OK: critical Mangekampanalyse Pro invariants are present.')
