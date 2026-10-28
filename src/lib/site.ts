/**
 * Everything the visitor reads that is not an artwork lives here.
 * Edit this one file to change the artist name, contact details and About page.
 * Artworks themselves are managed in /admin, never in code.
 */
export const site = {
  name: 'Ouyang Atelier',
  tagline: 'Watercolor · Ink · Works on paper',
  taglineCn: '水彩 · 墨迹 · 纸上流光',
  description:
    'Selected watercolor works, landscapes, botanical studies and intimate observations by Ouyang Atelier.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),

  // TODO: replace with the real address and account before launch.
  email: 'studio@example.com',
  instagram: { handle: '@ouyangateliel', url: '' }, // leave url empty to show the handle as plain text
  location: 'Based in Zhengzhou',
  locationCn: '驻于郑州',

  intro:
    'Quiet observations shaped by travel, nature, and everyday ritual. Each work explores the balance between fluid color, expressive line, and the presence of unpainted space.',
  introCn:
    '行旅山水之间，日常微物之侧，静观成画。每一笔，皆在流动色彩、表意线条与留白之间寻找平衡。',
  worksIntro:
    'A growing archive of watercolor and ink studies, organized across botanical subjects, remembered landscapes, travel observations, and intimate everyday scenes.',
  worksIntroCn:
    '水彩与墨迹的渐积之作，涵盖草木花卉、记忆风景、旅途观察与细碎日常。',

  statement: 'Painting is a way of noticing what would otherwise pass quietly by.',
  statementCn: '绘画，是留住那些悄然流逝之物的方式。',
  bio: [
    'Ouyang Atelier is an independent watercolor practice centered on attentive looking. Landscapes, botanical forms, architecture, animals, and fleeting travel scenes become small records of place and time.',
    'The work combines transparent washes with economical brushwork and ink. Rather than describing every detail, each painting leaves room for memory and imagination to complete the image.',
    'For exhibitions, commissions, and studio inquiries, please get in touch.',
  ],
  bioCn: [
    'Ouyang Atelier 是一个以专注凝视为核心的水彩创作工作室。风景、草木、建筑、动物与瞬息旅途，皆化为地与时的微小记录。',
    '作品以透明水洗结合简练笔墨，不求精描细绘，而是留有余地，让记忆与想象自行填充画面。',
    '如有展览、委托创作或工作室咨询，欢迎联系。',
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

export const inquiryTopicsCn: Record<string, string> = {
  'Artwork inquiry': '作品询购',
  'Exhibition': '展览合作',
  'Commission': '委托创作',
  'Collaboration': '项目合作',
  'Other': '其他',
};
