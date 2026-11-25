#!/usr/bin/env python3
"""
Build a metadata catalogue of public adhan collections WITHOUT copying any audio into the repository.

Usage: python3 -I scripts/catalogue-adhan.py <path-to-Kiwifu-adhan-mp3-clone> <commit>
Writes database/sources/adhan-collections/catalogue.json

Every recording starts as "pending": a GitHub repository without a licence, or a site that says
"personal use", does not grant the right to re-host. Files are published only after the rights holder's
permission (or a free licence on the original upload) is recorded in database/sources/adhan/registry.json.
"""
import hashlib, json, os, re, subprocess, sys, collections

src, commit = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), '..', 'database', 'sources', 'adhan-collections', 'catalogue.json')

COUNTRY = [  # (pattern in English place, code, ar, en)
    (r'Egypt|Cairo|Rifai', 'EG', 'مصر', 'Egypt'), (r'Haram Al Maki|Mecca|Makkah', 'SA', 'السعودية', 'Saudi Arabia'),
    (r'Madani|Madinah|Medina', 'SA', 'السعودية', 'Saudi Arabia'), (r'Saudi|Riyadh|Najran|Rajehe', 'SA', 'السعودية', 'Saudi Arabia'),
    (r'Kuwait', 'KW', 'الكويت', 'Kuwait'), (r'Qatar', 'QA', 'قطر', 'Qatar'), (r'Dubai|Ajman|Umm Al Quwain|UAE', 'AE', 'الإمارات', 'UAE'),
    (r'Oman|Muscat', 'OM', 'عُمان', 'Oman'), (r'Aqsa|Jerusalem|Palestine', 'PS', 'فلسطين', 'Palestine'), (r'Jordan', 'JO', 'الأردن', 'Jordan'),
    (r'Syria', 'SY', 'سوريا', 'Syria'), (r'Lebanon', 'LB', 'لبنان', 'Lebanon'), (r'Iraq', 'IQ', 'العراق', 'Iraq'),
    (r'Algeria', 'DZ', 'الجزائر', 'Algeria'), (r'Morocco', 'MA', 'المغرب', 'Morocco'), (r'Tunisia', 'TN', 'تونس', 'Tunisia'),
    (r'Turkey', 'TR', 'تركيا', 'Turkey'), (r'Georgia', 'GE', 'جورجيا', 'Georgia'), (r'Malaysia', 'MY', 'ماليزيا', 'Malaysia'),
    (r'Indonesia', 'ID', 'إندونيسيا', 'Indonesia'), (r'Brunei', 'BN', 'بروناي', 'Brunei'), (r'Maldives', 'MV', 'المالديف', 'Maldives'),
    (r'Pakistan', 'PK', 'باكستان', 'Pakistan'), (r'India', 'IN', 'الهند', 'India'), (r'Afghanistan', 'AF', 'أفغانستان', 'Afghanistan'),
    (r'Kenya', 'KE', 'كينيا', 'Kenya'), (r'Colombia', 'CO', 'كولومبيا', 'Colombia'),
]
# Reciters of the Egyptian school (identified by name, independent of the place in the file name).
EGYPTIAN = ['Abdulbasit', 'Minshawi', 'Hussary', 'Refaat', 'Banna', 'Mustafa_Ismail', 'Shuaisha', 'Nuinaa', 'Toubar', 'Naqshbandi', 'nakshabandi', 'Tawakh']
# Names the source README lists as famous muezzins.
FAMOUS = ['Mishary', 'Afasy', 'Abdulbasit', 'Minshawi', 'Hussary', 'Refaat', 'Banna', 'Mustafa_Ismail', 'Qatami', 'Dosari', 'Ali_Ibn_Ahmad_Mala',
          'Khaleel_Raml', 'Hadrawe', 'Bukhrare', 'Nayf_Fedah', 'Najee_Qazaz', 'NurDin', 'Amade', 'Trablsy', 'Surehi', 'Hijazi', 'Zamel', 'Junayd', 'Filkawi', 'Toubar', 'Naqshbandi', 'Zahrane']

