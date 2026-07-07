export interface Book {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryEn: string;
  categoryAr: string;
  authorEn: string;
  authorAr: string;
  coverImage?: string; // Base64 data URL or custom SVG cover fallback details
  pdfFile?: string;    // Base64 data URL for direct downloads
  pdfFileName?: string; // Original name of the PDF file
  pages: number;
  publishYear: string;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: number;
  showDownloads?: boolean;
  showRating?: boolean;
  ratingValue?: number; // Manual or fake rating score (e.g. 4.8)
  ratingCount?: number; // Manual or fake rating count (e.g. 125)
}

export interface AuthorBio {
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  bioEn: string;
  bioAr: string;
  avatar?: string; // Base64 or placeholder URL
  avatars?: string[]; // Multiple avatar images
  videoUrl?: string; // Video URL alongside the images
  showSlideshow?: boolean; // Enable automatic slideshow
  slideshowSpeed?: number; // Slideshow speed in seconds
  imageOpacity?: number; // Author image opacity filter
  imageBlur?: number; // Author image blur filter
  imageContrast?: number; // Author image contrast filter
  imageBrightness?: number; // Author image brightness filter
  quoteEn: string;
  quoteAr: string;
  showSocialLinks?: boolean;
  socialLinks: {
    twitter: string;
    instagram: string;
    email: string;
    facebook: string;
  };
  contactFeature?: ContactFeature;
}

export interface ContactOption {
  value: string;
  visible: boolean;
}

export interface CustomContactMethod {
  id: string;
  platform: string;
  labelEn?: string;
  labelAr?: string;
  value: string;
  visible: boolean;
}

export interface ContactFeature {
  enableFeature: boolean;
  hideFromControlPanel?: boolean; // completely hide this feature from control panel
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  phone: ContactOption;
  email: ContactOption;
  instagram: ContactOption;
  facebook: ContactOption;
  tiktok: ContactOption;
  other: ContactOption;
  otherLabelEn: string;
  otherLabelAr: string;
  showInHeader?: boolean;
  showInHero?: boolean;
  boxSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customPlatforms?: CustomContactMethod[];
}

export type Language = 'en' | 'ar';

export interface UiTexts {
  logoText: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  titleEn: string;
  titleAr: string;
  taglineEn: string;
  taglineAr: string;
  booksEn: string;
  booksAr: string;
  aboutEn: string;
  aboutAr: string;
  dashboardEn: string;
  dashboardAr: string;
  logoutEn: string;
  logoutAr: string;
  
  heroBadgeEn: string;
  heroBadgeAr: string;
  heroTitleEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  heroDescriptionEn: string;
  heroDescriptionAr: string;
  heroCtaEn: string;
  heroCtaAr: string;
  heroSecondaryCtaEn: string;
  heroSecondaryCtaAr: string;
  heroPhilosophyQuoteEn: string;
  heroPhilosophyQuoteAr: string;
  
  searchPlaceholderEn: string;
  searchPlaceholderAr: string;
  allCategoriesEn: string;
  allCategoriesAr: string;
  featuredTitleEn: string;
  featuredTitleAr: string;
  mainShelfTitleEn: string;
  mainShelfTitleAr: string;
  mainShelfSubEn: string;
  mainShelfSubAr: string;
  noBooksFoundEn: string;
  noBooksFoundAr: string;
  connectingEn: string;
  connectingAr: string;
  retryEn: string;
  retryAr: string;
  featuredBadgeEn: string;
  featuredBadgeAr: string;
  
  cardPagesEn: string;
  cardPagesAr: string;
  cardYearEn: string;
  cardYearAr: string;
  cardDownloadsEn: string;
  cardDownloadsAr: string;
  cardDirectDownloadEn: string;
  cardDirectDownloadAr: string;
  cardPreparingEn: string;
  cardPreparingAr: string;
  cardFeaturedEn: string;
  cardFeaturedAr: string;
  cardUnnamedBookEn: string;
  cardUnnamedBookAr: string;
  cardAuthorEn: string;
  cardAuthorAr: string;
  
