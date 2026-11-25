/** The illustrated brand logo. Brand guide: cover and dedication only, never narrower than 240px, no stretching or heavy shadow. */
export default function BrandLogo({ alt, priority = false }: { alt: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo" src="/brand/logo-480.webp" srcSet="/brand/logo-240.webp 240w, /brand/logo-480.webp 480w, /brand/logo-960.webp 960w"
      sizes="(min-width: 820px) 300px, 64vw" width={480} height={480} alt={alt} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
  );
}
