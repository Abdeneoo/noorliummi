# Reproduces database/sources/gharib-openiti/sijistani-aligned.json from sijistani.txt and Tanzil simple-clean.
# Run from the repository root: python3 apps/web/scripts/align-sijistani.py
import re,json,xml.etree.ElementTree as ET
raw=open('database/sources/gharib-openiti/sijistani.txt',encoding='utf-8').read().split('#META#Header#End#')[1]
raw=raw.replace('\r','').replace('\n~~',' ')
lines=raw.split('\n')
def clean(t):
  t=re.sub(r'PageV\d+P\d+','',t); t=re.sub(r'\bms\d+\b','',t); t=t.replace(' / ',' ').replace('/','')
  t=re.sub(r'\s+\d{1,2}\s+(?=\S)',' ',t)  # stray footnote numbers
  return re.sub(r'\s+',' ',t).strip()
secs=[]; cur=None
for l in lines:
  l=l.strip()
  if not l: continue
  m=re.match(r'^### \| \(\s*\[فصل\]\s*(.+?)\)\s*$',l)
  if m: cur={'h':m.group(1),'txt':[]}; secs.append(cur); continue
  if l.startswith('###'): 
    if cur and 'باب' in l: cur=None
    continue
  if cur is not None and l.startswith('#'): cur['txt'].append(clean(l[1:]))
print(len(secs))
def nk(t):
  t=re.sub(r'[ً-ْٰـ]','',t); t=re.sub('[ءأإآٱ]','ا',t).replace('ى','ي').replace('ة','ه'); return t
# entries: split into sentences at ". " ; entry start when 'X: ' with X <= 7 words
ents=[]
for s in secs:
  txt=' '.join(s['txt'])
  parts=re.split(r'(?<=[.\]])\s+',txt)
  e=None
  for p in parts:
    m=re.match(r'^(?:\[)?([^:]{2,70}?)\s*:\s*(.*)$',p)
    if m and len(m.group(1).split())<=7 and not re.search(r'قال|قوله|يقال|ويقال|أي$',m.group(1)):
      e={'sec':s['h'],'q':m.group(1).strip(' {}[]'),'t':p}; ents.append(e)
    elif e: e['t']+=' '+p
print(len(ents)); 
for e in ents[:12]: print(e['q'],'||',e['t'][:80])
json.dump(ents,open('/tmp/gh/sij-ents.json','w'),ensure_ascii=False)
root=ET.parse('database/sources/tanzil/simple-clean.xml').getroot()
Q=[]
for su in root.iter('sura'):
  for ay in su.iter('aya'): Q.append((int(su.get('index')),int(ay.get('index')),[nk(w) for w in ay.get('text').split()]))
def match(words,qw,i):
  return all(words[i+k]==w or words[i+k]=='و'+w or words[i+k]=='ف'+w or 'و'+words[i+k]==w for k,w in enumerate(qw))
def find(qw,start):
  for idx in range(start,len(Q)):
    s,a,ws=Q[idx]
    for i in range(0,len(ws)-len(qw)+1):
      if match(ws,qw,i): return idx,i
  return None
import bisect
root = ET.parse('database/sources/tanzil/simple-clean.xml').getroot()
Q = [(int(su.get('index')), int(ay.get('index')), [nk(w) for w in ay.get('text').split()]) for su in root.iter('sura') for ay in su.iter('aya')]
def match(ws, qw, i): return all(ws[i+k] == w or ws[i+k] == 'و'+w or ws[i+k] == 'ف'+w or 'و'+ws[i+k] == w for k, w in enumerate(qw))
def cands(qw): return [(idx, i) for idx, (s, a, ws) in enumerate(Q) for i in range(0, len(ws)-len(qw)+1) if match(ws, qw, i)]
def head(e): q = re.sub(r'[{}\[\]()«»"]', '', e['q']); return re.sub(r'^(وقوله|قوله)\s+', '', q)
by = {}
for k, e in enumerate(ents): by.setdefault(e['sec'], []).append(k)
res = {}
for sec, ks in by.items():
    tails, tailk = [], []
    for k in ks:
        qw = [nk(w) for w in head(ents[k]).split() if w]
        for (idx, i) in sorted(cands(qw) if qw else [], reverse=True):
            p = idx*100+i; j = bisect.bisect_left(tails, p); node = (k, idx, i, tailk[j-1] if j > 0 else None)
            if j == len(tails): tails.append(p); tailk.append(node)
            else: tails[j] = p; tailk[j] = node
    n = tailk[-1] if tailk else None
    while n: res[n[0]] = (n[1], n[2]); n = n[3]
out = []
for k, e in enumerate(ents):
    q = head(e); qw = q.split()
    if k in res: idx, i = res[k]; s, a, _ = Q[idx]; out.append({'q': q, 't': e['t'], 's': s, 'a': a, 'w': [i, i+len(qw)-1]})
    elif out and not cands([nk(w) for w in qw]): out[-1]['t'] += ' ' + e['t']
json.dump(out, open('/tmp/sij-linked.json', 'w'), ensure_ascii=False)
print(len(out), 'entries aligned')
