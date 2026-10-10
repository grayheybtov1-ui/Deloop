"use client";

export type Language = "tr" | "az" | "en";

export interface Translations {
  nav: {
    home: string;
    explore: string;
    newPost: string;
    notifications: string;
    messages: string;
    profile: string;
    settings: string;
    login: string;
    logout: string;
    searchPlaceholder: string;
  };
  feed: {
    noPosts: string;
    noPostsDesc: string;
    createPost: string;
    like: string;
    liked: string;
    comment: string;
    share: string;
    linkCopied: string;
    addComment: string;
    postComment: string;
    suggestions: string;
    seeAll: string;
    follow: string;
    following: string;
  };
  profile: {
    editProfile: string;
    follow: string;
    following: string;
    directMessage: string;
    posts: string;
    followers: string;
    followingCount: string;
    gridTab: string;
    feedTab: string;
    githubTab: string;
    notFound: string;
    backToDevs: string;
  };
  messages: {
    title: string;
    searchUsers: string;
    writeMessage: string;
    send: string;
    selectUser: string;
    startConversation: string;
    viewProfile: string;
    loading: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    empty: string;
    newBadge: string;
    followedYou: string;
    likedYourProject: string;
    commentedOnYourProject: string;
  };
  settings: {
    title: string;
    subtitle: string;
    tabProfile: string;
    tabSocial: string;
    tabSecurity: string;
    tabLanguage: string;
    languageTitle: string;
    languageSubtitle: string;
    selectLanguage: string;
    save: string;
    savedToast: string;
  };
}

