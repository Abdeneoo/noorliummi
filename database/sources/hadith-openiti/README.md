# OpenITI — Musnad Ahmad and Sunan al-Darimi (Arabic, PRIMARY versions)
- Source: https://github.com/OpenITI/RELEASE at commit in SOURCE_COMMIT (release 2025.1.9). Files, keys and SHA-256 in FILES. Downloaded by `infrastructure/fetch-hadith.sh`; not stored in Git.
- Licence: **CC BY-NC-SA 4.0** (Zenodo record 10.5281/zenodo.17767721, checked 2026-11-25). Attribution: "OpenITI: a Machine-Readable Corpus of Islamicate Texts". Our derived hadith data for these two books is shared under the same licence; non-commercial only.
- Editions (read from each file's #META# header at build time):
  - Musnad Ahmad: ed. Shu'ayb al-Arna'ut, Adil Murshid et al., Mu'assasat al-Risala, 1st ed. 1421/2001 (OCLC 264939610). OpenITI notes footnote markers remain; the footnotes themselves are not in the file.
  - Sunan al-Darimi: ed. Fawwaz Ahmad Zamarli & Khalid al-Sab' al-'Ilmi, Dar al-Kitab al-'Arabi, Beirut, 1st ed. 1407. Paratext removed by OpenITI ("Clean operation", 2023).
- Processing (apps/web/src/lib/openiti.ts): only technical markup is removed (line markers, PageV..P.., ms.., footnote reference numbers). Tested: no Arabic letter is lost. The Risala edition's marks before some numbers (• ° *) are kept. No grades or footnotes exist in these files and none are added.
- Not reviewed by a scholar yet ("نسخة تجريبية").
