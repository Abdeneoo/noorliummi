# Maps cpfair/quran-tajweed annotations (made on the 2017 Tanzil text) onto our Tanzil text by exact character alignment.
# An annotation is kept only if every character it covers is unchanged; letter-signature checks must then pass.
# Run from the repo root: python3 -I scripts/map-tajweed.py
import json, difflib, collections, xml.etree.ElementTree as ET
old={}
for l in open('database/sources/quran-tajweed/quran-uthmani-2017.txt',encoding='utf-8-sig'):
    l=l.rstrip('\n')
    if l and not l.startswith('#'): s,a,t=l.split('|',2); old[(int(s),int(a))]=t
t=ET.parse('database/sources/tanzil/uthmani.xml').getroot()
new={(int(s.get('index')),int(a.get('index'))):a.get('text') for s in t.iter('sura') for a in s.iter('aya')}
pub=json.load(open('database/sources/quran-tajweed/tajweed.hafs.uthmani-pause-sajdah.json'))
sig={'hamzat_wasl':set('ٱ'),'qalqalah':set('قطبجد'),'lam_shamsiyyah':set('ل')}
out={}; st=collections.Counter(); changed=[]
for x in pub:
    k=(x['surah'],x['ayah']); o=old[k]; n=new[k]
    if o==n: m=None; st['ayat_identical']+=1
    else:
        changed.append(k); m={}
        for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(None,o,n,autojunk=False).get_opcodes():
            if tag=='equal':
                for d in range(i2-i1): m[i1+d]=j1+d
    res=[]
    for an in x['annotations']:
        a,b=an['start'],an['end']
        if m is None: na,nb=a,b
        else:
            idx=[m.get(i) for i in range(a,b)]
            if None in idx or any(idx[i+1]!=idx[i]+1 for i in range(len(idx)-1)): st['dropped_changed_chars']+=1; continue
            na,nb=idx[0],idx[-1]+1
        if an['rule'] in sig and n[na] not in sig[an['rule']]: st['dropped_signature']+=1; continue
        res.append([an['rule'],na,nb]); st['kept']+=1
    out[f"{k[0]}:{k[1]}"]=res
st['ayat_changed']=len(changed)
# final verification on the new text
bad=sum(1 for k,v in out.items() for r,a,b in v if b>len(new[tuple(map(int,k.split(':')))]) or (r in sig and new[tuple(map(int,k.split(':')))][a] not in sig[r]))
print(dict(st),'final signature/bounds failures:',bad)
json.dump(out,open('database/sources/quran-tajweed/tajweed-mapped.json','w'),ensure_ascii=False,separators=(',',':'))
# what changed in the changed ayat (excluding the bismillah prefix)?
kinds=collections.Counter()
for k in changed:
    for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(None,old[k],new[k],autojunk=False).get_opcodes():
        if tag!='equal': kinds[(tag,old[k][i1:i2][:12],new[k][j1:j2][:12])]+=1
for kk,c in kinds.most_common(12): print(c,kk)
