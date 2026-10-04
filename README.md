# 🚀 DevHub - Professional Full-Stack Developer Platforması

**DevHub** proqramçılar üçün professional Full-Stack portfolio, layihə paylaşım platforması və developer şəbəkəsidir (GitHub + Portfolio + Developer Network).

Bu layihə Full-Stack kursunun final işi üçün hazırlanmışdır və generic AI template hissiyyatından uzaq, real developer təcrübəsinə uyğun, kod strukturu aydın və izahı asan şəkildə qurulmuşdur.

---

## 📋 1. LAYİHƏNİN MƏQSƏDİ

DevHub proqramçılara aşağıdakı imkanları təqdim edir:
- **Professional Profil:** Öz texnoloji bacarıqlarını, bio, məkan və sosial keçidlərini təqdim etmək.
- **GitHub Inteqrasiyası:** GitHub istifadəçi adı vasitəsilə canlı repozitoriyaları, ulduzları və dillər üzrə statistikanı göstərmək.
- **Full-Stack Layihə İdarəetməsi (CRUD):** Layihə yaradılması, redaktə olunması, silinməsi və statuslarının (Completed, In Progress, Planning) təyini.
- **İnteraktiv Developer Şəbəkəsi:** Digər proqramçıları follow/unfollow etmək, layihələri bəyənmək (like) və rəy bildirmək (comment).
- **Real-Time & Database Bildirişlər:** İzləmə, bəyənmə və şərh əməliyyatlarında avtomatik bildirişlər.
- **Qorunan Admin Paneli:** Platforma üzrə ümumi statistika, istifadəçilərin və layihələrin idarə edilməsi.

---

## 🛠 2. İSTİFADƏ OLUNAN TEXNOLOGİYALAR

- **Frontend Framework:** Next.js 15 (App Router)
- **UI & Logic:** React 19, TypeScript
- **Styling:** Tailwind CSS (Custom Dark Mode IDE Theme, tünd estetik)
- **Animasiya və İkonlar:** Framer Motion, Lucide React
- **Statistika Qrafikləri:** Recharts (AreaChart, PieChart)
- **Database & Authentication:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Xarici API Inteqrasiyası:** GitHub REST API v3

---

## 📁 3. QOVLUQ STRUKTURU (FOLDER STRUCTURE)

Müəllimə layihəni izah edərkən faylları bu ardıcıllıqla göstərə bilərsiniz:

```text
devhub/
├── app/                            # Next.js App Router səhifələri
│   ├── page.tsx                    # Landing Page (Hero, Xüsusiyyətlər, Featured Devs & Projects)
│   ├── layout.tsx                  # Ümumi Layout (Navbar, Footer, ToastProvider)
│   ├── globals.css                 # Qlobal dark-mode styling və arxa fon grid effekti
│   ├── login/page.tsx              # Supabase Auth Login səhifəsi
│   ├── register/page.tsx           # Supabase Auth Qeydiyyat səhifəsi
│   ├── forgot-password/page.tsx    # Şifrə bərpası səhifəsi
│   ├── reset-password/page.tsx     # Yeni şifrə təyin edilməsi
│   ├── dashboard/page.tsx          # İstifadəçi Paneli və Recharts qrafikləri
│   ├── developers/                 # Developer kəşfiyyatı və profil səhifəsi
│   │   ├── page.tsx                # Developer-ləri axtarış və skill filteri
│   │   └── [username]/page.tsx     # İctimai Developer Profil & GitHub statistikası
│   ├── projects/                   # Layihələr bölməsi
│   │   ├── page.tsx                # Layihələr siyahısı və kateqoriya filteri
│   │   ├── new/page.tsx            # Yeni layihə əlavə etmə formu
│   │   └── [id]/                   # Layihə ətraflı baxış
│   │       ├── page.tsx            # Layihə detalları, Like və Şərhlər
│   │       └── edit/page.tsx       # Layihə redaktə etmə formu
│   ├── notifications/page.tsx      # Bildirişlər siyahısı (Read/Unread)
│   ├── settings/page.tsx           # Profil tənzimləmələri və sosial linklər
│   ├── admin/page.tsx              # Qorunan Admin idarəetmə paneli
│   └── api/github/route.ts         # Server-side GitHub API handler (Proxy)
│
├── components/                     # Təkrar istifadə oluna bilən UI Komponentləri
│   ├── Navbar.tsx                  # Desktop və Mobil responsive menyu
│   ├── Sidebar.tsx                 # Dashboard və Tənzimləmələr üçün Sidebar
│   ├── DeveloperCard.tsx           # Developer profil kartı (Follow düyməsi ilə)
│   ├── ProjectCard.tsx             # Layihə kartı (Like, comment və tech badge-lər)
│   ├── ProjectForm.tsx             # Layihə yaratmaq və redaktə etmək üçün formalı komponent
│   ├── CommentSection.tsx          # Layihə altındakı real-time şərh sistemi
│   ├── GitHubStatsCard.tsx         # GitHub API məlumatlarının nümayişi
│   ├── StatCard.tsx                # Dashboard indikator kartları
│   ├── TechBadge.tsx               # Texnologiya etiketləri (React, Next.js, Python və s.)
│   ├── Modal.tsx                   # Silinmə təsdiqi pəncərələri (Popups)
│   ├── Toast.tsx                   # Əməliyyat bildirişləri (Toasts)
│   └── Skeleton.tsx                # Yüklənmə vaxtı göstərilən şimmer animasiyaları
│
├── lib/                            # Köməkçi məntiq və Supabase bağlantıları
│   ├── supabase/
│   │   ├── client.ts               # Browser üçün Supabase Client
│   │   └── store.ts                # Real-time / Offline data store idarəedicisi
│   ├── github.ts                   # GitHub REST API çəkiliş funksiyaları
│   ├── mock-data.ts                # İlk demo məlumatlar seti
│   └── utils.ts                    # Tarix və formatlama köməkçiləri
│
├── types/
│   └── index.ts                    # TypeScript Tipləri (Profile, Project, Comment, Like, Follow və s.)
│
├── supabase/
│   └── schema.sql                  # Supabase PostgreSQL DDL SQL skripti (RLS və Triggers daxil)
│
├── .env.local                      # Environment dəyişənləri
└── README.md                       # İzahlı sənəd
```

