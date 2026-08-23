from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'app'

cfg=(APP/'competition-config.js').read_text(encoding='utf-8')
live=(APP/'data'/'live_decastar.js').read_text(encoding='utf-8')
data=(APP/'data'/'decastar_2026.js').read_text(encoding='utf-8')

assert "birmingham" in cfg and "decastar" in cfg
assert "mka-live-last-known-good-v2:birmingham" in cfg
assert "mka-live-last-known-good-v2:decastar" in cfg
assert "enabled:false" in cfg, "Decastar must remain disabled until official start list/live source are ready"
assert "results:{}" in live and "completedEvents:0" in live
assert "awaiting_start_list" in data
assert "athletes:[]" in data
print('DECASTAR PREP TEST OK')