def origin(tags):
    c = ' '.join(str(v) for v in tags.values()).lower()
    for k, v in (('assabile', 'assabile.com'), ('islamweb', 'islamweb.net'), ('haii3alslah', 'haii3alslah.com'), ('albumaty', 'albumaty.com'), ('youtube.com', 'YouTube')):
        if k in c: return v
    return None

def parse(stem):
    m = re.match(r'^(.*?)_\((.*)\)$', stem)
    en, ar = (m.group(1), m.group(2)) if m else (stem, '')
    en_s, ar_s = en.replace('_', ' ').strip(), ar.replace('_', ' ').strip()
    hq = bool(re.search(r'\bHQ\b', en_s)); en_s = re.sub(r'\s*-?\s*HQ\b', '', en_s).strip()
    fajr = bool(re.search(r'\bFajr\b', en_s)) or 'فجر' in ar_s
    take = None
    parts = [p.strip() for p in en_s.split(' - ', 1)]
    who, place = parts[0], (parts[1] if len(parts) > 1 else '')
    mt = re.search(r'\s(\d+)$', who) or re.search(r'\s(\d+)$', place)
    if mt:
        take = int(mt.group(1)); who = re.sub(r'\s\d+$', '', who); place = re.sub(r'\s\d+$', '', place)
    aparts = [p.strip() for p in ar_s.split(' - ', 1)]
    return dict(en=who, ar=aparts[0] or None, place_en=place or None, place_ar=(aparts[1] if len(aparts) > 1 else None), fajr=fajr, hq=hq, take=take)

rows = []
for f in sorted(os.listdir(src)):
    if not f.lower().endswith('.mp3'): continue
    p = os.path.join(src, f)
    j = json.loads(subprocess.run(['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', p], capture_output=True, text=True).stdout or '{}')
    fmt = j.get('format', {}); tags = {k.lower(): v for k, v in (fmt.get('tags') or {}).items()}
    raw = open(p, 'rb').read()
    stem = f[:-4]; meta = parse(stem)
    is_location = meta['en'].startswith(('Adhan', 'Fajr Adhan', 'Azan'))
    hay = f"{meta['en']} {meta['place_en'] or ''}"
    cc = next(((c, a, e) for pat, c, a, e in COUNTRY if re.search(pat, hay)), (None, None, None))
    groups = []
    if meta['fajr']: groups.append('fajr')
    if re.search(r'Haram', hay): groups.append('haramain')
    if re.search(r'Aqsa', hay): groups.append('aqsa')
    if any(k.lower() in stem.lower() for k in EGYPTIAN): groups.append('egyptian')
    if any(k.lower() in stem.lower() for k in FAMOUS): groups.append('famous')
    if is_location: groups.append('places')
    rows.append(dict(
        id='kiwifu-' + hashlib.sha256(raw).hexdigest()[:12], collection='kiwifu', file=f, sha256=hashlib.sha256(raw).hexdigest(), bytes=len(raw),
        duration=round(float(fmt.get('duration', 0)), 1), kbps=int(fmt.get('bit_rate', 0)) // 1000,
        title={'ar': meta['ar'], 'en': meta['en']}, muezzin=None if is_location else {'ar': meta['ar'], 'en': meta['en']},
        place={'ar': meta['place_ar'], 'en': meta['place_en']} if meta['place_en'] else None,
        country={'code': cc[0], 'ar': cc[1], 'en': cc[2]} if cc[0] else None,
        take=meta['take'], hq=meta['hq'], groups=groups, origin=origin(tags),
        id3_artist=(tags.get('artist') or '').strip() or None,
        status='pending', reasons=[], flags=[]))

# Exact duplicates (same bytes) and near-duplicates (same muezzin, durations within 1.5 s).
by_sha = collections.defaultdict(list)
for r in rows: by_sha[r['sha256']].append(r)
for group in by_sha.values():
    for r in group[1:]:
        r['status'] = 'rejected'; r['reasons'].append('duplicate'); r['flags'].append('duplicate_of:' + group[0]['file'])
seen = [r for r in rows if r['status'] != 'rejected']
for i, a in enumerate(seen):
    for b in seen[i + 1:]:
        if a['title']['en'] == b['title']['en'] and abs(a['duration'] - b['duration']) <= 1.5 and (a['hq'] or b['hq']):
            (b if b['hq'] else a)['flags'].append('near_duplicate_of:' + (a if b['hq'] else b)['file'])
