import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, BookOpen, User, Settings, Plus, Edit2, Trash2, Save, 
  Upload, Eye, Check, X, Shield, RefreshCw, BarChart2, FileText, Sparkles,
  Sun, Moon, Type, Minus, RotateCcw, Mail, Sliders, Phone, MessageSquare, ThumbsUp, Zap
} from 'lucide-react';
import { Book, AuthorBio, Language, UiTexts, SecurityAlert, Post, PostComment, CustomContactMethod } from '../types';

interface AdminDashboardProps {
  lang: Language;
  books: Book[];
  author: AuthorBio;
  posts: Post[];
  onRefreshData: () => void;
  onClose: () => void;
  uiTexts: UiTexts;
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export default function AdminDashboard({
  lang,
  books,
  author,
  posts,
  onRefreshData,
  onClose,
  uiTexts,
  currentTheme = 'dark',
  onToggleTheme
}: AdminDashboardProps) {
  const isRtl = lang === 'ar';
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Tab state: 'books' | 'bio' | 'settings' | 'uitexts'
  const [activeTab, setActiveTab] = useState<'books' | 'posts' | 'bio' | 'settings' | 'uitexts' | 'security'>('books');

  // Post management states
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // Post Form states
  const [postContentEn, setPostContentEn] = useState('');
  const [postContentAr, setPostContentAr] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postVideo, setPostVideo] = useState('');
  const [postLikes, setPostLikes] = useState(0);
  const [postViews, setPostViews] = useState(0);
  const [postDeleteConfirmId, setPostDeleteConfirmId] = useState<string | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [postsSuccess, setPostsSuccess] = useState('');

  // Gradual delivery traffic simulation states
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [scheduleViewsToAdd, setScheduleViewsToAdd] = useState(0);
  const [scheduleLikesToAdd, setScheduleLikesToAdd] = useState(0);
  const [scheduleDurationMinutes, setScheduleDurationMinutes] = useState(30);
  const [isStartingSchedule, setIsStartingSchedule] = useState(false);

  const fetchInteractionSchedules = async () => {
    try {
      const token = sessionStorage.getItem('coma_admin_token');
      if (!token) return;
      
      const res = await fetch('/api/admin/interaction-schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAllSchedules(data);
      }
    } catch (err) {
      console.error('Error fetching interaction schedules:', err);
    }
  };

