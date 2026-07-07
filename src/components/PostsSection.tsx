import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Calendar, 
  Globe, 
  Trash2, 
  Reply, 
  ArrowLeft, 
  Video, 
  MoreVertical, 
  Plus, 
  Minus, 
  X,
  MessageCircle,
  User,
  Lock,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, PostComment, Language, AuthorBio, UiTexts } from '../types';

interface PostsSectionProps {
  lang: Language;
  posts: Post[];
  author: AuthorBio;
  uiTexts: UiTexts;
  onRefreshData: () => void;
  isAdmin: boolean;
  isDedicatedPage?: boolean;
  onBackToHome?: () => void;
}

export default function PostsSection({
  lang,
  posts,
  author,
  uiTexts,
  onRefreshData,
  isAdmin,
  isDedicatedPage = false,
  onBackToHome
}: PostsSectionProps) {
  const isRtl = lang === 'ar';
  
  // Local active states for comments or individual post operations
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentNames, setCommentNames] = useState<{ [postId: string]: string }>({});
  const [commentContents, setCommentContents] = useState<{ [postId: string]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [postId: string]: boolean }>({});
  const [likedPosts, setLikedPosts] = useState<{ [postId: string]: boolean }>({});
  const [isLiking, setIsLiking] = useState<{ [postId: string]: boolean }>({});

  // Reply state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Three-dot menu state
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const handleCopyLink = (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  // Custom modal/confirmation states to bypass window.confirm and window.prompt
  const [showLikesModal, setShowLikesModal] = useState<Post | null>(null);
  const [likesInputValue, setLikesInputValue] = useState('');
  const [showViewsModal, setShowViewsModal] = useState<Post | null>(null);
  const [viewsInputValue, setViewsInputValue] = useState('');
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState<{ postId: string, commentId: string } | null>(null);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState<Post | null>(null);

  // Helper to format date nicely
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const [visitorUsername, setVisitorUsername] = useState<string>('');

  // Load liked posts and saved visitor username on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('coma_liked_posts');
    if (savedLikes) {
      try {
        setLikedPosts(JSON.parse(savedLikes));
      } catch (e) {
        console.error('Error parsing liked posts:', e);
      }
    }
    const savedName = localStorage.getItem('coma_visitor_username');
    if (savedName) {
      setVisitorUsername(savedName);
      setReplyName(savedName);
    }
  }, []);

  const [playedVideos, setPlayedVideos] = useState<string[]>([]);

  const handleVideoPlay = async (postId: string) => {
    if (playedVideos.includes(postId)) return;
    setPlayedVideos(prev => [...prev, postId]);
    try {
      await fetch(`/api/posts/${postId}/view`, {
        method: 'POST'
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to register video view:', err);
    }
  };

  // Handle Like/Unlike toggle
  const handleLike = async (postId: string) => {
    if (isLiking[postId]) return;
    
    const hasLiked = likedPosts[postId];
    setIsLiking(prev => ({ ...prev, [postId]: true }));
    try {
      const url = hasLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`;
      const res = await fetch(url, {
        method: 'POST'
      });
      if (res.ok) {
        const nextLiked = !hasLiked;
        setLikedPosts(prev => {
          const updated = { ...prev, [postId]: nextLiked };
          localStorage.setItem('coma_liked_posts', JSON.stringify(updated));
          return updated;
        });
        onRefreshData();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Submit Comment
  const handleSubmitComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    let authorName = '';
    if (isAdmin) {
      authorName = commentNames[postId]?.trim() || (isRtl ? author.nameAr : author.nameEn);
    } else {
      authorName = visitorUsername ? visitorUsername.trim() : (commentNames[postId]?.trim() || '');
    }
    const content = commentContents[postId]?.trim();

    if (!authorName || !content) return;

    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorName, content })
      });

      if (res.ok) {
        setCommentContents(prev => ({ ...prev, [postId]: '' }));
        if (!isAdmin && !visitorUsername) {
          localStorage.setItem('coma_visitor_username', authorName);
          setVisitorUsername(authorName);
          setReplyName(authorName);
        }
        onRefreshData();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Submit Reply
  const handleSubmitReply = async (postId: string, commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    let name = '';
    if (isAdmin) {
      name = replyName.trim() || (isRtl ? author.nameAr : author.nameEn);
    } else {
      name = visitorUsername ? visitorUsername.trim() : replyName.trim();
    }
    const content = replyContent.trim();

    if (!content) return;
    if (!name) return;

    setIsSubmittingReply(true);

    const token = sessionStorage.getItem('coma_admin_token');

    try {
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      };
      if (isAdmin && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${postId}/comments/${commentId}/reply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ authorName: name, content })
      });

      if (res.ok) {
        setReplyContent('');
        if (!isAdmin && !visitorUsername) {
          localStorage.setItem('coma_visitor_username', name);
          setVisitorUsername(name);
          setReplyName(name);
        }
        setReplyingCommentId(null);
        onRefreshData();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Actually perform comment deletion after confirmation
  const performDeleteComment = async (postId: string, commentId: string) => {
    const token = sessionStorage.getItem('coma_admin_token');
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Actually perform post deletion after confirmation
  const performDeletePost = async (postId: string) => {
    const token = sessionStorage.getItem('coma_admin_token');
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Admin exclusive likes update
  const handleUpdateLikes = async (post: Post, newCount: number) => {
    const token = sessionStorage.getItem('coma_admin_token');
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentEn: post.contentEn,
          contentAr: post.contentAr,
          image: post.image,
          video: post.video,
          likes: newCount
        })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  // Admin exclusive views update
  const handleUpdateViews = async (post: Post, newCount: number) => {
    const token = sessionStorage.getItem('coma_admin_token');
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentEn: post.contentEn,
          contentAr: post.contentAr,
          image: post.image,
          video: post.video,
          views: newCount
        })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const authorName = isRtl ? author.nameAr : author.nameEn;
  const authorTitle = isRtl ? author.titleAr : author.titleEn;
  const authorAvatar = author.avatars?.[0] || author.avatar || '';

  const t = {
    title: isRtl 
      ? (uiTexts.postsTitleAr || 'منصة التفاعل والمنشورات') 
      : (uiTexts.postsTitleEn || 'Interaction & Social Feed'),
    subtitle: isRtl 
      ? (uiTexts.postsSubtitleAr || 'آخر الأخبار، الخواطر والتحديثات اليومية') 
      : (uiTexts.postsSubtitleEn || 'Latest news, thoughts, and daily updates'),
    like: isRtl ? (uiTexts.postsLikeAr || 'إعجاب') : (uiTexts.postsLikeEn || 'Like'),
    comment: isRtl ? (uiTexts.postsCommentAr || 'تعليق') : (uiTexts.postsCommentEn || 'Comment'),
    share: isRtl ? 'مشاركة' : 'Share',
    commentsTitle: isRtl ? 'التعليقات' : 'Comments',
    writeComment: isRtl ? (uiTexts.postsWriteCommentAr || 'اكتب تعليقاً...') : (uiTexts.postsWriteCommentEn || 'Write a comment...'),
    yourName: isRtl ? (uiTexts.postsYourNameAr || 'اسمك الكريم') : (uiTexts.postsYourNameEn || 'Your name'),
    submit: isRtl ? (uiTexts.postsSubmitAr || 'إرسال') : (uiTexts.postsSubmitEn || 'Submit'),
    noPosts: isRtl ? (uiTexts.postsNoPostsAr || 'لا توجد منشورات حالياً.') : (uiTexts.postsNoPostsEn || 'No posts published yet.'),
    authorBadge: isRtl ? (uiTexts.postsAuthorBadgeAr || 'الكاتب') : (uiTexts.postsAuthorBadgeEn || 'Author'),
    replyingAs: isRtl ? (uiTexts.postsReplyingAsAr || 'تفاعل كزائر متميز') : (uiTexts.postsReplyingAsEn || 'Interact as a visitor'),
    replyButton: isRtl ? (uiTexts.postsReplyButtonAr || 'رد') : (uiTexts.postsReplyButtonEn || 'Reply'),
    backToHome: isRtl ? (uiTexts.postsBackToHomeAr || 'العودة للرئيسية') : (uiTexts.postsBackToHomeEn || 'Back to Home'),
    adjustLikes: isRtl ? 'تعديل الإعجابات' : 'Adjust Likes',
    customLikes: isRtl ? 'مخصص' : 'Custom',
    promptLikes: isRtl ? 'أدخل عدد الإعجابات الجديد:' : 'Enter new likes count:',
    adminReplyLabel: isRtl ? 'رد بصفتك صاحب الموقع' : 'Reply as site owner',
    writeReplyPlaceholder: isRtl ? (uiTexts.postsWriteReplyPlaceholderAr || 'اكتب رداً لطيفاً...') : (uiTexts.postsWriteReplyPlaceholderEn || 'Write a reply...')
  };

  return (
    <section id="posts-section" className="mx-auto max-w-3xl px-6 py-12 scroll-mt-24 min-h-[70vh]">
      
      {/* Back button for dedicated page experience */}
      {isDedicatedPage && (
        <div className={`mb-8 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={onBackToHome}
            className="rounded-full bg-white/5 border border-white/10 px-5 py-2 text-xs font-semibold text-slate-300 hover:text-brand-gold hover:border-brand-gold/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t.backToHome}</span>
          </button>
        </div>
      )}

      {!uiTexts.hidePostsHeaderText && (
        <div className={`mb-12 text-center ${isRtl ? 'text-right' : 'text-left'}`}>
          <h3 className="font-serif text-3xl font-light tracking-widest text-white uppercase">
            {t.title}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-gold font-bold">
            {t.subtitle}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 rounded-lg border border-dashed border-white/10 bg-white/5">
            <MessageSquare className="h-10 w-10 text-slate-700 mb-3" />
            <p className="text-sm text-slate-500 font-mono uppercase">{t.noPosts}</p>
          </div>
        ) : (
          posts.map((post) => {
            const hasLiked = likedPosts[post.id];
            const postContent = isRtl ? post.contentAr : post.contentEn;
            const totalCommentsAndReplies = (post.comments || []).reduce(
              (acc, c) => acc + 1 + (c.replies?.length || 0),
              0
            );

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm relative ${activeMenuPostId === post.id ? 'z-30' : 'z-0'}`}
              >
                {/* Post Header */}
                <div className={`p-4 flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    {uiTexts.showLogoInPostHeader && (uiTexts.postsLogoUrl || uiTexts.logoUrl) ? (
                      <img
                        src={uiTexts.postsLogoUrl || uiTexts.logoUrl}
                        alt="Logo"
                        className="w-10 h-10 rounded-full object-cover border border-brand-gold/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-10 h-10 rounded-full object-cover border border-brand-gold/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-bold">
                        {authorName.charAt(0)}
                      </div>
                    )}

                    <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-1.5 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h4 className="text-sm font-semibold text-white leading-tight hover:underline cursor-pointer flex items-center gap-1">
                          <span>{authorName}</span>
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Site Owner">
                            <path 
                              d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" 
                              fill="#1877F2" 
                            />
                            <path 
                              d="m9 12 2 2 4-4" 
                              stroke="white" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                          </svg>
                        </h4>
                        <span className="bg-brand-gold/10 text-brand-gold text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border border-brand-gold/20 uppercase tracking-wider">
                          {t.authorBadge}
                        </span>
                      </div>
                      <p className={`text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <Globe className="h-3 w-3" />
                      </p>
                    </div>
                  </div>

                  {/* Stats & Actions (Three-Dot Menu + Dashboard) */}
                  <div className={`flex items-center gap-2 shrink-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* View and Like counts "dashboard" next to three dots if post has a video */}
                    {post.video && (
                      <div className={`flex items-center gap-2 px-2 py-1 rounded bg-black/50 border border-brand-gold/30 text-[10px] text-slate-300 font-mono shadow-md ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="flex items-center gap-1" title={isRtl ? 'الإعجابات' : 'Likes'}>
                          <ThumbsUp className="h-3 w-3 text-blue-500 fill-blue-500/20" />
                          <motion.strong 
                            key={`top-likes-${post.likes}`}
                            initial={{ scale: 1.3, color: '#60a5fa' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                            className="text-white font-semibold inline-block"
                          >
                            {post.likes || 0}
                          </motion.strong>
                        </span>
                        <span className="text-white/20 select-none">|</span>
                        <span className="flex items-center gap-1" title={isRtl ? 'المشاهدات' : 'Views'}>
                          <Eye className="h-3.5 w-3.5 text-brand-gold" />
                          <motion.strong 
                            key={`top-views-${post.views}`}
                            initial={{ scale: 1.3, color: '#eab308' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                            className="text-white font-semibold inline-block"
                          >
                            {post.views || 0}
                          </motion.strong>
                        </span>
                      </div>
                    )}

                    {/* Universal Three-Dot Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isRtl ? 'خيارات المنشور' : 'Post Options'}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuPostId === post.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveMenuPostId(null)} 
                          />
                          <div className={`absolute z-20 mt-1 w-56 rounded border border-white/10 bg-brand-ink/95 shadow-xl text-xs py-2 ${isRtl ? 'left-0' : 'right-0'}`}>
                            {isAdmin ? (
                              <>
                                <div className="px-3 py-1.5 border-b border-white/10 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                                  {t.adjustLikes} ({post.likes || 0})
                                </div>
                                <div className="p-2 grid grid-cols-3 gap-1 border-b border-white/10">
                                  <button
                                    onClick={() => {
                                      handleUpdateLikes(post, (post.likes || 0) + 10);
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/5 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px]"
                                  >
                                    +10
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdateLikes(post, (post.likes || 0) + 50);
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/5 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px]"
                                  >
                                    +50
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowLikesModal(post);
                                      setLikesInputValue(String(post.likes || 0));
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/10 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px] cursor-pointer"
                                  >
                                    {t.customLikes}
                                  </button>
                                </div>

                                <div className="px-3 py-1.5 border-b border-white/10 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                                  {isRtl ? 'تعديل المشاهدات' : 'Adjust Views'} ({post.views || 0})
                                </div>
                                <div className="p-2 grid grid-cols-3 gap-1 border-b border-white/10">
                                  <button
                                    onClick={() => {
                                      handleUpdateViews(post, (post.views || 0) + 50);
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/5 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px]"
                                  >
                                    +50
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdateViews(post, (post.views || 0) + 200);
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/5 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px]"
                                  >
                                    +200
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowViewsModal(post);
                                      setViewsInputValue(String(post.views || 0));
                                      setActiveMenuPostId(null);
                                    }}
                                    className="bg-white/10 hover:bg-brand-gold hover:text-black rounded py-1 text-center font-bold text-[10px] cursor-pointer"
                                  >
                                    {isRtl ? 'مخصص' : 'Custom'}
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    setShowDeletePostConfirm(post);
                                    setActiveMenuPostId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>{isRtl ? 'حذف المنشور' : 'Delete Post'}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    handleCopyLink(post.id);
                                    setActiveMenuPostId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-slate-300 hover:bg-white/5 flex items-center gap-1.5 cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                  <span>{copiedPostId === post.id ? (isRtl ? 'تم نسخ الرابط!' : 'Copied link!') : (isRtl ? 'نسخ رابط المنشور' : 'Copy Post Link')}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className={`px-4 pb-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap ${isRtl ? 'text-right' : 'text-left'}`}>
                  {postContent}
                </div>

                {/* Post Optional Image (Original size without crop/stretch) */}
                {post.image && (
                  <div className="border-t border-b border-white/5 bg-black/30 flex justify-center p-3">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="max-w-full h-auto mx-auto object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Post Optional Video (Original size without crop/stretch) */}
                {post.video && (
                  <div className="border-t border-b border-white/5 bg-black/30 flex justify-center p-3">
                    <video
                      src={post.video}
                      controls
                      onPlay={() => handleVideoPlay(post.id)}
                      className="max-w-full h-auto mx-auto object-contain rounded shadow-lg"
                    />
                  </div>
                )}

                {/* Post Stats */}
                <div className={`px-4 py-3 flex items-center justify-between text-xs text-slate-400 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow">
                        <ThumbsUp className="h-2.5 w-2.5" />
                      </span>
                      <motion.span 
                        key={`bottom-likes-${post.likes}`}
                        initial={{ scale: 1.3, color: '#3b82f6', fontWeight: 700 }}
                        animate={{ scale: 1, color: 'inherit', fontWeight: 400 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                        className="font-mono inline-block"
                      >
                        {post.likes || 0}
                      </motion.span>
                    </div>
                    
                    {(!uiTexts.hideWrittenPostsViewCount || post.video) && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-mono text-slate-400">
                          <motion.span
                            key={`bottom-views-${post.views}`}
                            initial={{ scale: 1.3, color: '#eab308', fontWeight: 700 }}
                            animate={{ scale: 1, color: 'inherit', fontWeight: 400 }}
                            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                            className="inline-block"
                          >
                            {post.views || 0}
                          </motion.span>
                          {' '}{isRtl ? 'مشاهدة' : (post.views === 1 ? 'view' : 'views')}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                    className="hover:underline font-mono"
                  >
                    {totalCommentsAndReplies} {isRtl ? 'تعليق ورد' : (totalCommentsAndReplies === 1 ? 'Comment/Reply' : 'Comments & Replies')}
                  </button>
                </div>

                {/* Post Action Buttons */}
                {(!uiTexts.hidePostsInteractions || isAdmin) && (
                  <div className={`p-1.5 flex items-center gap-1 text-xs font-semibold text-slate-400 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 py-2 rounded-sm hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        hasLiked ? 'text-blue-500 bg-blue-500/5' : 'hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                      <span>{hasLiked ? (isRtl ? 'تم الإعجاب' : 'Liked') : t.like}</span>
                    </button>

                    <button
                      onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                      className={`flex-1 py-2 rounded-sm hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        commentingPostId === post.id ? 'text-brand-gold bg-brand-gold/5' : 'hover:text-white'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t.comment}</span>
                    </button>
                  </div>
                )}

                {/* Comments Expandable Panel */}
                <AnimatePresence>
                  {commentingPostId === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white/[0.02]"
                    >
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto border-b border-white/5">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="space-y-3">
                              {/* Parent Comment block */}
                              <div className={`flex gap-2.5 items-start ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                {comment.authorName === authorName && (uiTexts.postsLogoUrl || uiTexts.logoUrl) ? (
                                  <img
                                    src={uiTexts.postsLogoUrl || uiTexts.logoUrl}
                                    alt="Site Owner"
                                    className="w-8 h-8 rounded-full object-cover border border-brand-gold/30 shrink-0 shadow"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs uppercase shadow">
                                    {comment.authorName.charAt(0)}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className={`rounded-lg bg-white/5 p-3 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-baseline gap-1.5 mb-1 justify-between flex-wrap ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                      <span className="font-semibold text-white flex items-center gap-1">
                                        <span>{comment.authorName}</span>
                                        {comment.authorName === authorName && (
                                          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Site Owner">
                                            <path 
                                              d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" 
                                              fill="#1877F2" 
                                            />
                                            <path 
                                              d="m9 12 2 2 4-4" 
                                              stroke="white" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                            />
                                          </svg>
                                        )}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                      {comment.content}
                                    </p>
                                    
                                    {/* Action row (Reply / Delete) */}
                                    <div className={`flex items-center gap-3 mt-2 text-[10px] text-slate-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                      {(!uiTexts.hidePostsInteractions || isAdmin) && (
                                        <button
                                          onClick={() => {
                                            setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id);
                                            setReplyContent('');
                                            setReplyName('');
                                          }}
                                          className="hover:text-brand-gold flex items-center gap-1 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                                        >
                                          <Reply className="h-3 w-3" />
                                          <span>{t.replyButton}</span>
                                        </button>
                                      )}
                                      
                                      {isAdmin && (
                                        <button
                                          onClick={() => setShowDeleteCommentConfirm({ postId: post.id, commentId: comment.id })}
                                          className="text-red-400/80 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span>{isRtl ? 'حذف' : 'Delete'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Nested Replies threads */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className={`space-y-2.5 ${isRtl ? 'mr-10 pr-4 border-r' : 'ml-10 pl-4 border-l'} border-white/10`}>
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className={`flex gap-2.5 items-start ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                      {(reply.isAdminReply || reply.authorName === authorName) && (uiTexts.postsLogoUrl || uiTexts.logoUrl) ? (
                                        <img
                                          src={uiTexts.postsLogoUrl || uiTexts.logoUrl}
                                          alt="Site Owner"
                                          className="w-7 h-7 rounded-full object-cover border border-brand-gold/30 shrink-0 shadow"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold uppercase ${
                                          reply.isAdminReply 
                                            ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30' 
                                            : 'bg-white/5 border border-white/10 text-slate-400'
                                        }`}>
                                          {reply.authorName.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className={`rounded-lg p-2.5 text-xs ${reply.isAdminReply ? 'bg-brand-gold/5 border border-brand-gold/10' : 'bg-white/5'} ${isRtl ? 'text-right' : 'text-left'}`}>
                                          <div className={`flex items-baseline gap-1.5 mb-0.5 justify-between flex-wrap ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="font-semibold text-white flex items-center gap-1">
                                              <span>{reply.authorName}</span>
                                              {reply.isAdminReply && (
                                                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Author">
                                                  <path 
                                                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" 
                                                    fill="#1877F2" 
                                                  />
                                                  <path 
                                                    d="m9 12 2 2 4-4" 
                                                    stroke="white" 
                                                    strokeWidth="2.5" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                  />
                                                </svg>
                                              )}
                                            </span>
                                            <span className="text-[8px] text-slate-500 font-mono">
                                              {formatDate(reply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {reply.content}
                                          </p>

                                          {/* Delete for Nested replies */}
                                          {isAdmin && (
                                            <div className={`flex justify-end mt-1 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                              <button
                                                onClick={() => setShowDeleteCommentConfirm({ postId: post.id, commentId: reply.id })}
                                                className="text-red-400/80 hover:text-red-400 flex items-center gap-0.5 text-[9px] transition-colors cursor-pointer font-bold uppercase"
                                              >
                                                <Trash2 className="h-2.5 w-2.5" />
                                                <span>{isRtl ? 'حذف' : 'Delete'}</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Inline Reply Form */}
                              {replyingCommentId === comment.id && (
                                <form
                                  onSubmit={(e) => handleSubmitReply(post.id, comment.id, e)}
                                  className={`mt-2 p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-2.5 ${isRtl ? 'mr-10' : 'ml-10'}`}
                                >
                                  <p className={`text-[10px] text-brand-gold/80 font-bold uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                                    <User className="h-3.5 w-3.5" />
                                    <span>{isAdmin ? (isRtl ? 'رد كصاحب الموقع (أسماء متعددة)' : 'Reply as site owner (Multiple Names)') : t.replyingAs}</span>
                                  </p>

                                  <div className={`flex gap-2 items-stretch ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {isAdmin ? (
                                      <input
                                        type="text"
                                        placeholder={isRtl ? 'الاسم (اختياري)' : 'Name (Optional)'}
                                        value={replyName}
                                        onChange={(e) => setReplyName(e.target.value)}
                                        className={`rounded-sm border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                          isRtl ? 'text-right w-1/3' : 'text-left w-1/3'
                                        }`}
                                      />
                                    ) : !visitorUsername ? (
                                      <input
                                        type="text"
                                        required
                                        placeholder={t.yourName}
                                        value={replyName}
                                        onChange={(e) => setReplyName(e.target.value)}
                                        className={`rounded-sm border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                          isRtl ? 'text-right w-1/3' : 'text-left w-1/3'
                                        }`}
                                      />
                                    ) : (
                                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 border border-white/5 rounded-sm select-none">
                                        <Lock className="h-3 w-3 text-slate-500 shrink-0" />
                                        <span className="text-xs text-slate-400 font-medium max-w-[80px] truncate">{visitorUsername}</span>
                                      </div>
                                    )}
                                    <input
                                      type="text"
                                      required
                                      placeholder={t.writeReplyPlaceholder}
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className={`flex-grow rounded-sm border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                        isRtl ? 'text-right' : 'text-left'
                                      }`}
                                    />
                                    <button
                                      type="submit"
                                      disabled={isSubmittingReply}
                                      className="rounded-sm bg-brand-gold/15 border border-brand-gold/30 hover:bg-brand-gold hover:text-black px-4 py-1 text-xs font-bold text-brand-gold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                      {isSubmittingReply ? (
                                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Send className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                       {/* Write a direct Post comment */}
                      {(!uiTexts.hidePostsInteractions || isAdmin) && (
                        <form
                          onSubmit={(e) => handleSubmitComment(post.id, e)}
                          className="p-4 space-y-3"
                        >
                          <p className={`text-[10px] text-brand-gold/80 font-bold uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <User className="h-3.5 w-3.5" />
                            <span>{isAdmin ? (isRtl ? 'تفاعل كصاحب الموقع (أسماء متعددة)' : 'Interact as Site Owner (Multiple Names)') : t.replyingAs}</span>
                          </p>

                          <div className={`flex gap-2 items-stretch ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            {isAdmin ? (
                              <input
                                type="text"
                                placeholder={isRtl ? 'الاسم (اختياري)' : 'Name (Optional)'}
                                value={commentNames[post.id] || ''}
                                onChange={(e) => setCommentNames(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className={`rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                  isRtl ? 'text-right w-1/3' : 'text-left w-1/3'
                                }`}
                              />
                            ) : !visitorUsername ? (
                              <input
                                type="text"
                                required
                                placeholder={t.yourName}
                                value={commentNames[post.id] || ''}
                                onChange={(e) => setCommentNames(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className={`rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                  isRtl ? 'text-right w-1/3' : 'text-left w-1/3'
                                }`}
                              />
                            ) : (
                              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 border border-white/5 rounded-sm select-none">
                                <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                <span className="text-xs text-slate-400 font-medium max-w-[100px] truncate">{visitorUsername}</span>
                              </div>
                            )}
                            <input
                              type="text"
                              required
                              placeholder={t.writeComment}
                              value={commentContents[post.id] || ''}
                              onChange={(e) => setCommentContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                              className={`flex-grow rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-0 ${
                                isRtl ? 'text-right' : 'text-left'
                              }`}
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingComment[post.id]}
                              className="rounded-sm bg-brand-gold/15 border border-brand-gold/30 hover:bg-brand-gold hover:text-black px-4 py-2 text-xs font-bold text-brand-gold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                            >
                              {isSubmittingComment[post.id] ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modern, Iframe-Safe Modals */}
      <AnimatePresence>
        {/* 1. Custom Likes Modal */}
        {showLikesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLikesModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-lg border border-white/15 bg-brand-ink/95 p-6 shadow-2xl text-slate-100 z-10"
            >
              <h4 className={`text-sm font-semibold mb-3 text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'تعديل الإعجابات المخصصة' : 'Adjust Custom Likes'}
              </h4>
              <p className={`text-xs text-slate-400 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t.promptLikes}
              </p>
              <input
                type="number"
                min="0"
                className={`w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white mb-5 focus:border-brand-gold focus:outline-none focus:ring-0 ${isRtl ? 'text-right' : 'text-left'}`}
                value={likesInputValue}
                onChange={(e) => setLikesInputValue(e.target.value)}
                autoFocus
              />
              <div className={`flex gap-2 justify-end ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setShowLikesModal(null)}
                  className="rounded px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    const val = parseInt(likesInputValue, 10);
                    if (!isNaN(val)) {
                      handleUpdateLikes(showLikesModal, val);
                    }
                    setShowLikesModal(null);
                  }}
                  className="rounded px-4 py-2 text-xs font-semibold bg-brand-gold text-black hover:bg-brand-gold/80 transition-colors cursor-pointer font-bold"
                >
                  {isRtl ? 'حفظ التعديلات' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 1.5. Custom Views Modal */}
        {showViewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewsModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-lg border border-white/15 bg-brand-ink/95 p-6 shadow-2xl text-slate-100 z-10"
            >
              <h4 className={`text-sm font-semibold mb-3 text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'تعديل المشاهدات المخصصة' : 'Adjust Custom Views'}
              </h4>
              <p className={`text-xs text-slate-400 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'أدخل عدد المشاهدات الجديد للمنشور:' : 'Enter new views count for the post:'}
              </p>
              <input
                type="number"
                min="0"
                className={`w-full rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-white mb-5 focus:border-brand-gold focus:outline-none focus:ring-0 ${isRtl ? 'text-right' : 'text-left'}`}
                value={viewsInputValue}
                onChange={(e) => setViewsInputValue(e.target.value)}
                autoFocus
              />
              <div className={`flex gap-2 justify-end ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setShowViewsModal(null)}
                  className="rounded px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    const val = parseInt(viewsInputValue, 10);
                    if (!isNaN(val)) {
                      handleUpdateViews(showViewsModal, val);
                    }
                    setShowViewsModal(null);
                  }}
                  className="rounded px-4 py-2 text-xs font-semibold bg-brand-gold text-black hover:bg-brand-gold/80 transition-colors cursor-pointer font-bold"
                >
                  {isRtl ? 'حفظ التعديلات' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Delete Comment Confirm Modal */}
        {showDeleteCommentConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteCommentConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-lg border border-white/15 bg-brand-ink/95 p-6 shadow-2xl text-slate-100 z-10"
            >
              <h4 className={`text-sm font-semibold mb-3 text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'تأكيد الحذف' : 'Confirm Deletion'}
              </h4>
              <p className={`text-xs text-slate-300 mb-6 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'هل أنت متأكد من رغبتك في حذف هذا التعليق نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this comment permanently? This action cannot be undone.'}
              </p>
              <div className={`flex gap-2 justify-end ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setShowDeleteCommentConfirm(null)}
                  className="rounded px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    performDeleteComment(showDeleteCommentConfirm.postId, showDeleteCommentConfirm.commentId);
                    setShowDeleteCommentConfirm(null);
                  }}
                  className="rounded px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer font-bold"
                >
                  {isRtl ? 'حذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Delete Post Confirm Modal */}
        {showDeletePostConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeletePostConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-lg border border-white/15 bg-brand-ink/95 p-6 shadow-2xl text-slate-100 z-10"
            >
              <h4 className={`text-sm font-semibold mb-3 text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'حذف المنشور بالكامل' : 'Delete Entire Post'}
              </h4>
              <p className={`text-xs text-slate-300 mb-6 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'هل أنت متأكد من رغبتك في حذف هذا المنشور بالكامل؟ سيتم حذف جميع التعليقات والردود المرفقة به نهائياً.' : 'Are you sure you want to delete this post entirely? All comments and replies attached to this post will be permanently deleted.'}
              </p>
              <div className={`flex gap-2 justify-end ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setShowDeletePostConfirm(null)}
                  className="rounded px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    performDeletePost(showDeletePostConfirm.id);
                    setShowDeletePostConfirm(null);
                  }}
                  className="rounded px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer font-bold"
                >
                  {isRtl ? 'حذف المنشور' : 'Delete Post'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