export const translations: Record<Language, Translations> = {
  tr: {
    nav: {
      home: "Ana Sayfa",
      explore: "Keşfet",
      newPost: "Yeni Gönderi",
      notifications: "Bildirimler",
      messages: "Mesajlar",
      profile: "Profil",
      settings: "Ayarlar",
      login: "Giriş Yap",
      logout: "Çıkış Yap",
      searchPlaceholder: "Ara...",
    },
    feed: {
      noPosts: "Henüz gönderi yok",
      noPostsDesc: "İlk gönderiyi paylaşan sen ol!",
      createPost: "Gönderi Paylaş",
      like: "Beğen",
      liked: "Beğenildi",
      comment: "Yorum Yap",
      share: "Paylaş",
      linkCopied: "Bağlantı kopyalandı",
      addComment: "Yorum ekle...",
      postComment: "Paylaş",
      suggestions: "Senin İçin Önerilenler",
      seeAll: "Tümünü Gör",
      follow: "Takip Et",
      following: "Takip Ediliyor",
    },
    profile: {
      editProfile: "Profili Düzenle",
      follow: "Takip Et",
      following: "Takip Ediliyor",
      directMessage: "Mesaj Gönder (DM)",
      posts: "gönderi",
      followers: "takipçi",
      followingCount: "takip",
      gridTab: "GÖNDERİLER",
      feedTab: "AKIŞ",
      githubTab: "GITHUB",
      notFound: "Geliştirici Bulunamadı",
      backToDevs: "Geliştiricilere Dön",
    },
    messages: {
      title: "Direkt Mesajlar",
      searchUsers: "Geliştirici ara...",
      writeMessage: "Mesaj yazın...",
      send: "Gönder",
      selectUser: "Sohbet etmek için bir geliştirici seçin.",
      startConversation: "Sohbete başlayın! Birbirinize mesaj gönderin.",
      viewProfile: "Profile Git",
      loading: "Mesajlar yükleniyor...",
    },
    notifications: {
      title: "Aktivite Bildirimleri",
      subtitle: "Beğenileri, yorumları ve yeni takipçileri buradan takip edin",
      markAllRead: "Tümünü okundu işaretle",
      empty: "Henüz bildirim yok.",
      newBadge: "yeni",
      followedYou: "seni takip etmeye başladı.",
      likedYourProject: "adlı projeni beğendi.",
      commentedOnYourProject: "adlı projene yorum yaptı.",
    },
    settings: {
      title: "Hesap Ayarları",
      subtitle: "Profilinizi, sosyal bağlantılarınızı ve dil tercihlerinizi yönetin.",
      tabProfile: "Profil Bilgileri",
      tabSocial: "Sosyal & GitHub",
      tabSecurity: "Güvenlik",
      tabLanguage: "Dil & Görünüm",
      languageTitle: "Platform Dili",
      languageSubtitle: "Deloop arayüzünde kullanmak istediğiniz dili seçin.",
      selectLanguage: "Dil Seçimi",
      save: "Kaydet",
      savedToast: "Ayarlar başarıyla kaydedildi.",
    },
  },
  az: {
    nav: {
      home: "Ana Səhifə",
      explore: "Kəşf Et",
      newPost: "Yeni Post",
      notifications: "Bildirişlər",
      messages: "Mesajlar",
      profile: "Profil",
      settings: "Ayarlar",
      login: "Daxil Ol",
      logout: "Çıxış",
      searchPlaceholder: "Axtar...",
    },
    feed: {
      noPosts: "Hələ post yoxdur",
      noPostsDesc: "İlk postu paylaşan siz olun!",
      createPost: "Post Paylaş",
      like: "Bəyən",
      liked: "Bəyənildi",
      comment: "Rəy Yaz",
      share: "Paylaş",
      linkCopied: "Link kopyalandı",
      addComment: "Rəy əlavə et...",
      postComment: "Paylaş",
      suggestions: "Sizin Üçün Təkliflər",
      seeAll: "Hamısına Bax",
      follow: "Təqib Et",
      following: "Təqibdədir",
    },
    profile: {
      editProfile: "Profili Düzəlt",
      follow: "Təqib Et",
      following: "Təqibdədir",
      directMessage: "Direkt (DM)",
      posts: "post",
      followers: "təqibçi",
      followingCount: "təqib edilən",
      gridTab: "POSTLAR",
      feedTab: "AXIN",
      githubTab: "GITHUB",
      notFound: "Tərtibatçı Tapılmadı",
      backToDevs: "Tərtibatçılara Qayıt",
    },
    messages: {
      title: "Direkt Mesajlar",
      searchUsers: "Tərtibatçı axtar...",
      writeMessage: "Mesaj yazın...",
      send: "Göndər",
      selectUser: "Yazışmaq üçün bir tərtibatçı seçin.",
      startConversation: "Söhbətə başlayın! Bir-birinizə mesaj yazın.",
      viewProfile: "Profilə Bax",
      loading: "Mesajlar yüklənir...",
    },
    notifications: {
      title: "Aktivlik Bildirişləri",
      subtitle: "Bəyənmələri, şərhləri və yeni təqibçiləri izləyin",
      markAllRead: "Hamısını oxunmuş et",
      empty: "Hələ bildiriş yoxdur.",
      newBadge: "yeni",
      followedYou: "sizi təqib etməyə başladı.",
      likedYourProject: "adlı layihənizi bəyəndi.",
      commentedOnYourProject: "adlı layihənizə rəy yazdı.",
    },
    settings: {
      title: "Hesab Ayarları",
      subtitle: "Profilinizi, sosial bağlantılarınızı və dil seçiminizi idarə edin.",
      tabProfile: "Profil Məlumatları",
      tabSocial: "Sosial & GitHub",
      tabSecurity: "Təhlükəsizlik",
      tabLanguage: "Dil & Görünüş",
      languageTitle: "Platforma Dili",
      languageSubtitle: "Deloop interfeysində istifadə etmək istədiyiniz dili seçin.",
      selectLanguage: "Dil Seçimi",
      save: "Yadda Saxla",
      savedToast: "Ayarlar yadda saxlanıldı.",
    },
  },
  en: {
    nav: {
      home: "Home",
      explore: "Explore",
      newPost: "New Post",
      notifications: "Notifications",
      messages: "Messages",
      profile: "Profile",
      settings: "Settings",
      login: "Log In",
      logout: "Log Out",
      searchPlaceholder: "Search...",
    },
    feed: {
      noPosts: "No posts yet",
      noPostsDesc: "Be the first to share a post!",
      createPost: "Create Post",
      like: "Like",
      liked: "Liked",
      comment: "Comment",
      share: "Share",
      linkCopied: "Link copied to clipboard",
      addComment: "Add a comment...",
      postComment: "Post",
      suggestions: "Suggested for You",
      seeAll: "See All",
      follow: "Follow",
      following: "Following",
    },
    profile: {
      editProfile: "Edit Profile",
      follow: "Follow",
      following: "Following",
      directMessage: "Message (DM)",
      posts: "posts",
      followers: "followers",
      followingCount: "following",
      gridTab: "POSTS",
      feedTab: "FEED",
      githubTab: "GITHUB",
      notFound: "Developer Not Found",
      backToDevs: "Back to Developers",
    },
    messages: {
      title: "Direct Messages",
      searchUsers: "Search developers...",
      writeMessage: "Type a message...",
      send: "Send",
      selectUser: "Select a developer to start messaging.",
      startConversation: "Start a conversation! Send your first message.",
      viewProfile: "View Profile",
      loading: "Loading messages...",
    },
    notifications: {
      title: "Activity Notifications",
      subtitle: "Track likes, comments and new followers here",
      markAllRead: "Mark all as read",
      empty: "No notifications yet.",
      newBadge: "new",
      followedYou: "started following you.",
      likedYourProject: "liked your project.",
      commentedOnYourProject: "commented on your project.",
    },
    settings: {
      title: "Account Settings",
      subtitle: "Manage your profile details, social links, and language preferences.",
      tabProfile: "Profile Details",
      tabSocial: "Social & GitHub",
      tabSecurity: "Security",
      tabLanguage: "Language & Theme",
      languageTitle: "Platform Language",
      languageSubtitle: "Choose the language for the Deloop interface.",
      selectLanguage: "Language Selection",
      save: "Save",
      savedToast: "Settings saved successfully.",
    },
  },
};

export function getSavedLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("deloop_lang") as Language;
    if (saved && (saved === "tr" || saved === "az" || saved === "en")) {
      return saved;
    }
  }
  return "tr"; // Default to Turkish as requested
}

export function setSavedLanguage(lang: Language): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("deloop_lang", lang);
    window.dispatchEvent(new Event("deloop_lang_changed"));
  }
}