  sectionTitleEn: string;
  sectionTitleAr: string;
  philosophyEn: string;
  philosophyAr: string;
  philosophyBodyEn: string;
  philosophyBodyAr: string;
  authorContactEn: string;
  authorContactAr: string;
  accoladesTitleEn: string;
  accoladesTitleAr: string;
  award1En: string;
  award1Ar: string;
  award2En: string;
  award2Ar: string;
  award3En: string;
  award3Ar: string;
  
  footerTaglineEn: string;
  footerTaglineAr: string;
  footerAllRightsEn: string;
  footerAllRightsAr: string;
  footerByEn: string;
  footerByAr: string;
  showVisitorCounter?: boolean;
  visitorCount?: number;
  showBookRatingFeature?: boolean;
  showDirectDownloadLibrary?: boolean;
  topCustomImageUrl?: string;
  topCustomImageOpacity?: number;
  topCustomImageBlur?: number;
  topCustomImageContrast?: number;
  topCustomImageBrightness?: number;
  globalFontSize?: number;
  globalContrast?: 'normal' | 'soft' | 'high';
  postsTitleEn?: string;
  postsTitleAr?: string;
  postsSubtitleEn?: string;
  postsSubtitleAr?: string;
  hidePostsHeaderText?: boolean;
  showLogoInPostHeader?: boolean;
  postsLogoUrl?: string;
  creamyThemeMode?: boolean;
  hidePostsSection?: boolean;
  disablePostsNotifications?: boolean;
  hideWrittenPostsViewCount?: boolean;
  disableLoginAlarmSounds?: boolean;
  useArabicVoiceForLoginAlert?: boolean;
  hidePostsInteractions?: boolean;
  hideSearchFilters?: boolean;
  hideDownloadStats?: boolean;
  heroTitleFontSize?: number;
  postsLikeEn?: string;
  postsLikeAr?: string;
  postsCommentEn?: string;
  postsCommentAr?: string;
  postsWriteCommentEn?: string;
  postsWriteCommentAr?: string;
  postsYourNameEn?: string;
  postsYourNameAr?: string;
  postsSubmitEn?: string;
  postsSubmitAr?: string;
  postsNoPostsEn?: string;
  postsNoPostsAr?: string;
  postsAuthorBadgeEn?: string;
  postsAuthorBadgeAr?: string;
  postsReplyingAsEn?: string;
  postsReplyingAsAr?: string;
  postsReplyButtonEn?: string;
  postsReplyButtonAr?: string;
  postsBackToHomeEn?: string;
  postsBackToHomeAr?: string;
  postsWriteReplyPlaceholderEn?: string;
  postsWriteReplyPlaceholderAr?: string;
  showVerifiedBadgeInHeader?: boolean;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  ipAddress: string;
  userAgent?: string;
  attemptedPassword?: string;
  type: 'failed_attempt' | 'excessive_failures' | 'lockout' | 'password_changed';
  resolved: boolean;
}

export interface PostComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number; // timestamp
  isAdminReply?: boolean;
  replies?: PostComment[];
}

export interface Post {
  id: string;
  titleEn?: string;
  titleAr?: string;
  contentEn: string;
  contentAr: string;
  image?: string; // Base64 data URL or URL
  video?: string; // Base64 data URL or URL / embed
  createdAt: number; // timestamp
  likes: number;
  views?: number;
  comments: PostComment[];
}

export interface InteractionSchedule {
  id: string;
  postId: string; // The post (or video) target
  targetViewsToAdd: number;
  targetLikesToAdd: number;
  addedViews: number;
  addedLikes: number;
  durationMinutes: number;
  startedAt: number;
  lastUpdateAt: number;
  completed: boolean;
}


