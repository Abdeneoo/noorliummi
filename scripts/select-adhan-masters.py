#!/usr/bin/env python3
"""
Keep one master recording per muezzin (and per mosque/country adhan), separately for Fajr and the other prayers.
Every other take is marked as a variant of its master: hidden from the library, kept in the catalogue for the record.
Preference: hosted on our server (works offline, documented licence) > HQ > higher bitrate > complete length.
Also unpublishes the amateur Wikimedia field recordings at the owner's request (2026-11-25).
Usage: python3 -I scripts/select-adhan-masters.py   (after scripts/catalogue-adhan.py)
"""
import json, os, re, collections
ROOT = os.path.join(os.path.dirname(__file__), '..')
CAT = os.path.join(ROOT, 'database/sources/adhan-collections/catalogue.json')
REG = os.path.join(ROOT, 'database/sources/adhan/registry.json')
PUB = os.path.join(ROOT, 'apps/web/public')
cat = json.load(open(CAT)); reg = json.load(open(REG))
AMATEUR = {'azan-andrewler', 'aishatu98-calling', 'adam-synagda', 'adhan-aishatu98'}

# The same muezzin under different spellings across sources.
ALIAS = [(r'mishary|afasy', 'mishary-alafasy'), (r'ali.?ibn.?ahmad.?mala|ali ahmed mulla', 'ali-mulla'), (r'qatami', 'nasser-alqatami'),
         (r'amade|imadi', 'ahmad-alimadi'), (r'zahran', 'mansour-alzahrani'), (r'nafees', 'ahmad-alnafees'), (r'hadj.?slimane|haj.?sulaiman', 'mukhtar-hadj-slimane'),
         (r'hamathani', 'majed-alhamathani')]
def base_key(en):
    k = en.lower()
    for pat, key in ALIAS:
        if re.search(pat, k): return key
    return re.sub(r'\s+\d+$', '', re.sub(r'[^a-z0-9 ]+', ' ', k)).strip()

cands = []
for r in reg:
    if not r.get('publish') or r['audio_id'] in AMATEUR: continue
    en = r.get('title_en') or r['title']
    # Archive/islamweb titles: "Isha — Masjid al-Haram (Ali Ahmed Mulla)" -> muezzin in brackets when known
    m = re.search(r'\(([^)]+)\)$', en)
    who = m.group(1) if m else en
    if r['audio_id'].startswith('iw-'):
        c = next((x for x in cat['items'] if x['id'] == r.get('catalogue_id')), None); who = c['title']['en'] if c else en
    fajr = r.get('adhan_type') == 'fajr'
    cands.append(dict(id=r['audio_id'], key=(base_key(who), fajr), hosted=True, hq=False, kbps=80, dur=r.get('duration') or 0, reg=r))
for c in cat['items']:
    if c['status'] not in ('stream',): continue
    fajr = 'fajr' in c['groups']
    cands.append(dict(id='st:' + c['id'], key=(base_key(c['title']['en']), fajr), hosted=False, hq=c.get('hq', False), kbps=c.get('kbps') or 128, dur=c.get('duration') or 150, cat=c))

def score(x):
    complete = 1 if 90 <= x['dur'] <= 340 else 0
    return (complete, x['hosted'], x['hq'], x['kbps'], x['dur'])
groups = collections.defaultdict(list)
for x in cands: groups[x['key']].append(x)
masters, variants = [], {}
for k, xs in groups.items():
    xs.sort(key=score, reverse=True); masters.append(xs[0]['id'])
    for v in xs[1:]: variants[v['id']] = xs[0]['id']

for r in reg:
    if r['audio_id'] in AMATEUR and r.get('publish'):
        r['publish'] = False; r['verification_status'] = 'withdrawn_by_owner: amateur field recording; replaced by professional masters (2026-11-25)'
    if r['audio_id'] in variants:
        r['publish'] = False; r['verification_status'] = f"variant_of:{variants[r['audio_id']]} (kept the master recording only)"
for c in cat['items']:
    v = variants.get('st:' + c['id'])
    if v and c['status'] == 'stream':
        c['status'] = 'variant'; c['reasons'] = [f'variant: another take of the same voice; master = {v}'] + c['reasons']
for r in reg:
    if str(r.get('verification_status', '')).startswith('variant_of:') and r.get('catalogue_id'):
        c = next((x for x in cat['items'] if x['id'] == r['catalogue_id']), None)
        if c and c['status'] == 'hosted':
            c['status'] = 'variant'; c['reasons'] = [f"variant: another take of the same voice; master = {r['verification_status'].split(':', 1)[1].split(' ')[0]}"] + c['reasons']
cat['counts'] = dict(collections.Counter(r['status'] for r in cat['items']))
json.dump(cat, open(CAT, 'w'), ensure_ascii=False, indent=1)
json.dump(reg, open(REG, 'w'), ensure_ascii=False, indent=1)
# Hosted files that are no longer published are removed from the public folder (the registry keeps their record and source).
for r in reg:
    if not r.get('publish') and r.get('local_file_path'):
        p = PUB + r['local_file_path']
        if os.path.exists(p): os.remove(p)
print('masters', len(masters), 'variants', len(variants), 'hosted published', sum(1 for r in reg if r.get('publish')), 'catalogue', cat['counts'])
