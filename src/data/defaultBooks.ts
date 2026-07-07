import { Book, AuthorBio } from '../types';

// A real, valid 1-page PDF encoded in base64 that says: "Coma Journey - Rehlati Ghayboba (E-Book Preview)"
export const SAMPLE_PDF_BASE64 = 
  'JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pi9Db250ZW50cyA1IDAgUj4+ZW5kb2JqCjQgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PmVuZG9iago1IDAgb2JqPDwvTGVuZ3RoIDc5Pj5zdHJlYW0KQlQgL0YxIDI0IFRmIDgwIDcwMCBUZCAoIENvbWEgSm91cm5leSAtIFJlaGxhdGkgR2hheWJvYmEgLSBFLUJvb2sgUGVyaW9kICkgVGogRVQgCgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU2IDAwMDAwIG4gCjAwMDAwMDAxMTYgMDAwMDAgbiAKMDAwMDAwMDI3MyAwMDAwMCBuIAowMDAwMDAwMzQ2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDc2CiUlRU9GCg==';

export const defaultBooks: Book[] = [
  {
    id: 'coma-journey',
    titleEn: 'Coma Journey',
    titleAr: 'رحلتي غيبوبة',
    descriptionEn: 'A profound journey through the deepest layers of unconsciousness, exploring the thin thread connecting memory, identity, and raw reality. Written as an evocative memoir-thriller reflecting on the experience of awakening in an unfamiliar world.',
    descriptionAr: 'رحلة عميقة عبر الطبقات الأكثر ظلمة للوعي المفقود، مستكشفةً الخيط الرفيع الذي يربط بين الذاكرة، الهوية، والواقع البارد. كُتبت كرواية نفسية وتأملات وجدانية حول تجربة الاستيقاظ في عالم مجهول.',
    categoryEn: 'Psychological Memoir',
    categoryAr: 'سيرة نفسية / أدب تأملي',
    authorEn: 'My Journey: A Coma',
    authorAr: 'الكاتب رحلتي غيبوبة',
    coverImage: 'linear-gradient(135deg, #121c24 0%, #1c313a 100%)', // Default cover styling
    pdfFile: SAMPLE_PDF_BASE64,
    pdfFileName: 'Coma_Journey_Rehlati_Ghayboba.pdf',
    pages: 284,
    publishYear: '2026',
    downloadCount: 1420,
    isFeatured: true,
    createdAt: 1782800000000,
    showDownloads: true,
    showRating: true,
    ratingValue: 4.9,
    ratingCount: 145
  },
  {
    id: 'the-shadow-man',
    titleEn: 'The Shadow Man',
    titleAr: 'رجل الظل',
    descriptionEn: 'An intense, gothic-infused exploration of isolation, grief, and the doubles that live inside us. When a brilliant but broken poet retreats to a remote cabin, he discovers that his own shadow does not belong to him anymore.',
    descriptionAr: 'استكشاف مكثف بطابع قوطي للعزلة، والحداد، والنصف الآخر الذي يعيش بداخلنا. عندما ينعزل شاعر مكسور في كوخ ناءٍ، يكتشف فجأة أن ظله لم يعد ملكًا له.',
    categoryEn: 'Psychological Thriller',
    categoryAr: 'تشويق نفسي / فلسفي',
    authorEn: 'My Journey: A Coma',
    authorAr: 'الكاتب رحلتي غيبوبة',
    coverImage: 'linear-gradient(135deg, #0d0f12 0%, #1a1523 100%)',
    pdfFile: SAMPLE_PDF_BASE64,
    pdfFileName: 'The_Shadow_Man_Sarah_Al_Mansoori.pdf',
    pages: 312,
    publishYear: '2025',
    downloadCount: 980,
    isFeatured: true,
    createdAt: 1751200000000,
    showDownloads: true,
    showRating: true,
    ratingValue: 4.7,
    ratingCount: 88
  },
  {
    id: 'echoes-of-isolation',
    titleEn: 'Echoes of Isolation',
    titleAr: 'أصداء العزلة',
    descriptionEn: 'A collection of philosophical essays and literary letters exploring the transformative power of silence. The book unpacks how solitude can become a sanctuary for healing, self-discovery, and spiritual rebirth.',
    descriptionAr: 'مجموعة من المقالات الفلسفية والرسائل الأدبية التي تستكشف القوة التحويلية للصمت. يفكك الكتاب كيف يمكن أن تتحول الخلوة والعزلة إلى ملاذ آمن للتشافي، والولادة الروحية الجديدة.',
    categoryEn: 'Philosophical Essays',
    categoryAr: 'نصوص أدبية / فلسفة',
    authorEn: 'My Journey: A Coma',
    authorAr: 'الكاتب رحلتي غيبوبة',
    coverImage: 'linear-gradient(135deg, #181c14 0%, #293822 100%)',
    pdfFile: SAMPLE_PDF_BASE64,
    pdfFileName: 'Echoes_of_Isolation.pdf',
    pages: 196,
    publishYear: '2024',
    downloadCount: 765,
    isFeatured: false,
    createdAt: 1719800000000,
    showDownloads: true,
    showRating: true,
    ratingValue: 4.8,
    ratingCount: 62
  }
];

export const defaultAuthorBio: AuthorBio = {
  nameEn: 'My Journey: A Coma',
  nameAr: 'الكاتب رحلتي غيبوبة',
  titleEn: 'Novelist & Clinical Philosopher',
  titleAr: 'روائي وأخصائي تفكيك نفسي',
  bioEn: 'The author of My Journey: A Coma is an acclaimed voice in modern Arab psychological literature. After emerging from a critical survival experience that deeply altered his relationship with consciousness, he devoted his life to writing about the intersections of isolation, the subconscious, and self-rebirth. His writings are sensory journeys that guide readers through darkness into profound light.',
  bioAr: 'يعد الكاتب رحلتي غيبوبة صوتًا متميزًا في الأدب النفسي العربي الحديث. بعد نجاته من تجربة صحية حرجة غيرت علاقته بالوعي تمامًا، كرّس قلمه للكتابة حول تقاطعات العزلة، واللاوعي، وإعادة تولد الذات. نصوصه عبارة عن رحلات حسية تقتاد القارئ عبر دروب الروح المظلمة نحو بوابات النور الشافي.',
  avatar: '', // Fallback SVG in front-end
  avatars: [],
  videoUrl: '',
  showSlideshow: true,
  slideshowSpeed: 4,
  imageOpacity: 100,
  imageBlur: 0,
  imageContrast: 100,
  imageBrightness: 100,
  quoteEn: '',
  quoteAr: '',
  showSocialLinks: true,
  socialLinks: {
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    email: 'info@coma-journey.com',
    facebook: 'https://facebook.com'
  },
  contactFeature: {
    enableFeature: true,
    hideFromControlPanel: false,
    titleEn: 'Contact the Author',
    titleAr: 'اتصل بالكاتب',
    descriptionEn: 'Feel free to reach out to the author for inquiries, collaborations, or literary discussions.',
    descriptionAr: 'لا تتردد في التواصل مع الكاتب للاستفسارات، والتعاون المشترك، أو المناقشات الأدبية.',
    phone: { value: '+1 (555) 019-2834', visible: true },
    email: { value: 'info@coma-journey.com', visible: true },
    instagram: { value: 'https://instagram.com', visible: true },
    facebook: { value: 'https://facebook.com', visible: true },
    tiktok: { value: 'https://tiktok.com', visible: false },
    other: { value: '', visible: false },
    otherLabelEn: 'Other Platform',
    otherLabelAr: 'منصة أخرى',
    showInHeader: true,
    showInHero: true
  }
};