RAW = f'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/{commit}/'
from urllib.parse import quote
for r in rows:
    if r['status'] == 'rejected': continue
    r['flags'].append('needs_listening')
    r['flags'].append('attribution_unverified')
    if r['duration'] < 60: r['flags'].append('possibly_incomplete')
    if 'Albane' in r['file']: r['flags'].append('attribution_doubtful')
    if 'islamweb' in (r['id3_artist'] or ''):
        # islamweb.net: "benefiting from them is allowed ... not for commercial reasons ... their source must be mentioned"
        r['origin'] = 'islamweb.net'
        if 'possibly_incomplete' in r['flags']:
            r['status'] = 'pending'; r['reasons'].append('needs_listening_first: shorter than a minute, possibly not a complete adhan')
        else:
            r['status'] = 'hosted'; r['reasons'].append('islamweb_noncommercial_attribution: islamweb allows non-commercial use with the source named')
        continue
    if any(f.startswith(('possibly_incomplete', 'attribution_doubtful')) for f in r['flags']):
        r['status'] = 'pending'; r['reasons'].append('needs_review: possibly incomplete or doubtful attribution')
        continue
    # Not re-hosted: played straight from the repository, whose description reads "Free for Islamic apps, prayer-time software".
    r['status'] = 'stream'; r['url'] = RAW + quote(r['file'])
    r['reasons'].append('stream_only: repository states "Free for Islamic apps, prayer-time software" but has no licence to re-host; played from the source')
    if r['origin']: r['reasons'].append(f"third_party_origin: ID3 tags point to {r['origin']}")

ALADHAN = [  # https://aladhan.com/download-adhans — "for personal use", © Islamic Network
    ('a9.mp3', 'مشاري راشد العفاسي', 'Mishary Rashid Alafasy', ['famous']), ('a1.mp3', 'أحمد النفيس', 'Ahmad al-Nafees', ['famous']),
    ('a2.mp3', 'حافظ مصطفى أوزجان', 'Hafiz Mustafa Özcan', []), ('a3.mp3', 'أذان من «قداس من أجل السلام» لكارل جنكينز', "Karl Jenkins' Mass for Peace", []),
    ('a4.mp3', 'مشاري راشد العفاسي (قناة دبي ون)', 'Mishary Rashid Alafasy (Dubai One TV)', ['famous']), ('a7.mp3', 'مشاري راشد العفاسي', 'Mishary Rashid Alafasy', ['famous']),
    ('a11-mansour-al-zahrani.mp3', 'منصور الزهراني', 'Mansour Al-Zahrani', ['famous']),
]
for fn, ar, en, g in ALADHAN:
    rows.append(dict(id='aladhan-' + fn.split('.')[0], collection='aladhan', file=fn, url='https://cdn.aladhan.com/audio/adhans/' + fn, sha256=None, bytes=None, duration=None, kbps=None,
                     title={'ar': ar, 'en': en}, muezzin=None if fn == 'a3.mp3' else {'ar': ar, 'en': en}, place=None, country=None, take=None, hq=False, groups=g, origin='aladhan.com',
                     id3_artist=None, status='rejected' if fn == 'a3.mp3' else 'stream',
                     reasons=(['not_an_adhan_recording: part of a copyrighted musical work (Karl Jenkins, The Armed Man)'] if fn == 'a3.mp3' else ['stream_only: offered on the AlAdhan page "for personal use"; played from cdn.aladhan.com for each listener, never copied']),
                     flags=['needs_listening']))

out = dict(generated_from={'kiwifu': {'repo': 'https://github.com/Kiwifu/adhan-mp3', 'commit': commit, 'licence': None},
                           'aladhan': {'page': 'https://aladhan.com/download-adhans', 'terms': 'personal use', 'checked': '2026-11-25'}},
           counts=dict(collections.Counter(r['status'] for r in rows)), items=rows)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(out['counts'], len(rows))
print('groups', collections.Counter(g for r in rows for g in r['groups']))
print('origins', collections.Counter(r['origin'] for r in rows))
print('flags', collections.Counter(f.split(':')[0] for r in rows for f in r['flags']))
