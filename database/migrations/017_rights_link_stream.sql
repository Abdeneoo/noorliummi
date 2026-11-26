-- Two more ways to show held content without copying it:
--   link_only: titles with links that open the item on the owner's own site (no permission needed, nothing copied);
--   stream:    played in the site player straight from the owner's servers (only after the owner records approval).
ALTER TABLE content_rights DROP CONSTRAINT IF EXISTS content_rights_publish_status_check;
ALTER TABLE content_rights ADD CONSTRAINT content_rights_publish_status_check CHECK (publish_status IN ('held', 'link_only', 'embed_only', 'stream', 'published'));
UPDATE content_rights SET publish_status = 'link_only', updated_at = now() WHERE key IN ('islamweb-dua', 'ourquraan', 'daralbalagh') AND publish_status = 'held';
