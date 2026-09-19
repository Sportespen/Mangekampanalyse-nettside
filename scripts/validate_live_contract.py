#!/usr/bin/env python3
"""Validate a live-results JSON payload against the contract the client expects.

Run this against a NEW organizer's live-results function before pointing the client at it, so a
schema mistake is caught here instead of showing up as a silent blank table in the browser.

Usage:
    python3 scripts/validate_live_contract.py https://mangekampanalyse.no/api/live-decastar
    python3 scripts/validate_live_contract.py path/to/response.json

See functions/api/_TEMPLATE-live-organizer.js for the full annotated contract this checks against,
and CLAUDE.md's "Neste arrangør" playbook for how this fits into the overall swap-over process.
"""
import json
import sys
import urllib.request

TERMINAL_CODES = {'DNS', 'DNF', 'DQ', 'NM', 'NH'}
ATTEMPT_MODES = {'series', 'vertical', None}

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(source):
    if source.startswith('http://') or source.startswith('https://'):
        req = urllib.request.Request(source, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.loads(r.read().decode('utf-8'))
    with open(source, encoding='utf-8') as f:
        return json.load(f)


def check_attempt(disc, name, discipline, i, a, attempt_mode):
    label = f'{name} / {discipline} / attempts[{i}]'
    if not isinstance(a, dict):
        err(f'{label}: not an object')
        return
    if 'attemptId' not in a:
        err(f'{label}: missing attemptId')
    if attempt_mode == 'vertical':
        if 'height' not in a:
            err(f'{label}: vertical attempt missing "height"')
    if 'result' not in a:
        err(f'{label}: missing "result"')


def check_discipline_entry(name, discipline, entry):
    label = f'{name} / {discipline}'
    if not isinstance(entry, dict):
        err(f'{label}: not an object')
        return
    for field in ('mark', 'display', 'resultStatus', 'points', 'status', 'athleteId', 'attempts', 'attemptMode', 'wind', 'active'):
        if field not in entry:
            warn(f'{label}: missing field "{field}" (client tolerates this via ??/|| defaults, but check it is intentional)')
    mark = entry.get('mark')
    if mark is not None and not isinstance(mark, (int, float)):
        err(f'{label}: "mark" must be a number or null, got {type(mark).__name__}')
    status = entry.get('resultStatus')
    if status is not None and status not in TERMINAL_CODES:
        warn(f'{label}: resultStatus "{status}" is not one of {sorted(TERMINAL_CODES)} - client will not treat it as terminal')
    attempt_mode = entry.get('attemptMode')
    if attempt_mode not in ATTEMPT_MODES:
        err(f'{label}: attemptMode "{attempt_mode}" must be one of {sorted(str(x) for x in ATTEMPT_MODES)}')
    attempts = entry.get('attempts')
    if attempts is not None:
        if not isinstance(attempts, list):
            err(f'{label}: "attempts" must be a list')
        else:
            for i, a in enumerate(attempts):
                check_attempt(discipline, name, discipline, i, a, attempt_mode)
    active = entry.get('active')
    if active is not None and not isinstance(active, bool):
        err(f'{label}: "active" must be a boolean')


def check_section(label, section):
    if not isinstance(section, dict):
        err(f'{label}: not an object')
        return
    if 'completedEvents' not in section:
        err(f'{label}: missing "completedEvents"')
    elif not isinstance(section['completedEvents'], int):
        err(f'{label}: "completedEvents" must be an integer')
    results = section.get('results')
    if not isinstance(results, dict):
        err(f'{label}: "results" must be an object keyed by athlete name')
    else:
        if not results:
            warn(f'{label}: "results" is empty - fine before the competition starts, otherwise suspicious')
        for name, disciplines in results.items():
            if not isinstance(disciplines, dict):
                err(f'{label} / {name}: athlete entry must be an object keyed by discipline')
                continue
            for discipline, entry in disciplines.items():
                check_discipline_entry(name, discipline, entry)
    marks = section.get('eventHasMarks')
    if marks is not None and not isinstance(marks, dict):
        err(f'{label}: "eventHasMarks" must be an object')


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    try:
        data = load(sys.argv[1])
    except Exception as e:
        print(f'FAILED TO LOAD: {e}')
        sys.exit(1)

    if not isinstance(data, dict):
        err('top level: response is not a JSON object')
    else:
        for field in ('competition', 'source', 'competitionId', 'updatedAt', 'status'):
            if field not in data:
                warn(f'top level: missing "{field}"')
        if data.get('status') not in ('live', 'waiting', None):
            warn(f'top level: status "{data.get("status")}" is not "live" or "waiting"')
        if 'men' not in data and 'women' not in data:
            err('top level: neither "men" nor "women" section present')
        if 'men' in data:
            check_section('men', data['men'])
        if 'women' in data:
            check_section('women', data['women'])

    print(f'{len(errors)} error(s), {len(warnings)} warning(s)')
    for w in warnings:
        print(f'  WARN  {w}')
    for e in errors:
        print(f'  FAIL  {e}')
    if errors:
        print('\nCONTRACT VIOLATED - fix these before pointing the client at this endpoint.')
        sys.exit(1)
    print('\nContract OK' + (' (with warnings worth a second look)' if warnings else '.'))


if __name__ == '__main__':
    main()
