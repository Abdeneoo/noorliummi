-- Owner decisions, 28 Nov 2026: no outbound links; requests cancelled (alternatives used); Ibn 'Uthaymeen foundation emailed by the owner.
UPDATE content_rights SET publish_status = 'held', notes = notes || ' | 28-11-2026: ألغاه صاحب المشروع (لا روابط خارجية)؛ سيوفّر بديلًا.', updated_at = now()
 WHERE key IN ('ourquraan', 'daralbalagh', 'islamweb-dua', 'hisnmuslim-com', 'islamhouse-azkar-app');
UPDATE content_rights SET publish_status = 'held', notes = notes || ' | 28-11-2026: ألغاه صاحب المشروع؛ البديل: الفقه الميسر وبداية المجتهد وكتب دار الإسلام الفقهية.', updated_at = now() WHERE key = 'mulakhkhas';
UPDATE content_rights SET publish_status = 'held', notes = notes || ' | 28-11-2026: ألغاه صاحب المشروع؛ الغريب من ابن قتيبة والسجستاني والسمين.', updated_at = now() WHERE key = 'siraj';
UPDATE content_rights SET status = 'requested', notes = notes || ' | 28-11-2026: أرسل صاحب المشروع بريد الطلب؛ بانتظار الرد. البديل الحالي: ٣٠ مجلسًا ودروس الفوزان.', updated_at = now() WHERE key = 'majalis-ramadan';
