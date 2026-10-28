/**
 * Everything the visitor reads that is not an artwork lives here.
 * Edit this one file to change the artist name, contact details and About page.
 * Artworks themselves are managed in /admin, never in code.
 */
export const site = {
  name: 'Lin Atelier',
  tagline: 'Watercolor · Ink · Works on paper',
  description:
    'Selected watercolor works, landscapes, botanical studies and intimate observations by Lin Atelier.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),

  // TODO: replace with the real address and account before launch.
  email: 'studio@example.com',
  instagram: { handle: '@linatelier', url: '' }, // leave url empty to show the handle as plain text
  location: 'Based in the United States',

  intro:
    'Quiet observations shaped by travel, nature, and everyday ritual. Each work explores the balance between fluid color, expressive line, and the presence of unpainted space.',
  worksIntro:
    'A growing archive of watercolor and ink studies, organized across botanical subjects, remembered landscapes, travel observations, and intimate everyday scenes.',

  statement: 'Painting is a way of noticing what would otherwise pass quietly by.',
  bio: [
    'Lin Atelier is an independent watercolor practice centered on attentive looking. Landscapes, botanical forms, architecture, animals, and fleeting travel scenes become small records of place and time.',
    'The work combines transparent washes with economical brushwork and ink. Rather than describing every detail, each painting leaves room for memory and imagination to complete the image.',
    'For exhibitions, commissions, and studio inquiries, please get in touch.',
  ],
  aboutImage: {
    src: '/about/studio.webp',
    width: 1090,
    height: 575,
    alt: 'The artist’s watercolor palette and brushes in the studio',
    caption: 'The studio palette. Replace with a portrait by swapping public/about/studio.webp.',
  },

  // PLACEHOLDERS: replace with real entries, or leave an array empty to hide its section.
  exhibitions: [
    { year: '2026', title: 'Exhibition title', venue: 'Gallery name, City' },
    { year: '2025', title: 'Group exhibition title', venue: 'Venue name, City' },
  ],
  awards: [
    { year: '2026', title: 'Award or residency name', venue: 'Organization' },
  ],

  // Put a PDF in /public (for example public/cv.pdf) and set cvUrl: '/cv.pdf' to show a download link.
  cvUrl: '',
} as const;

export const inquiryTopics = ['Artwork inquiry', 'Exhibition', 'Commission', 'Collaboration', 'Other'] as const;
