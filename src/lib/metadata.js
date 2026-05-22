/** Shared Next.js metadata for route layouts (SEO + Open Graph). */

const OG_IMAGE = {
  url:    '/og-image.jpg',
  width:  1200,
  height: 630,
  alt:    'AURA SKIN — Монголын арьс арчилгааны дэлгүүр',
};

export function pageMetadata({ title, description, path = '', noIndex = false }) {
  const url = `https://auraskin.mn${path}`;
  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type:        'website',
      locale:      'mn_MN',
      url,
      siteName:    'AURA SKIN',
      title:       `${title} | AURA SKIN`,
      description,
      images:      [OG_IMAGE],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${title} | AURA SKIN`,
      description,
      images:      [OG_IMAGE.url],
    },
  };
}