  const handleStartSchedule = async (postId: string) => {
    if (scheduleViewsToAdd === 0 && scheduleLikesToAdd === 0) {
      alert(isRtl ? 'الرجاء إدخال عدد للمشاهدات أو الإعجابات للبدء' : 'Please specify views or likes to deliver');
      return;
    }
    
    setIsStartingSchedule(true);
    try {
      const token = sessionStorage.getItem('coma_admin_token');
      const res = await fetch('/api/admin/interaction-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          targetViewsToAdd: scheduleViewsToAdd,
          targetLikesToAdd: scheduleLikesToAdd,
          durationMinutes: scheduleDurationMinutes
        })
      });
      
      if (res.ok) {
        setScheduleViewsToAdd(0);
        setScheduleLikesToAdd(0);
        fetchInteractionSchedules();
        fetchAdminPosts();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Error starting scheduled delivery');
      }
    } catch (err) {
      console.error('Error starting scheduled delivery:', err);
    } finally {
      setIsStartingSchedule(false);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    try {
      const token = sessionStorage.getItem('coma_admin_token');
      const res = await fetch(`/api/admin/interaction-schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchInteractionSchedules();
        fetchAdminPosts();
      }
    } catch (err) {
      console.error('Error cancelling schedule:', err);
    }
  };

  // Poll schedules when on posts tab
  useEffect(() => {
    if (activeTab === 'posts' && isAuthenticated) {
      fetchInteractionSchedules();
      const interval = setInterval(() => {
        fetchInteractionSchedules();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated]);

  const fetchAdminPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setAdminPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts in admin:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchAdminPosts();
    }
  }, [activeTab]);

  // UI Texts states
  const [editedUiTexts, setEditedUiTexts] = useState<UiTexts>(uiTexts);
  const [isSavingUiTexts, setIsSavingUiTexts] = useState(false);

  useEffect(() => {
    setEditedUiTexts(uiTexts);
  }, [uiTexts]);

  // Book CRUD states
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  // Book Form states
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [catEn, setCatEn] = useState('');
  const [catAr, setCatAr] = useState('');
  const [pages, setPages] = useState(250);
  const [publishYear, setPublishYear] = useState('2026');
  const [isFeatured, setIsFeatured] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showDownloads, setShowDownloads] = useState(true);
  const [showRating, setShowRating] = useState(true);
  const [ratingValue, setRatingValue] = useState(5.0);
  const [ratingCount, setRatingCount] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // File uploads
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Author Bio Form states
  const [authNameEn, setAuthNameEn] = useState('');
  const [authNameAr, setAuthNameAr] = useState('');
  const [authTitleEn, setAuthTitleEn] = useState('');
  const [authTitleAr, setAuthTitleAr] = useState('');
  const [authBioEn, setAuthBioEn] = useState('');
  const [authBioAr, setAuthBioAr] = useState('');
  const [authQuoteEn, setAuthQuoteEn] = useState('');
  const [authQuoteAr, setAuthQuoteAr] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [emailLink, setEmailLink] = useState('');
  const [authAvatar, setAuthAvatar] = useState('');
  const [authAvatars, setAuthAvatars] = useState<string[]>([]);
  const [authVideoUrl, setAuthVideoUrl] = useState('');
  const [authShowSlideshow, setAuthShowSlideshow] = useState(true);
  const [authSlideshowSpeed, setAuthSlideshowSpeed] = useState(4);
  const [authImageOpacity, setAuthImageOpacity] = useState(100);
  const [authImageBlur, setAuthImageBlur] = useState(0);
  const [authImageContrast, setAuthImageContrast] = useState(100);
  const [authImageBrightness, setAuthImageBrightness] = useState(100);
  const [newAvatarUrlInput, setNewAvatarUrlInput] = useState('');
  const [showSocialLinks, setShowSocialLinks] = useState(true);

  // States for "Contact the Author" feature
  const [cfEnableFeature, setCfEnableFeature] = useState(true);
  const [cfHideFromControlPanel, setCfHideFromControlPanel] = useState(false);
  const [cfTitleEn, setCfTitleEn] = useState('Contact the Author');
  const [cfTitleAr, setCfTitleAr] = useState('اتصل بالكاتب');
  const [cfDescriptionEn, setCfDescriptionEn] = useState('');
  const [cfDescriptionAr, setCfDescriptionAr] = useState('');
  const [cfPhoneValue, setCfPhoneValue] = useState('');
  const [cfPhoneVisible, setCfPhoneVisible] = useState(true);
  const [cfEmailValue, setCfEmailValue] = useState('');
  const [cfEmailVisible, setCfEmailVisible] = useState(true);
  const [cfInstagramValue, setCfInstagramValue] = useState('');
  const [cfInstagramVisible, setCfInstagramVisible] = useState(true);
  const [cfFacebookValue, setCfFacebookValue] = useState('');
  const [cfFacebookVisible, setCfFacebookVisible] = useState(true);
  const [cfTiktokValue, setCfTiktokValue] = useState('');
  const [cfTiktokVisible, setCfTiktokVisible] = useState(false);
  const [cfOtherValue, setCfOtherValue] = useState('');
  const [cfOtherVisible, setCfOtherVisible] = useState(false);
  const [cfOtherLabelEn, setCfOtherLabelEn] = useState('Other Platform');
  const [cfOtherLabelAr, setCfOtherLabelAr] = useState('منصة أخرى');
  const [cfShowInHeader, setCfShowInHeader] = useState(true);
  const [cfShowInHero, setCfShowInHero] = useState(true);
  const [cfBoxSize, setCfBoxSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xl');
  const [cfCustomPlatforms, setCfCustomPlatforms] = useState<CustomContactMethod[]>([]);

  const handleAddCustomPlatform = () => {
    const newPlatform: CustomContactMethod = {
      id: 'cp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      platform: 'instagram',
      labelEn: '',
      labelAr: '',
      value: '',
      visible: true
    };
    setCfCustomPlatforms([...cfCustomPlatforms, newPlatform]);
  };

  const handleRemoveCustomPlatform = (id: string) => {
    setCfCustomPlatforms(cfCustomPlatforms.filter(p => p.id !== id));
  };

  const handleUpdateCustomPlatform = (id: string, field: keyof CustomContactMethod, val: any) => {
    setCfCustomPlatforms(cfCustomPlatforms.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  // States for changing administrator password
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Theme Selection states
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(currentTheme);
  const [themeChangeSuccess, setThemeChangeSuccess] = useState('');

  // Feature Toggle states
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [featuresSuccess, setFeaturesSuccess] = useState('');

  // Sync selected theme with currentTheme prop
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Security Alert logs and tracking states
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState(0);
  const [lockoutUntilTime, setLockoutUntilTime] = useState(0);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState('');

  // Auto-fill Author forms when loaded
  useEffect(() => {
    if (author) {
      setAuthNameEn(author.nameEn || '');
      setAuthNameAr(author.nameAr || '');
      setAuthTitleEn(author.titleEn || '');
      setAuthTitleAr(author.titleAr || '');
      setAuthBioEn(author.bioEn || '');
      setAuthBioAr(author.bioAr || '');
      setAuthQuoteEn(author.quoteEn || '');
      setAuthQuoteAr(author.quoteAr || '');
      setTwitterLink(author.socialLinks?.twitter || '');
      setInstagramLink(author.socialLinks?.instagram || '');
      setFacebookLink(author.socialLinks?.facebook || '');
      setEmailLink(author.socialLinks?.email || '');
      setAuthAvatar(author.avatar || '');
      setAuthAvatars(author.avatars || []);
      setAuthVideoUrl(author.videoUrl || '');
      setAuthShowSlideshow(author.showSlideshow !== false);
      setAuthSlideshowSpeed(author.slideshowSpeed || 4);
      setAuthImageOpacity(author.imageOpacity !== undefined ? author.imageOpacity : 100);
      setAuthImageBlur(author.imageBlur !== undefined ? author.imageBlur : 0);
      setAuthImageContrast(author.imageContrast !== undefined ? author.imageContrast : 100);
      setAuthImageBrightness(author.imageBrightness !== undefined ? author.imageBrightness : 100);
      setShowSocialLinks(author.showSocialLinks !== false);

      if (author.contactFeature) {
        const cf = author.contactFeature;
        setCfEnableFeature(cf.enableFeature !== false);
        setCfHideFromControlPanel(!!cf.hideFromControlPanel);
        setCfTitleEn(cf.titleEn || 'Contact the Author');
        setCfTitleAr(cf.titleAr || 'اتصل بالكاتب');
        setCfDescriptionEn(cf.descriptionEn || '');
        setCfDescriptionAr(cf.descriptionAr || '');
        setCfPhoneValue(cf.phone?.value || '');
        setCfPhoneVisible(cf.phone?.visible !== false);
        setCfEmailValue(cf.email?.value || '');
        setCfEmailVisible(cf.email?.visible !== false);
        setCfInstagramValue(cf.instagram?.value || '');
        setCfInstagramVisible(cf.instagram?.visible !== false);
        setCfFacebookValue(cf.facebook?.value || '');
        setCfFacebookVisible(cf.facebook?.visible !== false);
        setCfTiktokValue(cf.tiktok?.value || '');
        setCfTiktokVisible(!!cf.tiktok?.visible);
        setCfOtherValue(cf.other?.value || '');
        setCfOtherVisible(!!cf.other?.visible);
        setCfOtherLabelEn(cf.otherLabelEn || 'Other Platform');
        setCfOtherLabelAr(cf.otherLabelAr || 'منصة أخرى');
        setCfShowInHeader(cf.showInHeader !== false);
        setCfShowInHero(cf.showInHero !== false);
        setCfBoxSize(cf.boxSize || 'xl');
        setCfCustomPlatforms(cf.customPlatforms || []);
      } else {
        setCfEnableFeature(true);
        setCfHideFromControlPanel(false);
        setCfTitleEn('Contact the Author');
        setCfTitleAr('اتصل بالكاتب');
        setCfBoxSize('xl');
        setCfCustomPlatforms([]);
        setCfDescriptionEn('');
        setCfDescriptionAr('');
        setCfPhoneValue('');
        setCfPhoneVisible(true);
        setCfEmailValue('');
        setCfEmailVisible(true);
        setCfInstagramValue('');
        setCfInstagramVisible(true);
        setCfFacebookValue('');
        setCfFacebookVisible(true);
        setCfTiktokValue('');
        setCfTiktokVisible(false);
        setCfOtherValue('');
        setCfOtherVisible(false);
        setCfOtherLabelEn('Other Platform');
        setCfOtherLabelAr('منصة أخرى');
        setCfShowInHeader(true);
        setCfShowInHero(true);
      }
    }
  }, [author]);

  // Check login on session storage
  useEffect(() => {
    const token = sessionStorage.getItem('coma_admin_token');
    if (token === 'coma_secure_token_2026') {
      setIsAuthenticated(true);
    }
  }, []);

  const [confirmClearLogs, setConfirmClearLogs] = useState(false);

  const fetchSecurityAlerts = async () => {
    const token = sessionStorage.getItem('coma_admin_token');
    if (!token) return;

    setIsLoadingAlerts(true);
    setAlertsError('');
    try {
      const response = await fetch('/api/admin/security/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSecurityAlerts(data.alerts || []);
        setFailedAttemptsCount(data.failedAttemptsCount || 0);
        setLockoutUntilTime(data.lockoutUntil || 0);
      } else {
        setAlertsError(isRtl ? 'فشل تحميل سجل التنبيهات الأمنية' : 'Failed to load security alerts');
      }
    } catch (err) {
      setAlertsError(isRtl ? 'فشل الاتصال بالخادم لتحديث السجل الأمني' : 'Failed to connect to server for security log update');
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const token = sessionStorage.getItem('coma_admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/security/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ alertId })
      });
      if (response.ok) {
        const data = await response.json();
        setSecurityAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleClearAllAlerts = async () => {
    const token = sessionStorage.getItem('coma_admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/security/clear-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setSecurityAlerts([]);
        setFailedAttemptsCount(0);
        setLockoutUntilTime(0);
        setConfirmClearLogs(false);
      }
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
  };

  const playLoginWarningSound = () => {
    if (uiTexts.disableLoginAlarmSounds === true) return;
    
    if (uiTexts.useArabicVoiceForLoginAlert === true) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        const text = isRtl
          ? "تحذير! تم رصد محاولة دخول غير مصرح بها إلى لوحة التحكم الخاصة!"
          : "Warning! An unauthorized login attempt has been detected on the private dashboard!";
          
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('ar-SA') || v.lang.includes('ar-EG'));
        if (arVoice) {
          utterance.voice = arVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(440, now + 0.45);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.linearRampToValueAtTime(880, now + 0.45);
        
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } catch (e) {
        console.warn("Web Audio failed to play login warning sound:", e);
      }
    }
  };

  // Poll security alerts when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchSecurityAlerts();
    const interval = setInterval(() => {
      fetchSecurityAlerts();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Play continuous/repetitive security alarm/siren/speech inside the control panel if there are active threats
  useEffect(() => {
    let interval: any = null;
    const hasActiveAlerts = isAuthenticated && securityAlerts.some(a => !a.resolved);
    
    if (hasActiveAlerts && uiTexts.disableLoginAlarmSounds !== true) {
      // Play immediately
      playLoginWarningSound();
      
      // Repeat continuously/repetitively
      interval = setInterval(() => {
        playLoginWarningSound();
      }, uiTexts.useArabicVoiceForLoginAlert === true ? 5500 : 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAuthenticated, securityAlerts, uiTexts.disableLoginAlarmSounds, uiTexts.useArabicVoiceForLoginAlert, isRtl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
 
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
 
      const data = await response.json();
      if (response.ok && data.success) {
        sessionStorage.setItem('coma_admin_token', data.token);
        setIsAuthenticated(true);
        setConsecutiveFailures(0);
      } else {
        const errorMsg = isRtl 
          ? (data.messageAr || data.error || 'كلمة المرور خاطئة')
          : (data.messageEn || data.error || 'Invalid credentials');
        setLoginError(errorMsg);
        
        const nextFailures = consecutiveFailures + 1;
        setConsecutiveFailures(nextFailures);
      }
    } catch (err) {
      setLoginError(isRtl ? 'فشل الاتصال بالخادم / Server connection error' : 'Server connection error / فشل في الاتصال بالخادم');
      const nextFailures = consecutiveFailures + 1;
      setConsecutiveFailures(nextFailures);
    } finally {
      setLoading(false);
    }
  };

  // Base64 helper for uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError('');

    // Size checks (e.g. max 100MB to avoid database bloat in json structure)
    const maxSize = type === 'pdf' ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setFormError(
        isRtl 
          ? `حجم الملف كبير جداً. الحد الأقصى: ${type === 'pdf' ? '100MB' : '2MB'}`
          : `File is too large. Max limit is ${type === 'pdf' ? '100MB' : '2MB'}`
      );
      setUploadProgress('');
      return;
    }

    if (type === 'pdf') {
      setSelectedPdfFile(file);
      setPdfFileName(file.name);
      setPdfBase64(''); // Keep empty, we will upload via chunks
      setUploadProgress(
        isRtl 
          ? `تم تحديد ملف الـ PDF بنجاح: ${file.name} (سيتم الرفع عند الحفظ)` 
          : `PDF file selected successfully: ${file.name} (will upload on save)`
      );
    } else {
      setUploadProgress(isRtl ? 'جاري معالجة غلاف الكتاب...' : 'Processing cover image...');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = event.target.result as string;
          setCoverBase64(base64String);
          setUploadProgress(isRtl ? 'تم تحميل ومعالجة الغلاف بنجاح ✓' : 'Cover image parsed successfully ✓');
        }
      };
      reader.onerror = () => {
        setFormError(isRtl ? 'فشل قراءة غلاف الكتاب' : 'Failed to read cover image');
        setUploadProgress('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset forms helper
  const handleResetForm = () => {
    setTitleEn('');
    setTitleAr('');
    setDescEn('');
    setDescAr('');
    setCatEn('');
    setCatAr('');
    setPages(250);
    setPublishYear('2026');
    setIsFeatured(false);
    setDownloadCount(0);
    setShowDownloads(true);
    setShowRating(true);
    setRatingValue(5.0);
    setRatingCount(0);
    setSelectedPdfFile(null);
    setPdfBase64('');
    setPdfFileName('');
    setCoverBase64('');
    setEditingBookId(null);
    setIsEditingBook(false);
    setFormError('');
    setFormSuccess('');
    setUploadProgress('');
  };

  // Reset Book Form
  const resetBookForm = () => {
    setTitleEn('');
    setTitleAr('');
    setDescEn('');
    setDescAr('');
    setCatEn('');
    setCatAr('');
    setPages(250);
    setPublishYear('2026');
    setIsFeatured(false);
    setDownloadCount(0);
    setShowDownloads(true);
    setShowRating(true);
    setRatingValue(5.0);
    setRatingCount(0);
    setSelectedPdfFile(null);
    setPdfBase64('');
    setPdfFileName('');
    setCoverBase64('');
    setEditingBookId(null);
    setIsEditingBook(false);
    setFormError('');
    setFormSuccess('');
    setUploadProgress('');
  };

  // Chunked PDF File Upload Helper
  const uploadFileInChunks = (bookId: string, file: File): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const token = sessionStorage.getItem('coma_admin_token');
      const chunkSize = 4 * 1024 * 1024; // 4MB chunks are extremely safe and fast
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blobChunk = file.slice(start, end);
        
        try {
          // Read chunk as base64 string
          const chunkBase64 = await new Promise<string>((resBlob, rejBlob) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                let dataUrl = e.target.result as string;
                // strip data url prefix to get raw base64
                const commaIdx = dataUrl.indexOf(',');
                if (commaIdx !== -1) {
                  dataUrl = dataUrl.substring(commaIdx + 1);
                }
                resBlob(dataUrl);
              } else {
                rejBlob(new Error('Empty result reading chunk'));
              }
            };
            reader.onerror = () => rejBlob(reader.error || new Error('Error reading chunk'));
            reader.readAsDataURL(blobChunk);
          });
          
          // Post chunk to the server chunk upload API
          const response = await fetch(`/api/books/${bookId}/upload-chunk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              chunkIndex: i,
              totalChunks,
              chunkData: chunkBase64,
              fileName: file.name
            })
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to upload chunk ${i + 1} of ${totalChunks}`);
          }
          
          // Show progress percentage
          const percentComplete = Math.round(((i + 1) / totalChunks) * 100);
          setUploadProgress(
            isRtl 
              ? `جاري رفع وحفظ ملف الـ PDF... تم رفع ${percentComplete}%` 
              : `Uploading PDF file... ${percentComplete}% completed`
          );
        } catch (error: any) {
          return reject(error);
        }
      }
      resolve();
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'footerLogoUrl' | 'topCustomImageUrl' | 'postsLogoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isRtl ? 'حجم الملف كبير جداً. يجب أن يكون أقل من 2 ميجابايت' : 'Image file is too large. Must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditedUiTexts(prev => ({
          ...prev,
          [field]: event.target?.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAuthorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isRtl ? 'حجم الملف كبير جداً. يجب أن يكون أقل من 2 ميجابايت' : 'Image file is too large. Must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAuthAvatar(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAuthorAvatarsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(fileObj => {
      const file = fileObj as File;
      if (file.size > 2 * 1024 * 1024) {
        alert(isRtl ? `الملف ${file.name} كبير جداً. يجب أن يكون أقل من 2 ميجابايت` : `File ${file.name} is too large. Must be under 2MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAuthAvatars(prev => [...prev, event.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddAvatarUrl = (url: string) => {
    if (!url.trim()) return;
    setAuthAvatars(prev => [...prev, url.trim()]);
  };

  const handleRemoveAvatar = (index: number) => {
    setAuthAvatars(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveAvatar = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === authAvatars.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setAuthAvatars(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert(isRtl ? 'حجم ملف الفيديو كبير جداً. الحد الأقصى هو 15 ميجابايت.' : 'Video file is too large. Max allowed is 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAuthVideoUrl(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUiTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUiTexts(true);
    setFormError('');
    setFormSuccess('');

    try {
      const token = sessionStorage.getItem('coma_admin_token');
      const res = await fetch('/api/uitexts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedUiTexts)
      });

      if (!res.ok) {
        throw new Error('Could not save UI text settings.');
      }

      setFormSuccess(isRtl ? 'تم حفظ كافة نصوص وإعدادات واجهة الموقع بنجاح!' : 'All website interface text settings saved successfully!');
      onRefreshData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error saving settings.');
    } finally {
      setIsSavingUiTexts(false);
    }
  };

  const handleSaveFeatures = async () => {
    setIsSavingFeatures(true);
    try {
      const token = sessionStorage.getItem('coma_admin_token');
      const res = await fetch('/api/uitexts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedUiTexts)
      });

      if (!res.ok) {
        throw new Error('Could not save settings.');
      }

      // Sync and save contactFeature changes to author endpoint
      if (author) {
        const updatedBioPayload: AuthorBio = {
          ...author,
          contactFeature: {
            enableFeature: cfEnableFeature,
            hideFromControlPanel: cfHideFromControlPanel,
            titleEn: cfTitleEn,
            titleAr: cfTitleAr,
            descriptionEn: cfDescriptionEn,
            descriptionAr: cfDescriptionAr,
            phone: { value: cfPhoneValue, visible: cfPhoneVisible },
            email: { value: cfEmailValue, visible: cfEmailVisible },
            instagram: { value: cfInstagramValue, visible: cfInstagramVisible },
            facebook: { value: cfFacebookValue, visible: cfFacebookVisible },
            tiktok: { value: cfTiktokValue, visible: cfTiktokVisible },
            other: { value: cfOtherValue, visible: cfOtherVisible },
            otherLabelEn: cfOtherLabelEn,
            otherLabelAr: cfOtherLabelAr,
            showInHeader: cfShowInHeader,
            showInHero: cfShowInHero,
            boxSize: cfBoxSize,
            customPlatforms: cfCustomPlatforms
          }
        };

        await fetch('/api/author', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedBioPayload)
        });
      }

      setFeaturesSuccess(isRtl ? 'تم حفظ إعدادات الميزات وعرض الموقع بنجاح!' : 'Feature visibility and settings saved successfully!');
      onRefreshData();
      setTimeout(() => setFeaturesSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSavingFeatures(false);
    }
  };

  // Add or Update Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!titleEn || !titleAr || !descEn || !descAr) {
      setFormError(isRtl ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    const bookPayload: Partial<Book> = {
      titleEn,
      titleAr,
      descriptionEn: descEn,
      descriptionAr: descAr,
      categoryEn: catEn || 'Fiction',
      categoryAr: catAr || 'رواية',
      pages: Number(pages),
      publishYear,
      isFeatured,
      authorEn: author.nameEn,
      authorAr: author.nameAr,
      downloadCount: Number(downloadCount),
      showDownloads: Boolean(showDownloads),
      showRating: Boolean(showRating),
      ratingValue: Number(ratingValue),
      ratingCount: Number(ratingCount)
    };

    // Include cover image if updated
    if (coverBase64) {
      bookPayload.coverImage = coverBase64;
    }

    setLoading(true);
    setUploadProgress(isRtl ? 'جاري حفظ معلومات الكتاب...' : 'Saving book details...');
    const token = sessionStorage.getItem('coma_admin_token');

    try {
      const url = editingBookId ? `/api/books/${editingBookId}` : '/api/books';
      const method = editingBookId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookPayload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || (isRtl ? 'فشل حفظ معلومات الكتاب' : 'Failed to save book parameters'));
      }

      const savedBook = await response.json();
      const bookId = savedBook.id;

      // Now, if a new PDF file was selected, upload it via the chunky uploader
      if (selectedPdfFile) {
        setUploadProgress(isRtl ? 'بدء رفع ملف الـ PDF مجزأً...' : 'Starting PDF upload chunks...');
        await uploadFileInChunks(bookId, selectedPdfFile);
      }

      setFormSuccess(
        isRtl 
          ? 'تم حفظ معلومات ونشر الكتاب بنجاح ✓' 
          : 'Book saved and published successfully ✓'
      );
      onRefreshData();
      setTimeout(() => {
        resetBookForm();
      }, 1500);
    } catch (error: any) {
      setFormError(error.message || 'Connection failure / عطل في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  // Trigger edit setup
  const startEditBook = (book: Book) => {
    setTitleEn(book.titleEn || '');
    setTitleAr(book.titleAr || '');
    setDescEn(book.descriptionEn || '');
    setDescAr(book.descriptionAr || '');
    setCatEn(book.categoryEn || '');
    setCatAr(book.categoryAr || '');
    setPages(book.pages || 250);
    setPublishYear(book.publishYear || '2026');
    setIsFeatured(book.isFeatured || false);
    setDownloadCount(book.downloadCount !== undefined ? book.downloadCount : 0);
    setShowDownloads(book.showDownloads !== false);
    setShowRating(book.showRating !== false);
    setRatingValue(book.ratingValue !== undefined ? book.ratingValue : 5.0);
    setRatingCount(book.ratingCount !== undefined ? book.ratingCount : 0);
    setSelectedPdfFile(null);
    setPdfBase64(''); // Keep empty unless updating PDF
    setPdfFileName(book.pdfFileName || '');
    setCoverBase64(book.coverImage && book.coverImage.startsWith('data:') ? book.coverImage : '');
    
    setEditingBookId(book.id);
    setIsEditingBook(true);
    setFormError('');
    setFormSuccess('');
  };

  // Delete Book
  const handleDeleteBook = async (bookId: string) => {
    setLoading(true);
    const token = sessionStorage.getItem('coma_admin_token');

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onRefreshData();
        setDeleteConfirmId(null);
        setFormSuccess(isRtl ? 'تم حذف الكتاب بنجاح ✓' : 'Book deleted successfully ✓');
        setTimeout(() => setFormSuccess(''), 2000);
      } else {
        setFormError(isRtl ? 'فشل حذف الكتاب' : 'Failed to delete book');
      }
    } catch (err) {
      setFormError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  // Post operations
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostsError('');
    setPostsSuccess('');
    setIsSavingPost(true);

    const token = sessionStorage.getItem('coma_admin_token');
    const payload = {
      contentEn: postContentEn,
      contentAr: postContentAr,
      image: postImage,
      video: postVideo,
      likes: postLikes,
      views: postViews
    };

    try {
      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setPostsSuccess(isRtl ? 'تم حفظ المنشور بنجاح ✓' : 'Post saved successfully ✓');
        // Reset form
        setPostContentEn('');
        setPostContentAr('');
        setPostImage('');
        setPostVideo('');
        setPostLikes(0);
        setPostViews(0);
        setIsEditingPost(false);
        setEditingPostId(null);
        
        // Refresh
        fetchAdminPosts();
        onRefreshData();
        setTimeout(() => setPostsSuccess(''), 3000);
      } else {
        const errData = await res.json();
        setPostsError(errData.error || (isRtl ? 'فشل حفظ المنشور' : 'Failed to save post'));
      }
    } catch (err) {
      setPostsError(isRtl ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleEditPostStart = (post: Post) => {
    setPostContentEn(post.contentEn);
    setPostContentAr(post.contentAr);
    setPostImage(post.image || '');
    setPostVideo(post.video || '');
    setPostLikes(post.likes || 0);
    setPostViews(post.views || 0);
    setEditingPostId(post.id);
    setIsEditingPost(true);
    setPostsError('');
    setPostsSuccess('');
  };

  const handleDeletePost = async (postId: string) => {
    const token = sessionStorage.getItem('coma_admin_token');
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setPostsSuccess(isRtl ? 'تم حذف المنشور بنجاح ✓' : 'Post deleted successfully ✓');
        setPostDeleteConfirmId(null);
        fetchAdminPosts();
        onRefreshData();
        setTimeout(() => setPostsSuccess(''), 3000);
      } else {
        setPostsError(isRtl ? 'فشل حذف المنشور' : 'Failed to delete post');
      }
    } catch (err) {
      setPostsError(isRtl ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error');
    }
  };

  // Handle post image file upload (converts to base64)
  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setPostsError(isRtl ? 'حجم الصورة يجب أن لا يتجاوز 2 ميجابايت' : 'Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle post video file upload (converts to base64, up to 20MB)
  const handlePostVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setPostsError(isRtl ? 'حجم الفيديو يجب أن لا يتجاوز 20 ميجابايت' : 'Video size must be under 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostVideo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper to format date nicely in admin
  const formatAdminDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // Save Biography
  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    const bioPayload: AuthorBio = {
      nameEn: authNameEn,
      nameAr: authNameAr,
      titleEn: authTitleEn,
      titleAr: authTitleAr,
      bioEn: authBioEn,
      bioAr: authBioAr,
      quoteEn: authQuoteEn,
      quoteAr: authQuoteAr,
      avatar: authAvatar,
      avatars: authAvatars,
      videoUrl: authVideoUrl,
      showSlideshow: authShowSlideshow,
      slideshowSpeed: authSlideshowSpeed,
      imageOpacity: authImageOpacity,
      imageBlur: authImageBlur,
      imageContrast: authImageContrast,
      imageBrightness: authImageBrightness,
      showSocialLinks: showSocialLinks,
      socialLinks: {
        twitter: twitterLink,
        instagram: instagramLink,
        facebook: facebookLink,
        email: emailLink
      },
      contactFeature: {
        enableFeature: cfEnableFeature,
        hideFromControlPanel: cfHideFromControlPanel,
        titleEn: cfTitleEn,
        titleAr: cfTitleAr,
        descriptionEn: cfDescriptionEn,
        descriptionAr: cfDescriptionAr,
        phone: { value: cfPhoneValue, visible: cfPhoneVisible },
        email: { value: cfEmailValue, visible: cfEmailVisible },
        instagram: { value: cfInstagramValue, visible: cfInstagramVisible },
        facebook: { value: cfFacebookValue, visible: cfFacebookVisible },
        tiktok: { value: cfTiktokValue, visible: cfTiktokVisible },
        other: { value: cfOtherValue, visible: cfOtherVisible },
        otherLabelEn: cfOtherLabelEn,
        otherLabelAr: cfOtherLabelAr,
        showInHeader: cfShowInHeader,
        showInHero: cfShowInHero,
        boxSize: cfBoxSize,
        customPlatforms: cfCustomPlatforms
      }
    };

    const token = sessionStorage.getItem('coma_admin_token');

    try {
      const response = await fetch('/api/author', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bioPayload)
      });

      if (response.ok) {
        setFormSuccess(isRtl ? 'تم تحديث السيرة الذاتية للكاتبة بنجاح ✓' : 'Author biography saved successfully ✓');
        onRefreshData();
        setTimeout(() => setFormSuccess(''), 3000);
      } else {
        setFormError(isRtl ? 'فشل تحديث السيرة الذاتية' : 'Could not save author info');
      }
    } catch (err) {
      setFormError('Server Connection Lost');
    } finally {
      setLoading(false);
    }
  };

  // Change admin password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!newAdminPassword) {
      setPasswordChangeError(isRtl ? 'الرجاء إدخال كلمة المرور الجديدة' : 'Please enter the new password.');
      return;
    }

    if (newAdminPassword.length < 8) {
      setPasswordChangeError(isRtl ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'Password must be at least 8 characters long.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-\/])[A-Za-z\d@$!%*?&#_\-\/]{8,}$/;
    if (!passwordRegex.test(newAdminPassword)) {
      setPasswordChangeError(
        isRtl 
          ? 'يجب أن تحتوي كلمة المرور على حرف كبير واحد، وحرف صغير واحد، ورقم واحد، ورمز خاص واحد على الأقل (@$!%*?&#_-/)'
          : 'Password must contain at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#_-/).'
      );
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeError(isRtl ? 'كلمات المرور غير متطابقة!' : 'Passwords do not match!');
      return;
    }

    setIsSavingPassword(true);
    const token = sessionStorage.getItem('coma_admin_token');

    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newAdminPassword })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordChangeSuccess(isRtl ? 'تم تحديث كلمة مرور لوحة التحكم بنجاح! ✓' : 'Admin password updated successfully! ✓');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        setTimeout(() => setPasswordChangeSuccess(''), 4000);
      } else {
        setPasswordChangeError(data.error || (isRtl ? 'فشل تحديث كلمة المرور' : 'Failed to update password'));
      }
    } catch (err) {
      setPasswordChangeError(isRtl ? 'فشل الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Computed Stats
  const totalDownloads = books.reduce((acc, book) => acc + (book.downloadCount || 0), 0);

  // 1. SIGN IN SCREEN GATING
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/95 px-6 backdrop-blur-xl">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-brand-deep/80 p-8 shadow-2xl">
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-brand-gold/10 p-3 text-brand-gold">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              {isRtl ? 'لوحة التحكم الخاصة للكاتب' : 'Exclusive Author Workspace'}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              {isRtl 
                ? 'الوصول محمي. يرجى إدخال كلمة مرور الإدارة لتعديل الروايات ومحتوى الموقع.' 
                : 'Restricted workspace. Please enter your administrator password to customize site content.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-mono">
                {isRtl ? 'كلمة مرور الإدارة' : 'Security Password'}
              </label>
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError('');
                }}
                className="w-full rounded-lg border border-slate-800 bg-brand-ink px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="space-y-2">
                <p className="text-xs text-red-500 bg-red-950/20 border border-red-900/30 rounded px-3 py-2 text-center">
                  {loginError}
                </p>
                <button
                  type="button"
                  onClick={() => setLoginError('')}
                  className="w-full text-[10px] text-slate-400 hover:text-white uppercase font-mono tracking-wider transition-all"
                >
                  {isRtl ? 'إيقاف الإنذار / مسح الخطأ' : 'Mute Alert / Dismiss Error'}
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                id="admin-login-submit"
                type="submit"
                disabled={loading}
                className="flex-grow rounded-lg bg-brand-gold py-3 text-xs font-bold text-brand-ink transition-transform active:scale-95 hover:bg-yellow-500 cursor-pointer"
              >
                {loading ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'دخـول الآمن' : 'Authorize Entrance')}
              </button>
              <button
                id="admin-login-cancel"
                type="button"
                onClick={() => {
                  setLoginError('');
                  onClose();
                }}
                className="rounded-lg border border-slate-800 px-4 text-xs font-semibold text-slate-400 hover:text-white"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN WORKSPACE SCREEN
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-ink px-4 py-8 md:p-10">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-brand-deep/60 backdrop-blur-xl shadow-2xl">
        
        {/* WORKSPACE HEADER */}
        <div className={`flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 px-6 py-5 gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="rounded-md bg-brand-gold/10 p-2 text-brand-gold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                {isRtl ? 'منصة إدارة المحتوى للكاتبة' : 'Sarah’s Author Control Workspace'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl ? 'قم برفع كتب PDF، وتغيير الأغلفة، وتحديث السيرة الذاتية' : 'Manage your books directory, author details, and track downloads.'}
              </p>
            </div>
          </div>
          
          <button
            id="admin-close-workspace-btn"
            onClick={onClose}
            className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700"
          >
            {isRtl ? 'العودة للموقع ←' : '← Back to Website'}
          </button>
        </div>

        {/* WORKSPACE QUICK TABS */}
        <div className={`flex border-b border-slate-800 px-6 bg-brand-ink/40 ${isRtl ? 'flex-row-reverse' : 'flex-row'} overflow-x-auto overflow-y-hidden`}>
          <button
            id="tab-btn-books"
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all ${
              activeTab === 'books' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{isRtl ? 'مجلد الكتب والروايات' : 'Manage Books'}</span>
          </button>

          <button
            id="tab-btn-posts"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all ${
              activeTab === 'posts' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{isRtl ? 'منشورات التواصل' : 'Social Posts'}</span>
          </button>

          <button
            id="tab-btn-bio"
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all ${
              activeTab === 'bio' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <User className="h-4 w-4" />
            <span>{isRtl ? 'السيرة الذاتية والتأملات' : 'Edit Author Biography'}</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all ${
              activeTab === 'settings' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <Settings className="h-4 w-4" />
            <span>{isRtl ? 'إحصائيات النظام' : 'System Insights'}</span>
          </button>

          <button
            id="tab-btn-uitexts"
            onClick={() => setActiveTab('uitexts')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all ${
              activeTab === 'uitexts' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <FileText className="h-4 w-4" />
            <span>{isRtl ? 'تعديل نصوص الموقع' : 'Edit Website Texts'}</span>
          </button>

          <button
            id="tab-btn-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition-all relative ${
              activeTab === 'security' 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-slate-400 hover:text-white'
            } ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <Shield className={`h-4 w-4 ${securityAlerts.some(a => !a.resolved) ? 'text-red-400 animate-pulse' : ''}`} />
            <span>{isRtl ? 'الأمان والتنبيهات' : 'Security Center'}</span>
            {securityAlerts.some(a => !a.resolved) && (
              <span className="absolute top-2.5 right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6">
          
          {/* GENERAL NOTIFICATIONS */}
          {formError && (
            <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-xs text-red-500">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-6 rounded-lg border border-emerald-900/30 bg-emerald-950/20 p-4 text-xs text-emerald-400">
              {formSuccess}
            </div>
          )}

          {securityAlerts.some(a => !a.resolved) && (
            <div className={`mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-xs text-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-red-400 animate-pulse shrink-0" />
                <div>
                  <p className="font-bold text-red-400 font-serif">
                    {isRtl ? '⚠️ تنبيه أمني عاجل!' : '⚠️ Urgent Security Alert!'}
                  </p>
                  <p className="text-slate-300 mt-0.5">
                    {isRtl 
                      ? `تم رصد محاولات دخول غير مصرح بها للوحة التحكم (${securityAlerts.filter(a => !a.resolved).length} تنبيه نشط).`
                      : `Unauthorized control panel access attempts detected (${securityAlerts.filter(a => !a.resolved).length} active alerts).`}
                  </p>
                </div>
              </div>
              <button
                id="btn-goto-security-tab"
                onClick={() => setActiveTab('security')}
                className="rounded bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider shrink-0 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {isRtl ? 'مراجعة السجل الأمني' : 'Review Security Log'}
              </button>
            </div>
          )}

          {/* TAB 1: BOOKS CRUD PORTAL */}
          {activeTab === 'books' && (
            <div className="space-y-8">
              
              {/* Form Toggler Block */}
              <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-serif text-lg font-bold text-white">
                  {isEditingBook 
                    ? (editingBookId ? (isRtl ? 'تعديل رواية قائمة' : 'Edit Existing Book Parameters') : (isRtl ? 'إضافة عمل روائي جديد' : 'Publish New E-Book')) 
                    : (isRtl ? 'قائمة أعمالك الأدبية' : 'Your Literary Registry')}
                </h3>
                
                <button
                  id="toggle-add-book-form-btn"
                  onClick={() => {
                    if (isEditingBook) {
                      resetBookForm();
                    } else {
                      setIsEditingBook(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 px-4 py-2 text-xs font-bold text-brand-gold transition-all hover:bg-brand-gold hover:text-brand-ink ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  {isEditingBook ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>{isEditingBook ? (isRtl ? 'إلغاء وإغلاق' : 'Close Form') : (isRtl ? 'إضافة كتاب جديد' : 'Add New E-Book')}</span>
                </button>
              </div>

              {/* ACTIVE BOOK EDIT/CREATE FORM */}
              {isEditingBook && (
                <form onSubmit={handleSaveBook} className="rounded-xl border border-slate-800 bg-brand-ink/40 p-6 space-y-6">
                  
                  {/* Title Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">Book Title (English) *</label>
                      <input
                        id="form-title-en"
                        type="text"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                        placeholder="e.g. Coma Journey"
                        required
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-xs text-slate-400 mb-2 font-mono">اسم الكتاب (العربية) *</label>
                      <input
                        id="form-title-ar"
                        type="text"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                        placeholder="مثال: رحلتي غيبوبة"
                        required
                      />
                    </div>
                  </div>

                  {/* Categories Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">Genre/Category (English)</label>
                      <input
                        id="form-cat-en"
                        type="text"
                        value={catEn}
                        onChange={(e) => setCatEn(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                        placeholder="e.g. Psychological Novel"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-xs text-slate-400 mb-2 font-mono">التصنيف أو الفئة (العربية)</label>
                      <input
                        id="form-cat-ar"
                        type="text"
                        value={catAr}
                        onChange={(e) => setCatAr(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                        placeholder="مثال: تشويق نفسي"
                      />
                    </div>
                  </div>

                  {/* Descriptions Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">Literary Summary (English) *</label>
                      <textarea
                        id="form-desc-en"
                        value={descEn}
                        onChange={(e) => setDescEn(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                        placeholder="A haunting exploration of solitude and self-realization..."
                        required
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-xs text-slate-400 mb-2 font-mono">الملخص الأدبي (العربية) *</label>
                      <textarea
                        id="form-desc-ar"
                        value={descAr}
                        onChange={(e) => setDescAr(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                        placeholder="تأملات عميقة وغوص مكثف في دروب اللاوعي..."
                        required
                      />
                    </div>
                  </div>

                  {/* Metadata fields (Pages, Publish Year, Featured flag) */}
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 items-center ${isRtl ? 'direction-rtl' : ''}`}>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">{isRtl ? 'عدد الصفحات' : 'Page Count'}</label>
                      <input
                        id="form-pages"
                        type="number"
                        value={pages}
                        onChange={(e) => setPages(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">{isRtl ? 'سنة النشر' : 'Publish Year'}</label>
                      <input
                        id="form-publish-year"
                        type="text"
                        value={publishYear}
                        onChange={(e) => setPublishYear(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        id="form-is-featured"
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-800 bg-brand-deep text-brand-gold focus:ring-0"
                      />
                      <label htmlFor="form-is-featured" className="text-xs text-slate-300 font-bold select-none">
                        {isRtl ? 'تمييز كإصدار مفضل (Featured)' : 'Feature as Recommended Cover'}
                      </label>
                    </div>
                  </div>

                  {/* Performance & Ratings Management */}
                  <div className="border-t border-slate-800 pt-6">
                    <h4 className="font-serif text-sm font-semibold text-brand-gold mb-4">
                      {isRtl ? 'إدارة التنزيلات والتقييمات' : 'Downloads & Ratings Custom Settings'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-deep/30 border border-slate-800 rounded-lg p-5">
                      
                      {/* DOWNLOADS MANAGEMENT COLUMN */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-300 font-serif border-b border-slate-800 pb-2">
                          {isRtl ? 'إعدادات عداد التحميل' : 'Download Count Settings'}
                        </h5>

                        <div className="flex items-center gap-3 py-1">
                          <input
                            id="form-show-downloads"
                            type="checkbox"
                            checked={showDownloads}
                            onChange={(e) => setShowDownloads(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-800 bg-brand-deep text-brand-gold focus:ring-0"
                          />
                          <label htmlFor="form-show-downloads" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                            {isRtl ? 'إظهار عداد التنزيلات في بطاقة الكتاب' : 'Show download count on book card'}
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-2 font-mono">
                            {isRtl ? 'عدد التحميلات اليدوي (أو الوهمي)' : 'Manual (or Fake) Download Count'}
                          </label>
                          <input
                            id="form-download-count"
                            type="number"
                            value={downloadCount}
                            onChange={(e) => setDownloadCount(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                            min={0}
                          />
                        </div>
                      </div>

                      {/* RATINGS MANAGEMENT COLUMN */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-300 font-serif border-b border-slate-800 pb-2">
                          {isRtl ? 'إعدادات تقييم الكتاب' : 'Book Rating Customization'}
                        </h5>

                        <div className="flex items-center gap-3 py-1">
                          <input
                            id="form-show-rating"
                            type="checkbox"
                            checked={showRating}
                            onChange={(e) => setShowRating(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-800 bg-brand-deep text-brand-gold focus:ring-0"
                          />
                          <label htmlFor="form-show-rating" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                            {isRtl ? 'إظهار تقييم النجوم في بطاقة الكتاب' : 'Show stars rating on book card'}
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 mb-2 font-mono">
                              {isRtl ? 'قيمة التقييم (من 1 إلى 5)' : 'Rating Value (1.0 to 5.0)'}
                            </label>
                            <input
                              id="form-rating-value"
                              type="number"
                              step="0.1"
                              min="1.0"
                              max="5.0"
                              value={ratingValue}
                              onChange={(e) => setRatingValue(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-slate-400 mb-2 font-mono">
                              {isRtl ? 'عدد المقيمين (التقييمات)' : 'Number of Raters'}
                            </label>
                            <input
                              id="form-rating-count"
                              type="number"
                              min={0}
                              value={ratingCount}
                              onChange={(e) => setRatingCount(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* DIRECT FILE UPLOADS (PDF & COVER IMAGE) */}
                  <div className="border-t border-slate-800 pt-6">
                    <h4 className="font-serif text-sm font-semibold text-brand-gold mb-4">
                      {isRtl ? 'تحميل الملفات المباشرة' : 'E-Book File Attachments (Stored Locally)'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* 1. PDF FILE UPLOAD (FOR DIRECT IMMEDIATE DOWNLOADING) */}
                      <div className="rounded-lg border border-dashed border-slate-800 bg-brand-ink/40 p-5">
                        <label className="block text-xs text-slate-400 mb-3 font-mono">
                          {isRtl ? 'ملف الكتاب الأصلي (PDF فقط - الحد الأقصى ١٠٠ ميجابايت)' : 'Main Book Document (PDF Only - Max 100MB) *'}
                        </label>
                        <div className="flex flex-col gap-3">
                          <div className="relative flex items-center justify-center rounded-lg border border-slate-800 bg-brand-deep/50 px-4 py-6 hover:bg-brand-deep transition-all cursor-pointer">
                            <input
                              id="form-upload-pdf"
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleFileUpload(e, 'pdf')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              required={!editingBookId} // Required only on first creation
                            />
                            <div className="text-center">
                              <Upload className="mx-auto h-6 w-6 text-slate-500 mb-2" />
                              <span className="text-xs text-slate-300 font-semibold">
                                {isRtl ? 'اختر ملف الـ PDF' : 'Click to Upload PDF'}
                              </span>
                            </div>
                          </div>
                          
                          {/* File status indicators */}
                          {pdfFileName && (
                            <div className="flex items-center justify-between rounded bg-brand-deep px-3 py-2 text-xs">
                              <span className="truncate text-slate-400 max-w-[80%]">{pdfFileName}</span>
                              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. COVER IMAGE UPLOAD */}
                      <div className="rounded-lg border border-dashed border-slate-800 bg-brand-ink/40 p-5">
                        <label className="block text-xs text-slate-400 mb-3 font-mono">
                          {isRtl ? 'صورة الغلاف مخصصة (اختياري - الحد الأقصى ٢ ميجابايت)' : 'Custom Book Cover Graphic (Optional - Max 2MB)'}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <div className="relative flex-grow flex items-center justify-center rounded-lg border border-slate-800 bg-brand-deep/50 px-4 py-6 w-full hover:bg-brand-deep transition-all cursor-pointer">
                            <input
                              id="form-upload-cover"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'cover')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                              <Upload className="mx-auto h-6 w-6 text-slate-500 mb-2" />
                              <span className="text-xs text-slate-300 font-semibold">
                                {isRtl ? 'اختر صورة الغلاف' : 'Click to Upload Image'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Cover Preview slot */}
                          <div className="h-28 w-20 border border-slate-800 rounded bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                            {coverBase64 ? (
                              <img src={coverBase64} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-slate-600 font-mono text-center px-1">
                                {isRtl ? 'لا غلاف' : 'No Cover'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {uploadProgress && (
                      <p className="mt-3 text-xs text-slate-400 font-mono italic">{uploadProgress}</p>
                    )}
                  </div>

                  {/* Form Submission actions */}
                  <div className={`flex gap-3 justify-end border-t border-slate-800 pt-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                      id="form-book-save-btn"
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ الكتاب ونشره' : 'Save and Publish E-Book')}</span>
                    </button>
                    <button
                      id="form-book-cancel-btn"
                      type="button"
                      onClick={resetBookForm}
                      className="rounded-lg border border-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>

                </form>
              )}

              {/* REGISTERED BOOKS DIRECTORY TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-brand-deep/30">
                <table className="w-full min-w-[600px] text-left text-sm text-slate-300">
                  <thead className="bg-brand-ink/50 text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr className={isRtl ? 'text-right flex-row-reverse' : ''}>
                      <th className="px-6 py-4">{isRtl ? 'غلاف ومسمى الكتاب' : 'Book Cover & Title'}</th>
                      <th className="px-6 py-4">{isRtl ? 'التصنيف' : 'Category'}</th>
                      <th className="px-6 py-4">{isRtl ? 'السنة' : 'Year'}</th>
                      <th className="px-6 py-4">{isRtl ? 'الصفحات' : 'Pages'}</th>
                      <th className="px-6 py-4">{isRtl ? 'التحميلات' : 'Downloads'}</th>
                      <th className="px-6 py-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-light">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-normal text-white">
                          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <div className="h-12 w-8 shrink-0 rounded bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                              {book.coverImage && book.coverImage.startsWith('data:') ? (
                                <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center" style={{ background: book.coverImage || '#1e293b' }}>
                                  <span className="text-[6px] text-white/80 font-mono">PDF</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-serif font-bold text-sm block">
                                {isRtl ? book.titleAr || book.titleEn : book.titleEn || book.titleAr}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {book.pdfFileName || 'Direct Stream / تدفق مباشر'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                          {isRtl ? book.categoryAr : book.categoryEn}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {book.publishYear}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {book.pages}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="rounded bg-brand-gold/10 px-2 py-1 font-bold font-mono text-brand-gold">
                            {book.downloadCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {deleteConfirmId === book.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`confirm-delete-btn-${book.id}`}
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="rounded bg-brand-crimson px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors cursor-pointer"
                                >
                                  {isRtl ? 'تأكيد الحذف' : 'Delete'}
                                </button>
                                <button
                                  id={`cancel-delete-btn-${book.id}`}
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="rounded border border-white/10 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  {isRtl ? 'إلغاء' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  id={`edit-book-btn-${book.id}`}
                                  onClick={() => startEditBook(book)}
                                  className="rounded bg-slate-800 hover:bg-slate-700 p-2 text-slate-300 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  id={`delete-book-btn-${book.id}`}
                                  onClick={() => setDeleteConfirmId(book.id)}
                                  className="rounded bg-brand-crimson/10 hover:bg-brand-crimson/30 p-2 text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {books.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-500 font-mono uppercase">
                          {isRtl ? 'لا توجد كتب مسجلة حالياً' : 'No books registered. Create your first masterpiece!'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB: MANAGE POSTS */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {/* Form trigger / Edit block */}
              {isEditingPost ? (
                <form onSubmit={handleSavePost} className="space-y-6 rounded-xl border border-slate-800 bg-brand-ink/40 p-6">
                  <div className={`flex justify-between items-center border-b border-slate-900 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {editingPostId ? (isRtl ? 'تعديل المنشور الحالي' : 'Edit Existing Post') : (isRtl ? 'إنشاء منشور جديد' : 'Publish New Post')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditingPostId(null);
                        setPostContentEn('');
                        setPostContentAr('');
                        setPostImage('');
                        setPostLikes(0);
                        setPostViews(0);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {postsError && (
                    <div className="rounded-sm bg-red-900/20 border border-red-900/40 p-4 text-xs text-red-400 font-mono">
                      {postsError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Content English */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">Post Content (English) *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Share your thoughts with the world..."
                        value={postContentEn}
                        onChange={(e) => setPostContentEn(e.target.value)}
                        className="w-full rounded-sm border border-slate-800 bg-brand-deep/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0"
                      />
                    </div>

                    {/* Content Arabic */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono text-right">محتوى المنشور (بالعربية) *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="شارك أفكارك وإلهامك الأدبي..."
                        value={postContentAr}
                        onChange={(e) => setPostContentAr(e.target.value)}
                        className="w-full rounded-sm border border-slate-800 bg-brand-deep/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Post Image Url / Upload */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">Post Image (URL or Upload)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={postImage}
                          onChange={(e) => setPostImage(e.target.value)}
                          className="flex-grow rounded-sm border border-slate-800 bg-brand-deep/50 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0"
                        />
                        <label className="rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 px-3 py-2 text-xs text-slate-300 font-bold cursor-pointer transition-colors flex items-center gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePostImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {postImage && (
                        <div className="mt-3 relative w-32 h-20 rounded border border-slate-800 overflow-hidden bg-black/20">
                          <img src={postImage} alt="Post Attachment Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPostImage('')}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Video Url / Upload */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">{isRtl ? 'فيديو المنشور (رابط أو رفع)' : 'Post Video (URL or Upload)'}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://example.com/video.mp4"
                          value={postVideo}
                          onChange={(e) => setPostVideo(e.target.value)}
                          className="flex-grow rounded-sm border border-slate-800 bg-brand-deep/50 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0"
                        />
                        <label className="rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 px-3 py-2 text-xs text-slate-300 font-bold cursor-pointer transition-colors flex items-center gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handlePostVideoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {postVideo && (
                        <div className="mt-3 relative w-32 h-20 rounded border border-slate-800 overflow-hidden bg-black/20 flex items-center justify-center">
                          <video src={postVideo} className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setPostVideo('')}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Likes setting (Can increase or decrease) */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">
                        {isRtl ? 'إعدادات الإعجابات وتفاعل القراء' : 'Like Count Adjustment (Interaction settings)'}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPostLikes(prev => Math.max(0, prev - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 text-slate-300 font-bold transition-all cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={postLikes}
                          onChange={(e) => setPostLikes(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-24 text-center rounded-sm border border-slate-800 bg-brand-deep/50 px-3 py-2 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPostLikes(prev => prev + 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 text-slate-300 font-bold transition-all cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 font-mono">
                        {isRtl ? 'يمكنك زيادة أو إنقاص عدد الإعجابات الحالية يدوياً.' : 'Adjust likes count up or down. Visitors can also like posts.'}
                      </p>
                    </div>

                    {/* Views setting (Can increase or decrease) */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-mono">
                        {isRtl ? 'زيادة عدد المشاهدات للفيديو والمنشورات' : 'View Count Adjustment (For videos & posts)'}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPostViews(prev => Math.max(0, prev - 10))}
                          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 text-slate-300 font-bold transition-all cursor-pointer"
                          title="-10 views"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={postViews}
                          onChange={(e) => setPostViews(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-24 text-center rounded-sm border border-slate-800 bg-brand-deep/50 px-3 py-2 text-xs text-white font-mono focus:border-brand-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setPostViews(prev => prev + 10)}
                          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 text-slate-300 font-bold transition-all cursor-pointer"
                          title="+10 views"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostViews(prev => prev + 100)}
                          className="h-9 px-3 text-xs font-bold rounded-sm border border-slate-800 bg-brand-deep hover:bg-slate-800 text-brand-gold transition-all cursor-pointer"
                          title="+100 views"
                        >
                          +100
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 font-mono">
                        {isRtl ? 'يمكنك زيادة أو إنقاص عدد المشاهدات للفيديو يدوياً.' : 'Increase or adjust video/post views. Auto-increments when watched.'}
                      </p>
                    </div>
                  </div>

                  {/* Gradual Interaction Delivery (Mimic Real Traffic) */}
                  {editingPostId && (
                    <div className="mt-6 border-t border-slate-900 pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-brand-gold animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                          {isRtl ? 'محاكاة الزيارات والوصول التدريجي للمنشور' : 'Gradual Traffic & Engagement Simulator'}
                        </h4>
                      </div>
                      
                      <p className="text-[11px] text-slate-400">
                        {isRtl
                          ? 'قم بجدولة وصول تدريجي يحاكي الزيارات الطبيعية. ستتم إضافة المشاهدات والإعجابات بشكل تدريجي وثابت طوال المدة المحددة بدلاً من إضافتها دفعة واحدة.'
                          : 'Schedule a gradual increase in metrics to mimic natural traffic patterns. Views and likes will be delivered steadily over your selected duration rather than appearing all at once.'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded border border-slate-800/60">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                            {isRtl ? 'المشاهدات المخططة لإضافتها' : 'Views to add gradually'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={scheduleViewsToAdd}
                            onChange={(e) => setScheduleViewsToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full rounded bg-brand-deep/80 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                            placeholder="e.g. 1000"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                            {isRtl ? 'الإعجابات المخططة لإضافتها' : 'Likes to add gradually'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={scheduleLikesToAdd}
                            onChange={(e) => setScheduleLikesToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full rounded bg-brand-deep/80 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                            placeholder="e.g. 300"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                            {isRtl ? 'مدة التسليم والتدفق' : 'Delivery Duration'}
                          </label>
                          <select
                            value={scheduleDurationMinutes}
                            onChange={(e) => setScheduleDurationMinutes(parseInt(e.target.value))}
                            className="w-full rounded bg-brand-deep/80 border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                          >
                            <option value={1}>{isRtl ? 'دقيقة واحدة (سريع)' : '1 Minute (Fast test)'}</option>
                            <option value={5}>{isRtl ? '5 دقائق' : '5 Minutes'}</option>
                            <option value={15}>{isRtl ? '15 دقيقة' : '15 Minutes'}</option>
                            <option value={30}>{isRtl ? '30 دقيقة' : '30 Minutes'}</option>
                            <option value={60}>{isRtl ? 'ساعة واحدة' : '1 Hour'}</option>
                            <option value={180}>{isRtl ? '3 ساعات' : '3 Hours'}</option>
                            <option value={360}>{isRtl ? '6 ساعات' : '6 Hours'}</option>
                            <option value={720}>{isRtl ? '12 ساعة' : '12 Hours'}</option>
                            <option value={1440}>{isRtl ? '24 ساعة (الأكثر واقعية)' : '24 Hours (Most Realistic)'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={isStartingSchedule || (scheduleViewsToAdd === 0 && scheduleLikesToAdd === 0)}
                          onClick={() => handleStartSchedule(editingPostId)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-black hover:bg-brand-gold/90 disabled:opacity-40 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                        >
                          {isStartingSchedule ? (isRtl ? 'جاري البدء...' : 'Starting...') : (isRtl ? 'بدء محاكاة التفاعل التدريجي 🚀' : 'Start Gradual delivery 🚀')}
                        </button>
                      </div>

                      {/* Existing/Active schedules for this specific post */}
                      {allSchedules.filter(s => s.postId === editingPostId).length > 0 && (
                        <div className="space-y-2 mt-4">
                          <h5 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            {isRtl ? 'جدولة التسليم النشطة لهذا المنشور' : 'Active deliveries for this post'}
                          </h5>
                          <div className="space-y-2">
                            {allSchedules.filter(s => s.postId === editingPostId).map((s) => {
                              const viewsPercent = s.targetViewsToAdd > 0 ? Math.min(100, Math.round((s.addedViews / s.targetViewsToAdd) * 100)) : 100;
                              const likesPercent = s.targetLikesToAdd > 0 ? Math.min(100, Math.round((s.addedLikes / s.targetLikesToAdd) * 100)) : 100;
                              
                              return (
                                <div key={s.id} className="bg-slate-950/60 border border-slate-800/85 p-3 rounded text-xs space-y-2">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-semibold text-slate-300">
                                      {isRtl ? 'تسليم تدريجي' : 'Gradual delivery'} ({s.durationMinutes}m)
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-gold/10 text-brand-gold animate-pulse'}`}>
                                        {s.completed ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'قيد التسليم' : 'In Progress')}
                                      </span>
                                      {!s.completed && (
                                        <button
                                          type="button"
                                          onClick={() => handleCancelSchedule(s.id)}
                                          className="text-red-400 hover:text-red-300 font-mono text-[10px] hover:underline cursor-pointer"
                                        >
                                          {isRtl ? 'إلغاء' : 'Cancel'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                                    {s.targetViewsToAdd > 0 && (
                                      <div>
                                        <div className="flex justify-between text-slate-400 mb-1">
                                          <span>{isRtl ? 'المشاهدات' : 'Views'}</span>
                                          <span>{s.addedViews} / {s.targetViewsToAdd} ({viewsPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-brand-gold h-full transition-all duration-500" style={{ width: `${viewsPercent}%` }} />
                                        </div>
                                      </div>
                                    )}
                                    {s.targetLikesToAdd > 0 && (
                                      <div>
                                        <div className="flex justify-between text-slate-400 mb-1">
                                          <span>{isRtl ? 'الإعجابات' : 'Likes'}</span>
                                          <span>{s.addedLikes} / {s.targetLikesToAdd} ({likesPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${likesPercent}%` }} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex gap-3 pt-4 border-t border-slate-900 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                      type="submit"
                      disabled={isSavingPost}
                      className="rounded-sm bg-brand-gold/20 border border-brand-gold/40 hover:bg-brand-gold hover:text-black px-6 py-2.5 text-xs font-bold text-brand-gold transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPost ? (isRtl ? 'جاري الحفظ...' : 'Saving Post...') : (isRtl ? 'نشر وحفظ المنشور ✓' : 'Publish & Save Post ✓')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditingPostId(null);
                        setPostContentEn('');
                        setPostContentAr('');
                        setPostImage('');
                        setPostLikes(0);
                        setPostViews(0);
                      }}
                      className="rounded-sm border border-slate-800 hover:bg-slate-800 px-6 py-2.5 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Top Bar with Add Button */}
                  <div className={`flex justify-between items-center bg-brand-ink/20 p-4 rounded-lg border border-slate-800/60 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">
                        {isRtl ? 'لوحة إدارة منشورات التواصل الاجتماعي' : 'Social Feed Management Hub'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isRtl ? 'أنشئ منشورات أدبية جديدة، عدل التفاعلات وتحكم في التعليقات والإعجابات.' : 'Publish novel excerpts, update stats, and manage social interactions.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPostContentEn('');
                        setPostContentAr('');
                        setPostImage('');
                        setPostLikes(0);
                        setPostViews(0);
                        setEditingPostId(null);
                        setIsEditingPost(true);
                      }}
                      className="rounded-sm bg-brand-gold/15 border border-brand-gold/30 hover:bg-brand-gold hover:text-black px-4 py-2.5 text-xs font-bold text-brand-gold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isRtl ? 'إضافة منشور جديد' : 'Write New Post'}</span>
                    </button>
                  </div>

                  {postsSuccess && (
                    <div className="rounded-sm bg-emerald-900/20 border border-emerald-900/40 p-4 text-xs text-emerald-400 font-mono">
                      {postsSuccess}
                    </div>
                  )}

                  {/* List of Posts */}
                  <div className="space-y-4">
                    {adminPosts.length === 0 ? (
                      <div className="text-center py-20 rounded-xl border border-dashed border-slate-800 bg-brand-ink/20">
                        <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-mono uppercase">
                          {isRtl ? 'لا توجد منشورات حالياً' : 'No posts published yet'}
                        </p>
                      </div>
                    ) : (
                      adminPosts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-lg border border-slate-800/80 bg-brand-ink/30 p-5 flex flex-col md:flex-row gap-4 justify-between items-start"
                        >
                          <div className="space-y-2 flex-1 min-w-0 w-full">
                            <p className="text-[10px] text-brand-gold font-mono uppercase tracking-wider">
                              {formatAdminDate(post.createdAt)}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="text-xs text-slate-300 bg-black/10 p-3 rounded border border-slate-800/50">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">English Preview</span>
                                <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap">{post.contentEn || 'No content'}</p>
                              </div>
                              <div className="text-xs text-slate-300 bg-black/10 p-3 rounded border border-slate-800/50 text-right">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-1">المعاينة العربية</span>
                                <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap">{post.contentAr || 'لا يوجد محتوى'}</p>
                              </div>
                            </div>

                            {post.image && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-slate-500 font-mono uppercase">Image:</span>
                                <span className="text-[10px] text-brand-gold truncate max-w-xs block">{post.image.startsWith('data:') ? 'Base64 Encoded Image' : post.image}</span>
                              </div>
                            )}

                            {post.video && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-slate-500 font-mono uppercase">Video:</span>
                                <span className="text-[10px] text-brand-gold truncate max-w-xs block">{post.video.startsWith('data:') ? 'Base64 Encoded Video' : post.video}</span>
                              </div>
                            )}

                            <div className={`flex items-center gap-4 text-[11px] text-slate-400 pt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <span className="flex items-center gap-1 font-mono">
                                <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
                                <motion.strong
                                  key={`admin-likes-${post.likes}`}
                                  initial={{ scale: 1.3, color: '#3b82f6' }}
                                  animate={{ scale: 1, color: 'inherit' }}
                                  transition={{ duration: 0.4 }}
                                  className="inline-block font-bold"
                                >
                                  {post.likes || 0}
                                </motion.strong> {isRtl ? 'إعجاب' : 'likes'}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                <motion.strong
                                  key={`admin-views-${post.views}`}
                                  initial={{ scale: 1.3, color: '#eab308' }}
                                  animate={{ scale: 1, color: 'inherit' }}
                                  transition={{ duration: 0.4 }}
                                  className="inline-block font-bold"
                                >
                                  {post.views || 0}
                                </motion.strong> {isRtl ? 'مشاهدة' : 'views'}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <MessageSquare className="h-3.5 w-3.5 text-brand-gold" />
                                <strong>{(post.comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}</strong> {isRtl ? 'تعليق ورد' : 'comments & replies'}
                              </span>
                            </div>
                          </div>

                          {/* Post Action Actions */}
                          <div className="flex md:flex-col gap-2 shrink-0 self-stretch justify-end md:justify-start">
                            <button
                              type="button"
                              onClick={() => handleEditPostStart(post)}
                              className="rounded bg-brand-gold/10 border border-brand-gold/20 hover:bg-brand-gold hover:text-black p-2.5 text-xs text-brand-gold transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold shrink-0"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="md:hidden">Edit</span>
                            </button>

                            {postDeleteConfirmId === post.id ? (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="rounded bg-red-600 text-white p-2 text-xs font-bold hover:bg-red-700 cursor-pointer"
                                >
                                  {isRtl ? 'نعم' : 'Yes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPostDeleteConfirmId(null)}
                                  className="rounded bg-slate-800 text-slate-300 p-2 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                                >
                                  {isRtl ? 'لا' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPostDeleteConfirmId(post.id)}
                                className="rounded bg-brand-crimson/15 border border-brand-crimson/30 hover:bg-brand-crimson/40 p-2.5 text-xs text-red-400 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="md:hidden">Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT BIOGRAPHY PORTAL */}
          {activeTab === 'bio' && (
            <form onSubmit={handleSaveBio} className="space-y-6 rounded-xl border border-slate-800 bg-brand-ink/40 p-6">
              
              <div className={`flex justify-between items-center border-b border-slate-900 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-serif text-lg font-bold text-white">
                  {isRtl ? 'الملف الشخصي الأدبي للكاتبة' : 'Author Profile Customization'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isRtl ? 'د. سارة المنصوري' : 'Dr. Sarah Al-Mansoori'}
                </p>
              </div>

              {/* Author Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono">Author Name (English) *</label>
                  <input
                    id="bio-name-en"
                    type="text"
                    value={authNameEn}
                    onChange={(e) => setAuthNameEn(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                    required
                  />
                </div>
                <div className="text-right">
                  <label className="block text-xs text-slate-400 mb-2 font-mono">اسم الكاتب (العربية) *</label>
                  <input
                    id="bio-name-ar"
                    type="text"
                    value={authNameAr}
                    onChange={(e) => setAuthNameAr(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Author Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono">Professional Subtitle (English)</label>
                  <input
                    id="bio-title-en"
                    type="text"
                    value={authTitleEn}
                    onChange={(e) => setAuthTitleEn(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="text-right">
                  <label className="block text-xs text-slate-400 mb-2 font-mono">اللقب الأدبي أو المهني (العربية)</label>
                  <input
                    id="bio-title-ar"
                    type="text"
                    value={authTitleAr}
                    onChange={(e) => setAuthTitleAr(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Author Media Library & Slideshow Settings */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className={`text-sm font-semibold text-brand-gold mb-2 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'مكتبة وسائط الكاتب وإعدادات العرض المتعدد' : 'Author Media Library & Slideshow Settings'}
                </h4>
                <p className={`text-xs text-slate-500 mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl 
                    ? 'قم بإدارة الصور المتعددة لعرضها في سيرة الكاتب، وضبط الفلاتر وتأثيرات التباين، وإضافة مقطع فيديو تعريفي.' 
                    : "Manage multiple biography images, apply image contrast/filter settings, and add an introductory video."}
                </p>

                {/* Grid for multiple image uploads & URLs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-lg border border-slate-800 mb-6">
                  {/* Image Picker */}
                  <div>
                    <label className={`block text-xs text-slate-400 mb-2 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? 'تحميل صور إضافية للسلسلة المتتابعة' : 'Upload Biography Images'}
                    </label>
                    <input
                      id="bio-avatars-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAuthorAvatarsUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('bio-avatars-upload-input')?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20 hover:bg-brand-gold/20 text-brand-gold text-xs px-4 py-3 transition-all cursor-pointer"
                    >
                      {isRtl ? 'اختر ملفات الصور (يمكنك اختيار متعدد)' : 'Choose Image Files (Multiple Supported)'}
                    </button>

                    <div className="mt-4">
                      <label className={`block text-xs text-slate-400 mb-2 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                        {isRtl ? 'إضافة صورة من رابط مباشر (URL)' : 'Add Image from URL'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="new-avatar-url-input"
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={newAvatarUrlInput}
                          onChange={(e) => setNewAvatarUrlInput(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-800 bg-brand-deep px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newAvatarUrlInput.trim()) {
                              handleAddAvatarUrl(newAvatarUrlInput);
                              setNewAvatarUrlInput('');
                            }
                          }}
                          className="rounded bg-brand-gold hover:bg-brand-gold-light text-black font-semibold text-xs px-4 py-2 transition-all cursor-pointer"
                        >
                          {isRtl ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Gallery & Order controls */}
                  <div className="flex flex-col">
                    <label className={`block text-xs text-slate-400 mb-2 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? 'ترتيب صور السيرة الذاتية الحالية' : 'Current Biography Images & Order'}
                    </label>

                    {authAvatars.length === 0 && !authAvatar ? (
                      <div className="flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded bg-brand-deep/30 p-6">
                        <p className="text-xs text-slate-600 italic">
                          {isRtl ? 'لا توجد صور مضافة بعد' : 'No images added yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-slate-800/60 p-2 rounded bg-brand-deep/40">
                        {/* Fallback avatar single for legacy compatibility if no multiple avatars are defined */}
                        {authAvatars.length === 0 && authAvatar && (
                          <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded border border-slate-800">
                            <img src={authAvatar} alt="avatar" className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1">
                              <span className="text-[10px] text-slate-400 font-mono">Primary Legacy Image</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthAvatars([authAvatar]);
                                setAuthAvatar('');
                              }}
                              className="text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-1 rounded"
                            >
                              Migrate to Library
                            </button>
                          </div>
                        )}

                        {authAvatars.map((url, index) => (
                          <div key={index} className="flex items-center gap-3 bg-slate-950/80 p-2 rounded border border-slate-800/80 hover:border-brand-gold/20 transition-all">
                            <img src={url} alt={`author-${index}`} className="w-10 h-10 object-cover rounded bg-[#0d0d0d]" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-slate-400 truncate font-mono">Image #{index + 1}</p>
                              <p className="text-[9px] text-slate-600 truncate font-mono max-w-[150px]">{url.startsWith('data:') ? 'Base64 Encoded Image' : url}</p>
                            </div>
                            
                            {/* Reordering Controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveAvatar(index, 'left')}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-brand-gold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move Up/Left"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                disabled={index === authAvatars.length - 1}
                                onClick={() => handleMoveAvatar(index, 'right')}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-brand-gold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move Down/Right"
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAvatar(index)}
                                className="p-1 rounded bg-brand-crimson/10 hover:bg-brand-crimson/20 text-brand-crimson transition-colors cursor-pointer"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Slideshow Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/20 p-5 rounded-lg border border-slate-800/80 mb-6">
                  <div>
                    <label className={`flex items-center gap-2 text-xs text-slate-400 font-mono mb-2 cursor-pointer ${isRtl ? 'justify-end' : 'justify-start'}`}>
                      <input
                        id="bio-show-slideshow"
                        type="checkbox"
                        checked={authShowSlideshow}
                        onChange={(e) => setAuthShowSlideshow(e.target.checked)}
                        className="rounded border-slate-800 bg-brand-deep text-brand-gold focus:ring-brand-gold"
                      />
                      <span>{isRtl ? 'تمكين العرض التلقائي للصور' : 'Enable Automatic Slideshow'}</span>
                    </label>
                    <p className={`text-[11px] text-slate-500 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? 'إذا تم تحديده، ستتبدل صور السيرة الذاتية تلقائيًا.' : 'If enabled, the biography images will transition automatically.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400 font-mono">{isRtl ? 'سرعة تبديل الصور (بالثواني)' : 'Slideshow Speed (seconds)'}</label>
                      <span className="text-xs font-mono text-brand-gold">{authSlideshowSpeed}s</span>
                    </div>
                    <input
                      id="bio-slideshow-speed"
                      type="range"
                      min={2}
                      max={12}
                      step={1}
                      value={authSlideshowSpeed}
                      onChange={(e) => setAuthSlideshowSpeed(parseInt(e.target.value))}
                      className="w-full accent-brand-gold"
                    />
                  </div>
                </div>

                {/* PROFESSIONAL IMAGE ADJUSTMENTS */}
                <div className="bg-slate-900/30 p-5 rounded-lg border border-slate-800 mb-6">
                  <h5 className={`text-xs font-semibold text-slate-300 mb-4 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? 'تعديل جودة وتأثيرات صورة الكاتب (ضبط الفلاتر الاحترافي)' : 'Professional Image Filter Adjustments (Aesthetic Contrast/Brightness)'}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contrast slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-mono">{isRtl ? 'درجة التباين (Contrast)' : 'Contrast Level'}</label>
                        <span className="text-xs font-mono text-brand-gold">{authImageContrast}%</span>
                      </div>
                      <input
                        id="bio-image-contrast"
                        type="range"
                        min={50}
                        max={180}
                        step={5}
                        value={authImageContrast}
                        onChange={(e) => setAuthImageContrast(parseInt(e.target.value))}
                        className="w-full accent-brand-gold"
                      />
                    </div>

                    {/* Brightness slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-mono">{isRtl ? 'درجة السطوع (Brightness)' : 'Brightness Level'}</label>
                        <span className="text-xs font-mono text-brand-gold">{authImageBrightness}%</span>
                      </div>
                      <input
                        id="bio-image-brightness"
                        type="range"
                        min={50}
                        max={150}
                        step={5}
                        value={authImageBrightness}
                        onChange={(e) => setAuthImageBrightness(parseInt(e.target.value))}
                        className="w-full accent-brand-gold"
                      />
                    </div>

                    {/* Opacity slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-mono">{isRtl ? 'الشفافية (Opacity)' : 'Opacity Level'}</label>
                        <span className="text-xs font-mono text-brand-gold">{authImageOpacity}%</span>
                      </div>
                      <input
                        id="bio-image-opacity"
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={authImageOpacity}
                        onChange={(e) => setAuthImageOpacity(parseInt(e.target.value))}
                        className="w-full accent-brand-gold"
                      />
                    </div>

                    {/* Blur slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400 font-mono">{isRtl ? 'درجة الغباشة (Blur)' : 'Blur Radius'}</label>
                        <span className="text-xs font-mono text-brand-gold">{authImageBlur}px</span>
                      </div>
                      <input
                        id="bio-image-blur"
                        type="range"
                        min={0}
                        max={15}
                        step={1}
                        value={authImageBlur}
                        onChange={(e) => setAuthImageBlur(parseInt(e.target.value))}
                        className="w-full accent-brand-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Greeting Configuration */}
                <div className="bg-slate-900/40 p-5 rounded-lg border border-slate-800 mb-6">
                  <h5 className={`text-xs font-semibold text-brand-gold mb-2 font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? 'عرض الفيديو التعريفي للكاتب' : 'Author Video Greeting Setup'}
                  </h5>
                  <p className={`text-xs text-slate-500 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl 
                      ? 'يمكنك إضافة رابط فيديو (رابط مباشر أو رابط يوتيوب/فيميو) ليتم عرضه بجانب معرض الصور.' 
                      : 'Provide a video URL (Direct file URL, YouTube video URL, or Vimeo video URL) to display alongside slideshow.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-8">
                      <label className="block text-xs text-slate-400 mb-2 font-mono">{isRtl ? 'رابط الفيديو (URL)' : 'Video URL'}</label>
                      <input
                        id="bio-video-url-input"
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={authVideoUrl}
                        onChange={(e) => setAuthVideoUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <input
                        id="bio-video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('bio-video-upload')?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 px-4 py-2.5 transition-all cursor-pointer"
                      >
                        {isRtl ? 'تحميل ملف فيديو' : 'Upload Video File'}
                      </button>
                    </div>
                  </div>

                  {authVideoUrl && (
                    <div className="mt-4 flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-brand-gold font-mono truncate max-w-[70%]">{authVideoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setAuthVideoUrl('')}
                        className="rounded bg-brand-crimson/10 border border-brand-crimson/20 hover:bg-brand-crimson/20 text-brand-crimson text-[10px] px-3 py-1.5 transition-all cursor-pointer"
                      >
                        {isRtl ? 'إزالة الفيديو' : 'Remove Video'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Bios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono">Full Biography (English) *</label>
                  <textarea
                    id="bio-text-en"
                    value={authBioEn}
                    onChange={(e) => setAuthBioEn(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none leading-relaxed"
                    required
                  />
                </div>
                <div className="text-right">
                  <label className="block text-xs text-slate-400 mb-2 font-mono">السيرة الأدبية الكاملة (العربية) *</label>
                  <textarea
                    id="bio-text-ar"
                    value={authBioAr}
                    onChange={(e) => setAuthBioAr(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Literary Quotes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono">Signature Philosophical Quote (English)</label>
                  <textarea
                    id="bio-quote-en"
                    value={authQuoteEn}
                    onChange={(e) => setAuthQuoteEn(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div className="text-right">
                  <label className="block text-xs text-slate-400 mb-2 font-mono">الاقتباس أو الحكمة الشخصية (العربية)</label>
                  <textarea
                    id="bio-quote-ar"
                    value={authQuoteAr}
                    onChange={(e) => setAuthQuoteAr(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-800 bg-brand-deep px-4 py-3 text-sm text-white text-right focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Social links */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="font-serif text-sm font-semibold text-brand-gold mb-4">
                  {isRtl ? 'روابط التواصل الاجتماعي ومنافذ الاتصال' : 'Communication Channels & Networks'}
                </h4>

                <div className={`mb-4 flex items-center justify-between gap-4 bg-slate-900/40 p-3 rounded border border-slate-800 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label htmlFor="toggle-show-socials" className="block text-xs font-semibold text-slate-300 cursor-pointer">
                      {isRtl ? 'عرض قنوات التواصل الاجتماعي' : 'Display Social Media Channels'}
                    </label>
                    <span className="text-[10px] text-slate-500 block">
                      {isRtl 
                        ? 'تفعيل أو تعطيل ظهور أيقونات التواصل الاجتماعي في سيرة الكاتب الذاتية.' 
                        : 'Enable or disable showing the social icons inside the biography on the main page.'}
                    </span>
                  </div>
                  <input
                    id="toggle-show-socials"
                    type="checkbox"
                    checked={showSocialLinks}
                    onChange={(e) => setShowSocialLinks(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-gold accent-brand-gold focus:ring-brand-gold focus:ring-opacity-50 cursor-pointer shrink-0"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Twitter / X URL</label>
                    <input
                      id="bio-twitter"
                      type="url"
                      value={twitterLink}
                      onChange={(e) => setTwitterLink(e.target.value)}
                      className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Instagram URL</label>
                    <input
                      id="bio-instagram"
                      type="url"
                      value={instagramLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInstagramLink(val);
                        setCfInstagramValue(val);
                      }}
                      className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Facebook URL</label>
                    <input
                      id="bio-facebook"
                      type="url"
                      value={facebookLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFacebookLink(val);
                        setCfFacebookValue(val);
                      }}
                      className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Public Email Address</label>
                    <input
                      id="bio-email"
                      type="email"
                      value={emailLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmailLink(val);
                        setCfEmailValue(val);
                      }}
                      className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* CONTACT THE AUTHOR FEATURE SETTINGS CARD */}
              {!cfHideFromControlPanel ? (
                <div className="mt-8 border-t border-slate-800 pt-8 text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-gold font-mono flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{isRtl ? 'إعدادات ميزة "اتصل بالكاتب"' : '"Contact the Author" Settings'}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isRtl 
                          ? 'قم بتفعيل وتعديل معلومات التواصل المباشر مع زوار موقعك في الصفحة الرئيسية.' 
                          : 'Configure and enable the direct contact details widget for visitors on your public page.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Enable Feature Switch */}
                      <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
                        <input
                          id="cf-enable-visitor-feature"
                          type="checkbox"
                          checked={cfEnableFeature}
                          onChange={(e) => setCfEnableFeature(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-gold accent-brand-gold focus:ring-brand-gold focus:ring-opacity-50 cursor-pointer"
                        />
                        <span>{isRtl ? 'تفعيل الميزة' : 'Enable Feature'}</span>
                      </label>

                      {/* Show In Header Checkbox */}
                      <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
                        <input
                          id="cf-show-in-header"
                          type="checkbox"
                          checked={cfShowInHeader}
                          onChange={(e) => setCfShowInHeader(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-gold accent-brand-gold focus:ring-brand-gold focus:ring-opacity-50 cursor-pointer"
                        />
                        <span>{isRtl ? 'إظهار في الرأس' : 'Show in Header'}</span>
                      </label>

                      {/* Show In Hero Checkbox */}
                      <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
                        <input
                          id="cf-show-in-hero"
                          type="checkbox"
                          checked={cfShowInHero}
                          onChange={(e) => setCfShowInHero(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-gold accent-brand-gold focus:ring-brand-gold focus:ring-opacity-50 cursor-pointer"
                        />
                        <span>{isRtl ? 'إظهار في الهيرو' : 'Show in Hero'}</span>
                      </label>

                      {/* Hide from Control Panel Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setCfHideFromControlPanel(true);
                        }}
                        className="rounded bg-rose-600/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono px-2.5 py-1.5 transition-all cursor-pointer"
                      >
                        {isRtl ? 'إخفاء الإعدادات بالكامل' : 'Hide from Control Panel'}
                      </button>
                    </div>
                  </div>

                  {cfEnableFeature && (
                    <div className="space-y-4 bg-slate-900/30 p-5 rounded-lg border border-slate-800/80">
                      {/* Bilingual Titles & Accompanying Texts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cf-title-en" className="block text-xs text-slate-400 mb-1.5 font-mono">{isRtl ? 'عنوان القسم (إنجليزي)' : 'Section Title (English)'}</label>
                          <input
                            id="cf-title-en"
                            type="text"
                            value={cfTitleEn}
                            onChange={(e) => setCfTitleEn(e.target.value)}
                            className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="cf-title-ar" className="block text-xs text-slate-400 mb-1.5 font-mono">{isRtl ? 'عنوان القسم (عربي)' : 'Section Title (Arabic)'}</label>
                          <input
                            id="cf-title-ar"
                            type="text"
                            value={cfTitleAr}
                            onChange={(e) => setCfTitleAr(e.target.value)}
                            className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cf-desc-en" className="block text-xs text-slate-400 mb-1.5 font-mono">{isRtl ? 'النص المرافق (إنجليزي)' : 'Accompanying Text (English)'}</label>
                          <textarea
                            id="cf-desc-en"
                            value={cfDescriptionEn}
                            onChange={(e) => setCfDescriptionEn(e.target.value)}
                            rows={2}
                            className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="cf-desc-ar" className="block text-xs text-slate-400 mb-1.5 font-mono">{isRtl ? 'النص المرافق (عربي)' : 'Accompanying Text (Arabic)'}</label>
                          <textarea
                            id="cf-desc-ar"
                            value={cfDescriptionAr}
                            onChange={(e) => setCfDescriptionAr(e.target.value)}
                            rows={2}
                            className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Modal Box Size Control */}
                      <div className="pt-2">
                        <label className="block text-xs text-slate-400 mb-1.5 font-mono">{isRtl ? 'حجم نافذة الاتصال' : 'Contact Box Modal Size'}</label>
                        <div className="grid grid-cols-5 gap-2">
                          {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setCfBoxSize(size)}
                              className={`rounded py-2 px-1.5 text-xs font-mono font-bold transition-all cursor-pointer text-center border ${
                                cfBoxSize === size
                                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold font-bold'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {size.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {isRtl ? 'التحكم في عرض النافذة المنبثقة للتواصل مع الكاتب.' : 'Controls the maximum width of the Contact the Author pop-up modal.'}
                        </p>
                      </div>

                      {/* Contact Methods Toggle and Value Inputs */}
                      <h5 className="text-[11px] font-semibold text-slate-300 font-mono border-b border-slate-850 pb-2 mt-4 uppercase tracking-wider">
                        {isRtl ? 'خيارات وقنوات الاتصال الفردية' : 'Individual Contact Methods & Values'}
                      </h5>

                      <div className="space-y-3 pt-2">
                        {/* Phone */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded border border-slate-850">
                          <div className="flex items-center gap-3 w-44 shrink-0">
                            <input
                              type="checkbox"
                              id="cf-phone-visible"
                              checked={cfPhoneVisible}
                              onChange={(e) => setCfPhoneVisible(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                            />
                            <label htmlFor="cf-phone-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                              <span>{isRtl ? 'رقم الهاتف' : 'Phone Number'}</span>
                            </label>
                          </div>
                          <input
                            id="cf-phone-val"
                            type="text"
                            placeholder="+1 (555) 019-2834"
                            value={cfPhoneValue}
                            onChange={(e) => setCfPhoneValue(e.target.value)}
                            disabled={!cfPhoneVisible}
                            className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                          />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded border border-slate-850">
                          <div className="flex items-center gap-3 w-44 shrink-0">
                            <input
                              type="checkbox"
                              id="cf-email-visible"
                              checked={cfEmailVisible}
                              onChange={(e) => setCfEmailVisible(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                            />
                            <label htmlFor="cf-email-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                              <span>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</span>
                            </label>
                          </div>
                          <input
                            id="cf-email-val"
                            type="email"
                            placeholder="author@example.com"
                            value={cfEmailValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCfEmailValue(val);
                              setEmailLink(val);
                            }}
                            disabled={!cfEmailVisible}
                            className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                          />
                        </div>

                        {/* Instagram */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded border border-slate-850">
                          <div className="flex items-center gap-3 w-44 shrink-0">
                            <input
                              type="checkbox"
                              id="cf-instagram-visible"
                              checked={cfInstagramVisible}
                              onChange={(e) => setCfInstagramVisible(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                            />
                            <label htmlFor="cf-instagram-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-pink-500 inline-block" />
                              <span>Instagram</span>
                            </label>
                          </div>
                          <input
                            id="cf-instagram-val"
                            type="url"
                            placeholder="https://instagram.com/username"
                            value={cfInstagramValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCfInstagramValue(val);
                              setInstagramLink(val);
                            }}
                            disabled={!cfInstagramVisible}
                            className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                          />
                        </div>

                        {/* Facebook */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded border border-slate-850">
                          <div className="flex items-center gap-3 w-44 shrink-0">
                            <input
                              type="checkbox"
                              id="cf-facebook-visible"
                              checked={cfFacebookVisible}
                              onChange={(e) => setCfFacebookVisible(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                            />
                            <label htmlFor="cf-facebook-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                              <span>Facebook</span>
                            </label>
                          </div>
                          <input
                            id="cf-facebook-val"
                            type="url"
                            placeholder="https://facebook.com/username"
                            value={cfFacebookValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCfFacebookValue(val);
                              setFacebookLink(val);
                            }}
                            disabled={!cfFacebookVisible}
                            className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                          />
                        </div>

                        {/* TikTok */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded border border-slate-850">
                          <div className="flex items-center gap-3 w-44 shrink-0">
                            <input
                              type="checkbox"
                              id="cf-tiktok-visible"
                              checked={cfTiktokVisible}
                              onChange={(e) => setCfTiktokVisible(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                            />
                            <label htmlFor="cf-tiktok-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
                              <span>TikTok</span>
                            </label>
                          </div>
                          <input
                            id="cf-tiktok-val"
                            type="url"
                            placeholder="https://tiktok.com/@username"
                            value={cfTiktokValue}
                            onChange={(e) => setCfTiktokValue(e.target.value)}
                            disabled={!cfTiktokVisible}
                            className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                          />
                        </div>

                        {/* Other Platform */}
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-850 space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-44 shrink-0">
                              <input
                                type="checkbox"
                                id="cf-other-visible"
                                checked={cfOtherVisible}
                                onChange={(e) => setCfOtherVisible(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-gold accent-brand-gold cursor-pointer"
                              />
                              <label htmlFor="cf-other-visible" className="text-xs text-slate-300 font-mono cursor-pointer flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                                <span>{isRtl ? 'منصة أخرى' : 'Other Platform'}</span>
                              </label>
                            </div>
                            <input
                              id="cf-other-val"
                              type="url"
                              placeholder="https://linkedin.com/in/username"
                              value={cfOtherValue}
                              onChange={(e) => setCfOtherValue(e.target.value)}
                              disabled={!cfOtherVisible}
                              className="flex-1 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white disabled:opacity-40 focus:border-brand-gold focus:outline-none"
                            />
                          </div>
                          
                          {cfOtherVisible && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 pr-7">
                              <div>
                                <label htmlFor="cf-other-label-en" className="block text-[10px] text-slate-500 mb-1 font-mono">{isRtl ? 'اسم المنصة البديلة (إنجليزي)' : 'Other Platform Label (English)'}</label>
                                <input
                                  id="cf-other-label-en"
                                  type="text"
                                  placeholder="LinkedIn"
                                  value={cfOtherLabelEn}
                                  onChange={(e) => setCfOtherLabelEn(e.target.value)}
                                  className="w-full rounded bg-brand-deep/80 border border-slate-800/80 px-2 py-1 text-xs text-white focus:border-brand-gold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label htmlFor="cf-other-label-ar" className="block text-[10px] text-slate-500 mb-1 font-mono">{isRtl ? 'اسم المنصة البديلة (عربي)' : 'Other Platform Label (Arabic)'}</label>
                                <input
                                  id="cf-other-label-ar"
                                  type="text"
                                  placeholder="لينكد إن"
                                  value={cfOtherLabelAr}
                                  onChange={(e) => setCfOtherLabelAr(e.target.value)}
                                  className="w-full rounded bg-brand-deep/80 border border-slate-800/80 px-2 py-1 text-xs text-white focus:border-brand-gold focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Custom Platforms */}
                      <div className="border-t border-slate-800/80 pt-4 mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider">
                            {isRtl ? 'قنوات ومنصات تواصل إضافية (غير محدودة)' : 'Additional Social Platforms (Unlimited)'}
                          </h5>
                          <button
                            type="button"
                            onClick={handleAddCustomPlatform}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-gold text-black hover:bg-brand-gold/80 text-[10px] font-bold uppercase transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{isRtl ? 'إضافة منصة' : 'Add Platform'}</span>
                          </button>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 mb-4">
                          {isRtl 
                            ? 'أضف أي عدد من منصات التواصل الاجتماعي والروابط المخصصة مع أيقونة مناسبة.' 
                            : 'Add any number of custom social media platforms, links, or contact channels with matching logos.'}
                        </p>

                        <div className="space-y-3">
                          {cfCustomPlatforms.map((plat) => (
                            <div key={plat.id} className="bg-slate-950/45 p-4 rounded border border-slate-800/60 space-y-3 relative">
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomPlatform(plat.id)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900/50 transition-all cursor-pointer"
                                title={isRtl ? 'حذف' : 'Remove'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              {/* Row 1: Platform selector & Visibility */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                                    {isRtl ? 'اختر المنصة / الشعار' : 'Choose Platform / Logo'}
                                  </label>
                                  <select
                                    value={plat.platform}
                                    onChange={(e) => handleUpdateCustomPlatform(plat.id, 'platform', e.target.value)}
                                    className="w-full rounded bg-brand-deep border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                                  >
                                    <option value="facebook">Facebook / فيسبوك</option>
                                    <option value="instagram">Instagram / إنستغرام</option>
                                    <option value="threads">Threads / ثريدز</option>
                                    <option value="tiktok">TikTok / تيك توك</option>
                                    <option value="youtube">YouTube / يوتيوب</option>
                                    <option value="twitter">X (Twitter) / إكس</option>
                                    <option value="linkedin">LinkedIn / لينكد إن</option>
                                    <option value="pinterest">Pinterest / بينتيريست</option>
                                    <option value="snapchat">Snapchat / سناب شات</option>
                                    <option value="whatsapp">WhatsApp / واتساب</option>
                                    <option value="telegram">Telegram / تليغرام</option>
                                    <option value="discord">Discord / ديسكورد</option>
                                    <option value="reddit">Reddit / ريديت</option>
                                    <option value="twitch">Twitch / تويتش</option>
                                    <option value="github">GitHub / جيتهاب</option>
                                    <option value="phone">Phone / هاتف</option>
                                    <option value="email">Email / بريد إلكتروني</option>
                                    <option value="website">Website / موقع إلكتروني</option>
                                    <option value="custom">Custom / عنوان مخصص</option>
                                  </select>
                                </div>

                                <div className="flex items-end pb-1.5">
                                  <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={plat.visible}
                                      onChange={(e) => handleUpdateCustomPlatform(plat.id, 'visible', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-brand-gold accent-brand-gold cursor-pointer"
                                    />
                                    <span>{isRtl ? 'إظهار هذه المنصة' : 'Show this platform'}</span>
                                  </label>
                                </div>
                              </div>

                              {/* Row 2: Value link */}
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                                  {isRtl ? 'الرابط أو القيمة' : 'Link URL or Value'}
                                </label>
                                <input
                                  type="text"
                                  placeholder={
                                    plat.platform === 'email' ? 'example@mail.com' :
                                    plat.platform === 'phone' ? '+1 (555) 019-2834' :
                                    'https://...'
                                  }
                                  value={plat.value}
                                  onChange={(e) => handleUpdateCustomPlatform(plat.id, 'value', e.target.value)}
                                  className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                                />
                              </div>

                              {/* Row 3: Custom labels (visible if 'custom' is selected) */}
                              {plat.platform === 'custom' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                                      {isRtl ? 'اسم المنصة المخصصة (EN)' : 'Custom Platform Name (EN)'}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Goodreads"
                                      value={plat.labelEn || ''}
                                      onChange={(e) => handleUpdateCustomPlatform(plat.id, 'labelEn', e.target.value)}
                                      className="w-full rounded bg-brand-deep/80 border border-slate-800/80 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">
                                      {isRtl ? 'اسم المنصة المخصصة (AR)' : 'Custom Platform Name (AR)'}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="مثلاً: جود ريدز"
                                      value={plat.labelAr || ''}
                                      onChange={(e) => handleUpdateCustomPlatform(plat.id, 'labelAr', e.target.value)}
                                      className="w-full rounded bg-brand-deep/80 border border-slate-800/80 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {cfCustomPlatforms.length === 0 && (
                            <div className="text-center py-6 border border-dashed border-slate-800 rounded bg-slate-950/20">
                              <p className="text-[11px] text-slate-500">
                                {isRtl ? 'لم يتم إضافة قنوات تواصل إضافية بعد.' : 'No additional contact channels added yet.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 border border-dashed border-slate-800 p-5 rounded text-center bg-slate-950/20">
                  <p className="text-xs text-slate-500">
                    {isRtl 
                      ? 'لقد قمت بإخفاء قسم إعدادات ميزة "اتصل بالكاتب" بالكامل من لوحة التحكم هذه.' 
                      : 'You have completely hidden the "Contact the Author" config module from this editing panel.'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => setCfHideFromControlPanel(false)}
                      className="text-brand-gold hover:underline font-bold font-mono cursor-pointer bg-transparent border-0 inline-block p-0 outline-none"
                    >
                      [{isRtl ? 'اضغط هنا لاستعادة عرضه وإظهاره' : 'Click here to restore and display it'}]
                    </button>
                  </p>
                </div>
              )}

              {/* Submits */}
              <div className={`flex gap-3 justify-end border-t border-slate-800 pt-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  id="bio-save-btn"
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ السيرة الذاتية' : 'Save Biography Info')}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: SYSTEM INSIGHTS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Core database metrics */}
              <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'نشر المؤلفات' : 'E-Book Inventory'}</span>
                    <BookOpen className="h-4 w-4 text-brand-gold" />
                  </div>
                  <p className="mt-4 text-4xl font-serif font-bold text-white">{books.length}</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-6 font-mono">
                  {isRtl ? 'إجمالي الملفات المفهرسة في النظام' : 'Total books saved in standard json registry.'}
                </p>
              </div>

              {/* Box 2: Total downloads */}
              <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'إجمالي التحميلات' : 'Total Direct Downloads'}</span>
                    <BarChart2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-4 text-4xl font-serif font-bold text-white">{totalDownloads}</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-6 font-mono">
                  {isRtl ? 'تنزيلات مباشرة ناجحة خالية من النوافذ المنبثقة' : 'Forced-attachment immediate downloads executed.'}
                </p>
              </div>

              {/* Box 3: Server Health Status */}
              <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'حالة السيرفر والبيانات' : 'Database & Server Status'}</span>
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-400 font-mono">SECURELY ONLINE</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-6 font-mono">
                  <p>Database: db.json</p>
                  <p>Server: Port 3000 (Active)</p>
                </div>
              </div>

              {/* Full System Details Block */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-brand-ink/40 p-6 text-xs text-slate-400 leading-relaxed font-mono space-y-2">
                <p className="font-bold text-brand-gold font-serif mb-2">{isRtl ? 'خصائص البنية التحتية للموقع' : 'Infrastructure & Security Configuration Details'}</p>
                <p>• Architecture: Express Full-Stack + Vite (Single-Process Routing)</p>
                <p>• Data Compression: Base64 UTF-8 Encoded streams with direct content-disposition bindings.</p>
                <p>• Ingress Port: 3000 (Reverse Proxied via Nginx on Cloud Run containers)</p>
                <p>• Anti-flicker measures: Hot module replacement disabled for static persistent views.</p>
              </div>

              {/* Security & Password Management Block */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-brand-ink/40 p-6 space-y-6">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className="font-serif text-sm font-semibold text-brand-gold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand-gold" />
                    <span>{isRtl ? 'إعدادات الأمان وتغيير كلمة المرور' : 'Security & Administrator Password'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'يمكنك هنا تغيير كلمة مرور لوحة التحكم. سيتم حفظ كلمة المرور الجديدة تلقائياً في قاعدة البيانات بحيث تعمل بنجاح ودون أي مشاكل حتى بعد نشر وتفعيل الموقع على الإنترنت.' 
                      : 'Change your private dashboard login password. The password is saved directly in the database registry on the server so that it works perfectly even when published to the internet.'}
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-left">
                  {passwordChangeSuccess && (
                    <div className="rounded bg-emerald-950/40 border border-emerald-500/20 p-3 text-emerald-400 text-xs font-mono">
                      {passwordChangeSuccess}
                    </div>
                  )}

                  {passwordChangeError && (
                    <div className="rounded bg-rose-950/40 border border-rose-500/20 p-3 text-rose-400 text-xs font-mono">
                      {passwordChangeError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-500 font-mono mb-1">
                        {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                      </label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-slate-500 font-mono mb-1">
                        {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </label>
                      <input
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded bg-brand-deep border border-slate-800 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="rounded bg-brand-gold hover:bg-brand-gold/90 text-black text-xs font-bold px-4 py-2 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      {isSavingPassword ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'تحديث كلمة المرور ✓' : 'Update Password ✓')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Box 4: Dark/Light Mode Theme Selection */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-brand-ink/40 p-6 space-y-4">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className="font-serif text-sm font-semibold text-brand-gold flex items-center gap-2 justify-start">
                    <Sun className="h-4 w-4 text-brand-gold" />
                    <span>{isRtl ? 'وضع عرض الموقع (مظلم / مضيء)' : 'Site Display Mode (Dark / Light)'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'اختر مظهر الموقع العام المناسب لك. وضع التصفح المظلم هو الافتراضي لعشاق القراءة الليلية، ويمكنك التغيير للوضع المضيء الكلاسيكي ذو الطابع الورقي الأنيق.' 
                      : 'Choose the visual theme for the website interface. Dark mode is the atmospheric default, while Light mode offers a high-contrast elegant editorial paper feel.'}
                  </p>
                </div>

                <div className={`flex gap-4 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('dark');
                      setThemeChangeSuccess('');
                    }}
                    className={`flex items-center gap-2 rounded border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedTheme === 'dark'
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-bold'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    <span>{isRtl ? 'الوضع المظلم (الافتراضي)' : 'Dark Mode (Default)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('light');
                      setThemeChangeSuccess('');
                    }}
                    className={`flex items-center gap-2 rounded border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedTheme === 'light'
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-bold'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    <span>{isRtl ? 'الوضع المضيء (الورقي)' : 'Light Mode (Paper)'}</span>
                  </button>
                </div>

                <div className={`pt-2 flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleTheme) {
                        onToggleTheme(selectedTheme);
                        setThemeChangeSuccess(isRtl ? 'تم حفظ مظهر واجهة الموقع وتطبيقه بنجاح ✓' : 'Site appearance successfully saved and applied ✓');
                        setTimeout(() => setThemeChangeSuccess(''), 4000);
                      }
                    }}
                    className="flex items-center gap-2 rounded bg-brand-gold hover:bg-brand-gold/90 text-black text-xs font-bold px-4 py-2 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isRtl ? 'حفظ التغييرات' : 'Save Changes'}</span>
                  </button>

                  {themeChangeSuccess && (
                    <span className="text-xs text-emerald-400 font-medium animate-fade-in">
                      {themeChangeSuccess}
                    </span>
                  )}
                </div>
              </div>

              {/* Box 5: Feature Toggles & Visibility Control Panel */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-brand-ink/40 p-6 space-y-6">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className="font-serif text-sm font-semibold text-brand-gold flex items-center gap-2 justify-start">
                    <Settings className="h-4 w-4 text-brand-gold" />
                    <span>{isRtl ? 'إعدادات ميزات الموقع وعرضها' : 'Site Features & Visibility Controls'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'تحكم في تفعيل أو إخفاء ميزات الموقع المختلفة مثل عداد الزوار، تقييم الكتب بواسطة الزوار، ومكتبة التحميل المباشر.' 
                      : 'Enable, disable, or hide specific features on your public website, such as the site visitor counter, user ratings, and the direct download library shelf.'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {featuresSuccess && (
                    <div className="rounded bg-emerald-950/40 border border-emerald-500/20 p-3 text-emerald-400 text-xs font-mono">
                      {featuresSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Visitor Counter Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'عداد زوار الموقع' : 'Site Visitor Counter'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.showVisitorCounter !== false}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, showVisitorCounter: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إظهار عداد زوار الموقع في تذييل الصفحة لحساب عدد الزيارات الكلي للموقع.' 
                          : 'Show or hide the real-time site visitor counter in the website footer.'}
                      </p>
                      
                      {editedUiTexts.showVisitorCounter !== false && (
                        <div className="pt-2">
                          <label className="block text-[9px] uppercase text-slate-500 font-mono mb-1">
                            {isRtl ? 'قيمة العداد الحالية' : 'Current Counter Value'}
                          </label>
                          <input
                            type="number"
                            value={editedUiTexts.visitorCount !== undefined ? editedUiTexts.visitorCount : 1428}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, visitorCount: parseInt(e.target.value) || 0 })}
                            className="w-32 rounded bg-brand-deep border border-slate-800 px-3 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Book Rating Feature Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'ميزة تقييم الكتب' : 'Book Rating Feature'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.showBookRatingFeature !== false}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, showBookRatingFeature: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'السماح للزوار بتقييم المؤلفات بنجوم (من ١ إلى ٥) وعرض التقييمات الحالية على كل كتاب.' 
                          : 'Allow visitors to rate books interactively (1 to 5 stars) and show ratings on book cards.'}
                      </p>
                    </div>

                    {/* Direct Download Library Shelf Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'عرض مكتبة التحميل المباشر' : 'Direct Download Library Shelf'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.showDirectDownloadLibrary !== false}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, showDirectDownloadLibrary: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إظهار أو إخفاء قسم "مكتبة التحميل المباشر" بالكامل الذي يحتوي على قائمة الكتب وجميع خيارات التحميل والبحث في الصفحة الرئيسية لزوار الموقع.' 
                          : 'Show or hide the entire "Direct Download Library" shelf, search bar, and book list from visitors on the home page.'}
                      </p>
                    </div>

                    {/* Header Verified Badge Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'علامة التحقق في أعلى الموقع (الهيدر)' : 'Verified Badge in Website Header'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.showVerifiedBadgeInHeader !== false}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, showVerifiedBadgeInHeader: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'عرض علامة التوثيق والتحقق الزرقاء الرسمية بجانب اسم الكاتب / عنوان الموقع في أعلى الصفحة لزيادة موثوقية المنصة.' 
                          : 'Display the official blue verified badge next to the site title in the header to increase page authority.'}
                      </p>
                    </div>

                    {/* Show Logo in Post Header Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'عرض شعار صاحب الموقع في ترويسة المنشورات' : "Display Site Owner's Logo in Post Header"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.showLogoInPostHeader === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, showLogoInPostHeader: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'عرض شعار صاحب الموقع المخصص بدلاً من الحرف الأول لاسم الكاتب في ترويسة المنشورات.' 
                          : "Display the custom site owner's logo instead of the generic author initial/avatar in the circular post headers."}
                      </p>

                      {editedUiTexts.showLogoInPostHeader && (
                        <div className="pt-2 space-y-2 border-t border-slate-800">
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {isRtl ? 'صورة شعار ترويسة المنشورات (تغيير الشعار بشكل منفصل)' : 'Custom Post Header Logo Image (Change Separately)'}
                          </label>
                          <div className="flex items-center gap-3 rounded-sm border border-slate-800 bg-slate-900/40 p-2.5">
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleLogoUpload(e, 'postsLogoUrl')}
                                className="hidden"
                                id="posts-logo-input"
                              />
                              <label
                                htmlFor="posts-logo-input"
                                className="flex items-center justify-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 px-3 py-2 text-[11px] font-bold text-slate-200 cursor-pointer transition-colors w-full"
                              >
                                <Upload className="h-3.5 w-3.5 text-brand-gold" />
                                <span>{isRtl ? 'اختيار شعار مخصص للمنشورات' : 'Choose Post Logo'}</span>
                              </label>
                            </div>
                            {editedUiTexts.postsLogoUrl ? (
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 border border-brand-gold/30 rounded-full bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                                  <img src={editedUiTexts.postsLogoUrl} alt="Post Logo preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditedUiTexts({ ...editedUiTexts, postsLogoUrl: '' })}
                                  className="text-[10px] text-red-400 hover:text-red-300 font-bold px-1.5"
                                >
                                  {isRtl ? 'إزالة' : 'Remove'}
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500">
                                {isRtl ? 'سيستخدم الشعار الرئيسي كبديل تلقائي' : 'Falls back to primary logo automatically'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hide Post Section Header Text Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء نصوص واجهة المنشورات' : 'Hide Post Section Title & Subtitle'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hidePostsHeaderText === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hidePostsHeaderText: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء العنوان الرئيسي والعنوان الفرعي لواجهة قسم التفاعل والمنشورات بالكامل من الموقع.' 
                          : 'Hide the main title and subtitle displayed in the posts and interaction feed interface.'}
                      </p>
                    </div>

                    {/* Hide Posts Section Entirely Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء قسم المنشورات بالكامل' : 'Hide Posts Section Entirely'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hidePostsSection === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hidePostsSection: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء قسم المنشورات بالكامل من الصفحة الرئيسية والترويسة والروابط والتنقل.' 
                          : 'Completely hide the posts section and navigation links from the homepage and header.'}
                      </p>
                    </div>

                    {/* Disable Posts Notifications Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'تعطيل إشعارات المنشورات' : 'Disable Posts Notifications'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.disablePostsNotifications === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, disablePostsNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'تعطيل ظهور نافذة إشعار المنشورات الأنيقة وصوت الجرس في الموقع تماماً.' 
                          : 'Disable the sleek pop-up notification banner and chime sound for the posts icon entirely.'}
                      </p>
                    </div>

                    {/* Hide Written Posts View Count Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء مشاهدات المنشورات المكتوبة' : 'Hide Written Posts Views'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hideWrittenPostsViewCount === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hideWrittenPostsViewCount: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء عداد المشاهدات للمنشورات النصية والصور. عداد مشاهدات الفيديو سيظل يظهر دائماً.' 
                          : 'Hide view counts for regular text/image posts. Video posts will always keep their view count visible.'}
                      </p>
                    </div>

                    {/* Disable Login Alarm Sounds Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'تعطيل أصوات إنذار تسجيل الدخول' : 'Disable Login Alarm Sounds'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.disableLoginAlarmSounds === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, disableLoginAlarmSounds: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'تعطيل أصوات صفارات الإنذار ونغمات التنبيه التحذيرية عند إدخال كلمة مرور خاطئة.' 
                          : 'Disable siren/alert sound playbacks when an incorrect password is typed on the login prompt.'}
                      </p>
                    </div>

                    {/* Use Arabic Voice Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'استخدام صوت بشري عربي للإنذار' : 'Use Arabic Human Voice Alert'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.useArabicVoiceForLoginAlert === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, useArabicVoiceForLoginAlert: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'استخدام صوت بشري يتكلم باللغة العربية للتحذير من محاولة الدخول غير المصرح بها بدلاً من النغمة العادية.' 
                          : 'Use a clear spoken human Arabic voice notification warning about unauthorized access instead of default alarm sound.'}
                      </p>
                    </div>

                    {/* Hide Post Interactions Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء تفاعلات المنشورات' : 'Hide Post Interactions'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hidePostsInteractions === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hidePostsInteractions: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء الإعجابات والتعليقات والردود داخل قسم المنشورات، مع إبقاء المنشورات قابلة للقراءة.' 
                          : 'Hide Likes, Comments, and Replies inside posts while keeping post contents readable.'}
                      </p>
                    </div>

                    {/* Hide Search Filters Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء محرك البحث والتصنيفات' : 'Hide Search & Category Filters'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hideSearchFilters === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hideSearchFilters: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء شريط البحث والتصنيفات الخاصة بمكتبة التحميل المباشر.' 
                          : 'Hide the search input bar and category filter tabs from the direct download book shelf.'}
                      </p>
                    </div>

                    {/* Hide Download Stats Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'إخفاء أعداد تنزيلات الكتب' : 'Hide Book Download Statistics'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.hideDownloadStats === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, hideDownloadStats: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'إخفاء عداد مرات التحميل المباشرة التي تظهر في بطاقات الكتب.' 
                          : 'Hide the direct download counters displayed inside book visual cards.'}
                      </p>
                    </div>

                    {/* Creamy Elegant Theme Mode Toggle */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'تفعيل واجهة الوضع الكريمي الأنيق' : 'Creamy Elegant Theme Mode'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedUiTexts.creamyThemeMode === true}
                            onChange={(e) => setEditedUiTexts({ ...editedUiTexts, creamyThemeMode: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'تحويل الموقع وقسم المنشورات إلى واجهة كلاسيكية أنيقة بلون خلفية كريمي دافئ ونصوص متناسقة مريحة جداً للعين.' 
                          : 'Transform the homepage and posts section into an elegant creamy interface with warm paper background and soft matching text for an exceptionally clear and reader-friendly experience.'}
                      </p>
                    </div>

                    {/* Global Reader Accessibility Settings (Private to Admin Control Panel) */}
                    <div className="rounded-lg bg-brand-deep/30 border border-slate-800 p-4 space-y-4 md:col-span-2">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Type className="h-4 w-4 text-brand-gold" />
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {isRtl ? 'خيارات إعدادات القراءة والمظهر للزوار' : 'Global Reader Accessibility Settings'}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl 
                          ? 'تحكم بشكل كامل وحصري بمقاس الخط الافتراضي ومستوى سطوع/تباين ألوان نصوص الموقع بالكامل لجميع زوار موقعك لضمان تجربة مريحة وسهلة القراءة.' 
                          : 'As the administrator, you have complete private control over the default font size and text contrast/tone across the entire website for all visitors.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {/* Font Size Admin Control */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {isRtl ? 'حجم الخط الافتراضي للموقع' : 'Global Default Font Size'}
                          </label>
                          <div className="flex items-center justify-between rounded bg-black/40 border border-slate-850 p-2">
                            <button
                              type="button"
                              onClick={() => {
                                const current = editedUiTexts.globalFontSize || 100;
                                setEditedUiTexts({ ...editedUiTexts, globalFontSize: Math.max(current - 10, 80) });
                              }}
                              disabled={(editedUiTexts.globalFontSize || 100) <= 80}
                              className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                              title={isRtl ? 'تصغير الخط' : 'Decrease size'}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-mono font-bold text-brand-gold">
                              {editedUiTexts.globalFontSize || 100}%
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = editedUiTexts.globalFontSize || 100;
                                setEditedUiTexts({ ...editedUiTexts, globalFontSize: Math.min(current + 10, 150) });
                              }}
                              disabled={(editedUiTexts.globalFontSize || 100) >= 150}
                              className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                              title={isRtl ? 'تكبير الخط' : 'Increase size'}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Hero Title Font Size Admin Control */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {isRtl ? 'حجم خط العنوان الرئيسي (هيرو)' : 'Hero Title Font Size'}
                          </label>
                          <div className="flex items-center justify-between rounded bg-black/40 border border-slate-850 p-2">
                            <button
                              type="button"
                              onClick={() => {
                                const current = editedUiTexts.heroTitleFontSize || 100;
                                setEditedUiTexts({ ...editedUiTexts, heroTitleFontSize: Math.max(current - 10, 50) });
                              }}
                              disabled={(editedUiTexts.heroTitleFontSize || 100) <= 50}
                              className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                              title={isRtl ? 'تصغير الخط' : 'Decrease size'}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-mono font-bold text-brand-gold">
                              {editedUiTexts.heroTitleFontSize || 100}%
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = editedUiTexts.heroTitleFontSize || 100;
                                setEditedUiTexts({ ...editedUiTexts, heroTitleFontSize: Math.min(current + 10, 250) });
                              }}
                              disabled={(editedUiTexts.heroTitleFontSize || 100) >= 250}
                              className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                              title={isRtl ? 'تكبير الخط' : 'Increase size'}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Contrast Admin Control */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {isRtl ? 'تباين وحيوية ألوان النصوص' : 'Global Default Text Contrast'}
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => setEditedUiTexts({ ...editedUiTexts, globalContrast: 'soft' })}
                              className={`rounded py-2 px-1 text-[10px] font-medium transition-all cursor-pointer text-center border ${
                                editedUiTexts.globalContrast === 'soft'
                                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                  : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="font-bold">{isRtl ? 'خافت' : 'Dim'}</div>
                              <div className="text-[8px] opacity-70 font-light leading-none mt-0.5">{isRtl ? 'مريح للعين' : 'Cozy'}</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditedUiTexts({ ...editedUiTexts, globalContrast: 'normal' })}
                              className={`rounded py-2 px-1 text-[10px] font-medium transition-all cursor-pointer text-center border ${
                                !editedUiTexts.globalContrast || editedUiTexts.globalContrast === 'normal'
                                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                  : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="font-bold">{isRtl ? 'الافتراضي' : 'Default'}</div>
                              <div className="text-[8px] opacity-70 font-light leading-none mt-0.5">{isRtl ? 'المظهر الأصلي' : 'Original'}</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditedUiTexts({ ...editedUiTexts, globalContrast: 'high' })}
                              className={`rounded py-2 px-1 text-[10px] font-medium transition-all cursor-pointer text-center border ${
                                editedUiTexts.globalContrast === 'high'
                                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                  : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="font-bold">{isRtl ? 'واضح جداً' : 'Bright'}</div>
                              <div className="text-[8px] opacity-70 font-light leading-none mt-0.5">{isRtl ? 'وضوح فائق' : 'High Clarity'}</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className={`pt-2 flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <button
                      type="button"
                      onClick={handleSaveFeatures}
                      disabled={isSavingFeatures}
                      className="flex items-center gap-2 rounded bg-brand-gold hover:bg-brand-gold/90 text-black text-xs font-bold px-4 py-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingFeatures ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ إعدادات الميزات' : 'Save Feature Settings')}
                    </button>
                  </div>

                </div>
              </div>

              {/* Box 6: Control Panel Customization (Module Visibility) */}
              <div className="md:col-span-3 rounded-xl border border-slate-800 bg-brand-ink/40 p-6 space-y-4 text-left">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-brand-gold flex items-center gap-2 justify-start">
                    <Sliders className="h-4 w-4 text-brand-gold" />
                    <span>{isRtl ? 'تخصيص لوحة التحكم والوحدات' : 'Control Panel Customization & Module Visibility'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'اختر الأقسام والوحدات التي ترغب بإظهارها أو إخفائها بالكامل من لوحة التحكم لتبسيط مساحة عملك.' 
                      : 'Choose which optional configuration sections you want to display or completely hide from this administrator control panel.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 rounded border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white font-mono block">
                      {isRtl ? 'أدوات إعداد "اتصل بالكاتب"' : '"Contact the Author" Settings Card'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {isRtl 
                        ? 'إخفاء أو إظهار لوحة تحكم وإعداد ميزة التواصل مع الكاتب من تبويب "السيرة الذاتية".' 
                        : 'Hide or show the entire "Contact the Author" settings block inside the "Author Bio" editing tab.'}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!cfHideFromControlPanel}
                      onChange={(e) => {
                        setCfHideFromControlPanel(!e.target.checked);
                        setFeaturesSuccess(isRtl 
                          ? 'تم تحديث خيارات عرض لوحة التحكم! يرجى النقر على زر "حفظ إعدادات الميزات" لتطبيق وحفظ هذه التغييرات.' 
                          : 'Dashboard settings updated! Click the "Save Feature Settings" button above to commit and save these visibility parameters permanently.');
                        setTimeout(() => setFeaturesSuccess(''), 6000);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-black peer-checked:after:border-black"></div>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: WEBSITE INTERFACE TRANSLATION EDITOR */}
          {activeTab === 'uitexts' && (
            <form onSubmit={handleSaveUiTexts} className="space-y-8 animate-fade-in text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-light text-white">
                    {isRtl ? 'تعديل نصوص واجهة الموقع بالكامل' : 'Website Interface Translation Editor'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'يمكنك هنا تعديل كافة الكلمات والجمل الظاهرة في كافة أقسام الموقع وحفظها في قاعدة البيانات.' 
                      : 'Customize every single static label, heading, button text, and tagline shown on the website.'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSavingUiTexts}
                  className="flex items-center gap-2 rounded-sm bg-brand-gold px-6 py-2.5 text-xs font-bold text-black transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingUiTexts ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ كافة التغييرات' : 'Save All UI Texts')}</span>
                </button>
              </div>

              {/* Informative Help Banner for 'الإصدار الروائي الرئيسي' */}
              <div className="rounded-sm border border-brand-gold/30 bg-brand-gold/5 p-4 flex items-start gap-3">
                <div className="rounded-full bg-brand-gold/10 p-1 text-brand-gold mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-brand-gold font-serif">
                    {isRtl ? 'هل تريد تعديل عبارة (الإصدار الروائي الرئيسي)؟' : 'Looking to change "الإصدار الروائي الرئيسي"?'}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {isRtl 
                      ? 'لقد قمنا بتسهيل ذلك لك! يمكنك العثور عليها وتغييرها بأي نص تريده مباشرةً في القسم الثاني بالأسفل (2. القسم الرئيسي العلوي) تحت اسم "الشارة أو العبارة العلوية فوق العنوان" ثم الضغط على زر الحفظ.'
                      : 'You can customize it under "Hero Accent Badge / Tagline" in section 2 (Hero & Spotlight Cover Area) below. Type any text you want, then click Save.'}
                  </p>
                </div>
              </div>

              {/* Group 1: General & Navigation */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  1. {isRtl ? 'القائمة الرئيسية والشعار الأدبي' : 'Header, Logo & Navigation'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'اسم الشعار المكون من حرفين (في حال عدم رفع صورة)' : 'Logo Initials (Max 2-3 chars - fallback)'}</label>
                    <input
                      type="text"
                      value={editedUiTexts.logoText}
                      onChange={e => setEditedUiTexts({ ...editedUiTexts, logoText: e.target.value })}
                      className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  {/* Primary Logo Upload (The Box on the Start Page) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      {isRtl ? 'الصورة المخصصة في صندوق الشعار بالصفحة الرئيسية (The Box on the Start Page)' : 'Custom Image in the Logo Box on the Start Page'}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-normal">
                      {isRtl 
                        ? 'هذا يتيح لك وضع صورة مخصصة بالكامل داخل المربع/الصندوق الذهبي الأنيق الموجود بجانب عنوان الموقع في أعلى الصفحة الرئيسية. يمكنك رفع صورة هنا أو إزالتها للرجوع للشعار النصي الافتراضي.'
                        : 'This allows you to place a fully custom image inside the elegant square golden-bordered box next to the site title in the top header on the start page. Upload an image here or remove it to fall back to the text initials.'}
                    </p>
                    <div className="flex items-center gap-4 rounded-sm border border-slate-800 bg-slate-900/50 p-3">
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleLogoUpload(e, 'logoUrl')}
                          className="hidden"
                          id="primary-logo-input"
                        />
                        <label
                          htmlFor="primary-logo-input"
                          className="flex items-center justify-center gap-2 rounded bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 cursor-pointer transition-colors w-full"
                        >
                          <Upload className="h-4 w-4 text-brand-gold" />
                          <span>{isRtl ? 'اختر صورة من جهازك' : 'Choose Custom Image'}</span>
                        </label>
                      </div>
                      {editedUiTexts.logoUrl ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 border border-brand-gold/30 rounded bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={editedUiTexts.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditedUiTexts({ ...editedUiTexts, logoUrl: '' })}
                            className="p-1.5 bg-brand-crimson/10 hover:bg-brand-crimson text-brand-crimson hover:text-white rounded transition-all cursor-pointer"
                            title={isRtl ? 'إزالة الصورة المخصصة' : 'Remove Custom Image'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">{isRtl ? 'لا توجد صورة مخصصة' : 'No Custom Image'}</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Logo Upload */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      {isRtl ? 'شعار تذييل الصفحة / الشعار الثانوي (صورة)' : 'Footer / Secondary Logo (Image)'}
                    </label>
                    <div className="flex items-center gap-4 rounded-sm border border-slate-800 bg-slate-900/50 p-3">
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleLogoUpload(e, 'footerLogoUrl')}
                          className="hidden"
                          id="footer-logo-input"
                        />
                        <label
                          htmlFor="footer-logo-input"
                          className="flex items-center justify-center gap-2 rounded bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 cursor-pointer transition-colors w-full"
                        >
                          <Upload className="h-4 w-4 text-brand-gold" />
                          <span>{isRtl ? 'اختر صورة الشعار' : 'Choose Logo Image'}</span>
                        </label>
                      </div>
                      {editedUiTexts.footerLogoUrl ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 border border-brand-gold/30 rounded bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={editedUiTexts.footerLogoUrl} alt="Footer Logo preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditedUiTexts({ ...editedUiTexts, footerLogoUrl: '' })}
                            className="p-1.5 bg-brand-crimson/10 hover:bg-brand-crimson text-brand-crimson hover:text-white rounded transition-all cursor-pointer"
                            title={isRtl ? 'إزالة الشعار' : 'Remove Logo'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">{isRtl ? 'لم يتم الرفع' : 'No Logo'}</span>
                      )}
                    </div>
                  </div>

                  {/* Hero Background Image Upload & URL */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      {isRtl ? 'صورة خلفية قسم الترحيب الرئيسي (Hero Background Image)' : 'Hero Section Background Image'}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-normal">
                      {isRtl 
                        ? 'هذا يتيح لك تعيين صورة خلفية مخصصة للقسم الترحيبي الرئيسي بالموقع (خلف العنوان الرئيسي والشعارات). يمكنك رفع صورة أو إدخال رابط خارجي للصورة مباشرة.'
                        : 'This allows you to set a custom background image for the main Hero section of the website. You can upload an image file or paste an external direct URL.'}
                    </p>
                    
                    <div className="space-y-3 rounded-sm border border-slate-800 bg-slate-900/50 p-3">
                      {/* Upload Block */}
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleLogoUpload(e, 'topCustomImageUrl')}
                            className="hidden"
                            id="hero-bg-image-input"
                          />
                          <label
                            htmlFor="hero-bg-image-input"
                            className="flex items-center justify-center gap-2 rounded bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 cursor-pointer transition-colors w-full"
                          >
                            <Upload className="h-4 w-4 text-brand-gold" />
                            <span>{isRtl ? 'رفع ملف صورة الخلفية' : 'Upload Background Image'}</span>
                          </label>
                        </div>

                        {editedUiTexts.topCustomImageUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 border border-brand-gold/30 rounded bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                              <img src={editedUiTexts.topCustomImageUrl} alt="Hero Background preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditedUiTexts({ ...editedUiTexts, topCustomImageUrl: '' })}
                              className="p-1.5 bg-brand-crimson/10 hover:bg-brand-crimson text-brand-crimson hover:text-white rounded transition-all cursor-pointer"
                              title={isRtl ? 'إزالة الخلفية' : 'Remove Background'}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">{isRtl ? 'لا توجد خلفية' : 'No Background'}</span>
                        )}
                      </div>

                      {/* Direct URL Input */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">URL:</span>
                        <input
                          type="text"
                          placeholder={isRtl ? 'أو أدخل رابط الصورة المباشر هنا...' : 'Or enter direct image URL here...'}
                          value={editedUiTexts.topCustomImageUrl || ''}
                          onChange={e => setEditedUiTexts({ ...editedUiTexts, topCustomImageUrl: e.target.value })}
                          className="w-full rounded-sm border border-slate-800 bg-black/40 p-2 text-xs text-white focus:border-brand-gold focus:outline-none"
                        />
                      </div>

                      {/* Professional Image Adjustments Sliders */}
                      {editedUiTexts.topCustomImageUrl && (
                        <div className="mt-3 p-3 rounded-sm border border-slate-800/80 bg-black/50 space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                              {isRtl ? 'إعدادات ضبط تباين ومظهر الصورة' : 'Professional Contrast & Image Adjustments'}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {isRtl ? 'معاينة حية ومباشرة' : 'Live filter controls'}
                            </span>
                          </div>

                          {/* 1. Opacity Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">{isRtl ? 'شفافية الصورة (Opacity)' : 'Image Opacity'}</span>
                              <span className="font-mono text-brand-gold font-bold">{editedUiTexts.topCustomImageOpacity ?? 35}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="100"
                              step="5"
                              value={editedUiTexts.topCustomImageOpacity !== undefined ? editedUiTexts.topCustomImageOpacity : 35}
                              onChange={e => setEditedUiTexts({ ...editedUiTexts, topCustomImageOpacity: parseInt(e.target.value) })}
                              className="w-full accent-brand-gold h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 2. Brightness Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">{isRtl ? 'درجة السطوع (Brightness)' : 'Image Brightness'}</span>
                              <span className="font-mono text-brand-gold font-bold">{editedUiTexts.topCustomImageBrightness ?? 60}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="150"
                              step="5"
                              value={editedUiTexts.topCustomImageBrightness !== undefined ? editedUiTexts.topCustomImageBrightness : 60}
                              onChange={e => setEditedUiTexts({ ...editedUiTexts, topCustomImageBrightness: parseInt(e.target.value) })}
                              className="w-full accent-brand-gold h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 3. Contrast Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">{isRtl ? 'مستوى التباين (Contrast)' : 'Image Contrast'}</span>
                              <span className="font-mono text-brand-gold font-bold">{editedUiTexts.topCustomImageContrast ?? 100}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="200"
                              step="5"
                              value={editedUiTexts.topCustomImageContrast !== undefined ? editedUiTexts.topCustomImageContrast : 100}
                              onChange={e => setEditedUiTexts({ ...editedUiTexts, topCustomImageContrast: parseInt(e.target.value) })}
                              className="w-full accent-brand-gold h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 4. Blur Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">{isRtl ? 'مستوى ضبابية الخلفية (Blur)' : 'Blur & Soft Focus'}</span>
                              <span className="font-mono text-brand-gold font-bold">{editedUiTexts.topCustomImageBlur ?? 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              step="1"
                              value={editedUiTexts.topCustomImageBlur !== undefined ? editedUiTexts.topCustomImageBlur : 0}
                              onChange={e => setEditedUiTexts({ ...editedUiTexts, topCustomImageBlur: parseInt(e.target.value) })}
                              className="w-full accent-brand-gold h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'اسم لوحة التحكم في القائمة' : 'Admin Panel Link Name'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.dashboardEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, dashboardEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.dashboardAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, dashboardAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان الموقع بالكامل' : 'Website Header Title'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.titleEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, titleEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.titleAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, titleAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف الفرعي الصغير أسفل العنوان' : 'Header Tagline'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.taglineEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, taglineEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.taglineAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, taglineAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'رابط المؤلفات والكتب' : 'E-Books Menu Link'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.booksEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, booksEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.booksAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, booksAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'رابط "عن الكاتب"' : 'About the Author Menu Link'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.aboutEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, aboutEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.aboutAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, aboutAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Hero Section */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  2. {isRtl ? 'القسم الرئيسي العلوي (Hero Section)' : 'Hero & Spotlight Cover Area'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex justify-between items-center">
                      <span className="text-brand-gold font-bold">{isRtl ? 'الشارة أو العبارة العلوية فوق العنوان (مثال: الإصدار الروائي الرئيسي)' : 'Hero Accent Badge / Tagline (e.g., الإصدار الروائي الرئيسي)'}</span>
                      <span className="rounded bg-brand-gold/20 px-2 py-0.5 text-[10px] text-white border border-brand-gold/30 font-sans font-medium">
                        {isRtl ? 'تعديل "الإصدار الروائي الرئيسي"' : 'Edit Badge'}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="English"
                        value={editedUiTexts.heroBadgeEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroBadgeEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="العربية"
                        value={editedUiTexts.heroBadgeAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroBadgeAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان البانر الرئيسي بالإنجليزية' : 'Hero Title (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.heroTitleEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroTitleEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان البانر الرئيسي بالعربية' : 'Hero Title (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.heroTitleAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroTitleAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'العنوان الفرعي للبانر بالإنجليزية' : 'Hero Subtitle (EN)'}</label>
                      <textarea
                        rows={2}
                        value={editedUiTexts.heroSubtitleEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroSubtitleEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'العنوان الفرعي للبانر بالعربية' : 'Hero Subtitle (AR)'}</label>
                      <textarea
                        rows={2}
                        value={editedUiTexts.heroSubtitleAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroSubtitleAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف الرئيسي بالإنجليزية' : 'Hero Description (EN)'}</label>
                      <textarea
                        rows={3}
                        value={editedUiTexts.heroDescriptionEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroDescriptionEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف الرئيسي بالعربية' : 'Hero Description (AR)'}</label>
                      <textarea
                        rows={3}
                        value={editedUiTexts.heroDescriptionAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroDescriptionAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'مقولة فلسفة العزلة واليقظة بالإنجليزية' : 'Hero Philosophical Quote (EN)'}</label>
                      <textarea
                        rows={2}
                        value={editedUiTexts.heroPhilosophyQuoteEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroPhilosophyQuoteEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'مقولة فلسفة العزلة واليقظة بالعربية' : 'Hero Philosophical Quote (AR)'}</label>
                      <textarea
                        rows={2}
                        value={editedUiTexts.heroPhilosophyQuoteAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, heroPhilosophyQuoteAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر التحميل المباشر' : 'Hero CTA Button'}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="EN"
                          value={editedUiTexts.heroCtaEn}
                          onChange={e => setEditedUiTexts({ ...editedUiTexts, heroCtaEn: e.target.value })}
                          className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="AR"
                          value={editedUiTexts.heroCtaAr}
                          onChange={e => setEditedUiTexts({ ...editedUiTexts, heroCtaAr: e.target.value })}
                          className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر "عن الكاتب"' : 'Hero Secondary CTA'}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="EN"
                          value={editedUiTexts.heroSecondaryCtaEn}
                          onChange={e => setEditedUiTexts({ ...editedUiTexts, heroSecondaryCtaEn: e.target.value })}
                          className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="AR"
                          value={editedUiTexts.heroSecondaryCtaAr}
                          onChange={e => setEditedUiTexts({ ...editedUiTexts, heroSecondaryCtaAr: e.target.value })}
                          className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Library & Bookshelf Static labels */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  3. {isRtl ? 'مكتبة التحميل والبحث والمصنفات' : 'E-Bookshelf Directory & Controls'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'تلميح البحث في الحقل' : 'Search Input Placeholder'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.searchPlaceholderEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, searchPlaceholderEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.searchPlaceholderAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, searchPlaceholderAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر "كل المؤلفات"' : '"All Masterpieces" Filter Name'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.allCategoriesEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, allCategoriesEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.allCategoriesAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, allCategoriesAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان "الإصدارات الموصى بها"' : 'Featured Section Title'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.featuredTitleEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, featuredTitleEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.featuredTitleAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, featuredTitleAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان "مكتبة التحميل المباشر"' : 'Main Bookshelf Title'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.mainShelfTitleEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, mainShelfTitleEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.mainShelfTitleAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, mainShelfTitleAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف أسفل عنوان المكتبة بالإنجليزية' : 'Main Bookshelf Subtitle (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.mainShelfSubEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, mainShelfSubEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف أسفل عنوان المكتبة بالعربية' : 'Main Bookshelf Subtitle (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.mainShelfSubAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, mainShelfSubAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 4: Book Card details labels */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  4. {isRtl ? 'بطاقات الكتب والتنزيل' : 'Book Card Metadata Labels'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'كلمة "صفحة"' : '"Pages" Text'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardPagesEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardPagesEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardPagesAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardPagesAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'كلمة "سنة النشر"' : '"Published" Text'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardYearEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardYearEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardYearAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardYearAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'كلمة "تنزيل"' : '"Downloads" Text'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardDownloadsEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardDownloadsEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardDownloadsAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardDownloadsAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر "تحميل مباشر"' : '"Direct Download (PDF)" text'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardDirectDownloadEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardDirectDownloadEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardDirectDownloadAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardDirectDownloadAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'تلميح "جاري التحضير"' : '"Preparing..." download hint'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardPreparingEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardPreparingEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardPreparingAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardPreparingAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'شارات "موصى به"' : '"Featured" Card badge text'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editedUiTexts.cardFeaturedEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardFeaturedEn: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editedUiTexts.cardFeaturedAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, cardFeaturedAr: e.target.value })}
                        className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 5: Author biography accolade fields & Footer */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  5. {isRtl ? 'عن الكاتب والمحطات والفوتر' : 'About the Author Section & Footer'}
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان فلسفة الكتابة بالإنجليزية' : 'Philosophy Subheading (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.philosophyEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, philosophyEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان فلسفة الكتابة بالعربية' : 'Philosophy Subheading (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.philosophyAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, philosophyAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'نص فلسفة الكتابة بالإنجليزية' : 'Philosophy Description (EN)'}</label>
                      <textarea
                        rows={3}
                        value={editedUiTexts.philosophyBodyEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, philosophyBodyEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'نص فلسفة الكتابة بالعربية' : 'Philosophy Description (AR)'}</label>
                      <textarea
                        rows={3}
                        value={editedUiTexts.philosophyBodyAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, philosophyBodyAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان قسم الجوائز والاتصال بالإنجليزية' : 'Accolades/Contact Title (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.accoladesTitleEn || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, accoladesTitleEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان قسم الجوائز والاتصال بالعربية' : 'عنوان قسم الجوائز والاتصال (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.accoladesTitleAr || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, accoladesTitleAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'جائزة أو محطة ١ بالإنجليزية' : 'Accolade 1 (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.award1En}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, award1En: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'جائزة أو محطة ١ بالعربية' : 'Accolade 1 (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.award1Ar}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, award1Ar: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'جائزة أو محطة ٢ بالإنجليزية' : 'Accolade 2 (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.award2En}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, award2En: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'جائزة أو محطة ٢ بالعربية' : 'Accolade 2 (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.award2Ar}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, award2Ar: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'حقوق النشر والملكية الفكرية بالإنجليزية' : 'Footer Copyright Notice (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.footerAllRightsEn}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, footerAllRightsEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'حقوق النشر والملكية الفكرية بالعربية' : 'Footer Copyright Notice (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.footerAllRightsAr}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, footerAllRightsAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 6: Posts Section Title & Subtitle */}
              <div className="rounded-sm border border-slate-800 bg-brand-deep/20 p-6 space-y-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-brand-gold font-bold">
                  6. {isRtl ? 'واجهة التفاعل والمنشورات' : 'Posts & Interaction Feed Setup'}
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان منصة المنشورات بالإنجليزية' : 'Posts Section Title (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.postsTitleEn || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, postsTitleEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'عنوان منصة المنشورات بالعربية' : 'عنوان منصة المنشورات (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.postsTitleAr || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, postsTitleAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف الفرعي بالإنجليزية' : 'Posts Section Subtitle (EN)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.postsSubtitleEn || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, postsSubtitleEn: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'الوصف الفرعي بالعربية' : 'الوصف الفرعي (AR)'}</label>
                      <input
                        type="text"
                        value={editedUiTexts.postsSubtitleAr || ''}
                        onChange={e => setEditedUiTexts({ ...editedUiTexts, postsSubtitleAr: e.target.value })}
                        className="w-full rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-4 mt-2">
                    <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4 font-mono">
                      {isRtl ? 'أزرار ونصوص التفاعل' : 'Post Interaction Labels & Actions'}
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر الإعجاب "Like"' : '"Like" Button Text'}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editedUiTexts.postsLikeEn || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsLikeEn: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                            placeholder="Like"
                          />
                          <input
                            type="text"
                            value={editedUiTexts.postsLikeAr || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsLikeAr: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                            placeholder="إعجاب"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر التعليق "Comment"' : '"Comment" Button Text'}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editedUiTexts.postsCommentEn || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsCommentEn: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                            placeholder="Comment"
                          />
                          <input
                            type="text"
                            value={editedUiTexts.postsCommentAr || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsCommentAr: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                            placeholder="تعليق"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">{isRtl ? 'زر الرد "Reply"' : '"Reply" Button Text'}</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editedUiTexts.postsReplyButtonEn || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsReplyButtonEn: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                            placeholder="Reply"
                          />
                          <input
                            type="text"
                            value={editedUiTexts.postsReplyButtonAr || ''}
                            onChange={e => setEditedUiTexts({ ...editedUiTexts, postsReplyButtonAr: e.target.value })}
                            className="rounded-sm border border-slate-800 bg-slate-900/50 p-3 text-xs text-white focus:border-brand-gold focus:outline-none text-right"
                            placeholder="رد"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Save Floating Action bar */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingUiTexts}
                  className="flex items-center gap-2 rounded-sm bg-brand-gold px-8 py-3.5 text-xs font-bold text-black transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingUiTexts ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ نصوص واجهة الموقع' : 'Save Translation Setup')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: SECURITY CENTER / ALERTS LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {isRtl ? 'مركز الحماية ومراقبة الاختراق' : 'Control Panel Security Center'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl 
                      ? 'سجل المراقبة الأمنية والتحذيرات لمحاولات الدخول وحالات قفل الحساب.'
                      : 'Audit security access attempts, view live notifications, and clear threat warnings.'}
                  </p>
                </div>

                <div className={`flex gap-3 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={fetchSecurityAlerts}
                    disabled={isLoadingAlerts}
                    className="flex items-center gap-1.5 rounded bg-brand-deep border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
                    <span>{isRtl ? 'تحديث السجل' : 'Refresh Logs'}</span>
                  </button>

                  {securityAlerts.length > 0 && (
                    <>
                      {confirmClearLogs ? (
                        <div className={`flex gap-2 items-center rounded border border-red-950 bg-red-950/20 px-2 py-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-red-400 font-mono font-bold uppercase shrink-0">
                            {isRtl ? 'تأكيد الحذف؟' : 'Are you sure?'}
                          </span>
                          <button
                            onClick={handleClearAllAlerts}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-1 rounded shrink-0 transition-all cursor-pointer"
                          >
                            {isRtl ? 'نعم، امسح الكل' : 'Yes, clear all'}
                          </button>
                          <button
                            onClick={() => setConfirmClearLogs(false)}
                            className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded shrink-0 cursor-pointer"
                          >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmClearLogs(true)}
                          className="rounded bg-red-950/40 border border-red-500/20 hover:bg-red-950 hover:border-red-500/40 text-red-400 text-xs px-4 py-2 font-semibold transition-all cursor-pointer"
                        >
                          {isRtl ? 'مسح كافة السجلات' : 'Clear All Logs'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Security Metrics and Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'حالة الأمان والدرع' : 'Shield Integrity Status'}</span>
                    <div className="mt-4 flex items-center gap-2">
                      {failedAttemptsCount >= 5 ? (
                        <>
                          <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                          <span className="text-sm font-bold text-red-500 font-mono">LOCKED OUT / قفل أمني</span>
                        </>
                      ) : (
                        <>
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-bold text-emerald-400 font-mono">SECURED / مؤمن بالكامل</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-6 font-mono">
                    {isRtl ? 'تتم حماية المدخلات بقفل أمني تلقائي بعد 5 محاولات خاطئة.' : 'Automated 15-min lockout triggers after 5 consecutive failures.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'المحاولات الفاشلة المتتالية' : 'Active Failed Attempts'}</span>
                    <p className={`mt-4 text-4xl font-serif font-bold ${failedAttemptsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-300'}`}>
                      {failedAttemptsCount} / 5
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-6 font-mono">
                    {isRtl ? 'عدد المحاولات الفاشلة المتتالية منذ تسجيل الدخول الصحيح الأخير.' : 'Consecutive failure counter since last authenticated access.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-brand-ink/40 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono uppercase">{isRtl ? 'إجمالي الأحداث الأمنية' : 'Total Security Alert Logs'}</span>
                    <p className="mt-4 text-4xl font-serif font-bold text-white">
                      {securityAlerts.length}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-6 font-mono">
                    {isRtl ? 'محاولات الدخول، القفل الأمني، وتغيير كلمات المرور.' : 'Audit logs spanning failures, blockages, and credential modifications.'}
                  </p>
                </div>
              </div>

              {/* Lockout Countdown if Active */}
              {lockoutUntilTime > Date.now() && (
                <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-5 text-xs text-red-400 font-mono leading-relaxed flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-500 shrink-0 animate-bounce" />
                  <div>
                    <p className="font-bold">{isRtl ? 'مؤقت القفل الأمني نشط حالياً!' : 'Lockout Security Timer Active!'}</p>
                    <p className="text-slate-300 mt-1">
                      {isRtl 
                        ? `لن يتم قبول أي محاولات دخول حتى ينتهي مؤقت الحظر التلقائي عند: ${new Date(lockoutUntilTime).toLocaleTimeString()}.`
                        : `No login attempts will be processed until the lock expires at: ${new Date(lockoutUntilTime).toLocaleTimeString()}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Alerts Log List */}
              <div className="rounded-xl border border-slate-800 bg-brand-ink/20 overflow-hidden">
                <div className="border-b border-slate-800 bg-brand-deep/40 px-5 py-4">
                  <h4 className="font-serif text-sm font-semibold text-white">
                    {isRtl ? 'سجل تدقيق الأمان التفصيلي' : 'Detailed Security Audit Log'}
                  </h4>
                </div>

                {alertsError && (
                  <div className="p-5 text-xs text-red-500 bg-red-950/10 border-b border-slate-800 text-center font-mono">
                    {alertsError}
                  </div>
                )}

                {securityAlerts.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500 font-mono">
                    {isRtl ? 'لا توجد سجلات أو تنبيهات أمنية حالياً. نظام الحماية آمن بالكامل.' : 'No security logs or alert events recorded. System is 100% clean.'}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                    {securityAlerts.map((alert) => {
                      const isResolved = alert.resolved;
                      const isLockout = alert.type === 'lockout';
                      const isPasswordChange = alert.type === 'password_changed';

                      return (
                        <div 
                          key={alert.id} 
                          className={`p-5 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                            isResolved ? 'bg-brand-ink/10 opacity-60' : 'bg-red-950/5 hover:bg-red-950/10'
                          }`}
                        >
                          <div className={`space-y-1.5 flex-grow ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold font-mono uppercase ${
                                isLockout 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : isPasswordChange
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {alert.type}
                              </span>

                              <span className="text-slate-400 font-mono font-medium">
                                {new Date(alert.timestamp).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                              </span>

                              {!isResolved && !isPasswordChange && (
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                              )}
                            </div>

                            <div className={`text-slate-200 font-mono text-[11px] leading-relaxed break-all ${isRtl ? 'text-right' : 'text-left'}`}>
                              <p>• <span className="text-slate-400">IP:</span> {alert.ipAddress}</p>
                              {alert.attemptedPassword && (
                                <p>• <span className="text-slate-400">Attempt:</span> <span className="text-amber-300 select-all font-mono">"{alert.attemptedPassword}"</span></p>
                              )}
                              {alert.userAgent && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">• <span className="text-slate-600">User Agent:</span> {alert.userAgent}</p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {!isResolved ? (
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1.5 uppercase transition-all cursor-pointer"
                              >
                                {isRtl ? 'تأكيد القراءة / حل' : 'Acknowledge / Dismiss'}
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-mono font-bold text-[10px] uppercase flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" />
                                {isRtl ? 'تمت المراجعة' : 'Acknowledged'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM INSIGHTS */}

        </div>

      </div>
    </div>
  );
}