---

## 🗄 4. DATABASE STRUKTURU (SUPABASE POSTGRESQL)

Database 8 əsas bağlı cədvəldən ibarətdir (`supabase/schema.sql` faylında yerləşir):

1. **`profiles`:** İstifadəçinin profil məlumatları (`id`, `username`, `full_name`, `avatar_url`, `bio`, `location`, `github_username`, `role`).
2. **`skills`:** Platformada dəstəklənən bacarıqlar.
3. **`profile_skills`:** İstifadəçilər və bacarıqlar arasında çoxun-çoxuna (Many-to-Many) ilişki.
4. **`projects`:** Layihə məlumatları (`title`, `description`, `cover_image`, `technologies`, `category`, `status`, `views_count`).
5. **`project_likes`:** Layihə bəyənmələri (Unique Constraint ilə təkrar like-ın qarşısı alınır).
6. **`comments`:** Layihə şərhləri.
7. **`follows`:** İstifadəçi izləmələri (`follower_id` və `following_id`).
8. **`notifications`:** İzləmə, bəyənmə və şərh bildirişləri (`is_read` statusu ilə).

### Row Level Security (RLS) & Triggers:
- **Automatic Profile Trigger (`handle_new_user`):** Qeydiyyat zamanı `auth.users` cədvəlində yeni istifadəçi yarandıqda avtomatik `public.profiles` cədvəlində profil sətri yaradılır.
- **RLS Polisilər:** Hər bir istifadəçi yalnız özünə aid olan layihələri redaktə/silə bilər. Şəxsi bildirişləri yalnız həmin istifadəçi oxuya bilər.

---

## 🔐 5. AUTHENTICATION VƏ SECURITY

- **Supabase Auth:** Email və Şifrə vasitəsilə təhlükəsiz authentication.
- **Unikal Username:** Qeydiyyat zamanı unikal username yoxlanışı aparılır.
- **Protected Routes:** Giriş etməmiş istifadəçi Şəxsi Dashboard, Layihə Yaradılması və Tənzimləmələr səhifələrinə daxil olduqda login səhifəsinə yönləndirilir.
- **Admin Access Check:** `/admin` marşrutu yalnız `role === "admin"` olan istifadəçilərə açıqdır.

---

## 🐙 6. GITHUB API İNTEQRASİYASI

`lib/github.ts` faylı vasitəsilə:
- GitHub username daxil edildikdə GitHub REST API (`https://api.github.com/users/{username}`) çağırılır.
- İstifadəçinin public repozitoriyaları, ümumi ulduz (star) sayı, followers/following sayı və repozitoriyalarda istifadə olunan ən çox dillər hesbalanır.
- Rate limit aşılmasın deyə server-side API Handler (`app/api/github/route.ts`) istifadə olunur.
- GitHub API şəbəkə xətası verdikdə sayt çökmür; səliqəli fallback UI göstərilir.

---

## 🚀 7. LAYİHƏNİ LOCALDA İŞƏ SALMAQ ÜÇÜN

1. Terminalda layihə qovluğuna daxil olun:
   ```bash
   cd "c:\Users\User\Desktop\final fayl"
   ```

2. Asılılıqları (dependencies) yoxlayın:
   ```bash
   pnpm install
   ```

3. Serveri işə salın:
   ```bash
   pnpm dev
   ```

4. Brauzerdə daxil olun:
   `http://localhost:3000`

---

## ⚙️ 8. ENVIRONMENT VARIABLES (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GITHUB_TOKEN=your-optional-github-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎓 9. MÜƏLLİMƏ TƏQDİMAT ZAMANI İZAH OLUNACAQ ƏSAS NÖQTƏLƏR

Müəllim qarşısında kodları göstərərkən bu cümlələrdən istifadə edə bilərsiniz:

1. **Struktur:** *"Müəllim, layihədə Next.js App Router istifadə etmişəm. `app` qovluğunda bütün səhifələr marşrutlar üzrə ayrılıb: landing page, dashboard, developers, projects və admin."*
2. **Komponentlər:** *"UI elementlərini `components` qovluğunda modulyar yazmışam. Məsələn, `DeveloperCard`, `ProjectCard`, `ProjectForm` və `GitHubStatsCard` istənilən səhifədə təkrar istifadə olunur."*
3. **Database:** *"Database kimi Supabase PostgreSQL istifadə etmişəm. Cədvəllər arasında Foreign Key ilişkisi var. `schema.sql` faylında RLS polisilərini və avtomatik trigger funksiyasını hazırlamışam."*
4. **API:** *"GitHub inteqrasiyasını `lib/github.ts` daxilində yazmışam. Server-side API Handler istifadə edərək GitHub-dan repozitoriyaları və dilləri çəkirəm."*
5. **UX:** *"İstifadəçiyə dərhal rəy vermək üçün Toast bildirişləri, silinmə confirmation modalı və yüklənmə vaxtı Skeleton loader-lər əlavə etmişəm."*
#   D e l o o p  
 