# JobTrack

JobTrack adalah aplikasi web berbahasa Indonesia untuk mengelola lamaran kerja, agenda, tugas, dokumen privat, pengingat, dan insight pencarian kerja. Implementasi akun menggunakan Next.js App Router serta Supabase Auth, PostgreSQL dengan Row Level Security (RLS), dan Storage privat. Mode demo terpisah menyediakan data fiktif yang persisten di browser tanpa menulis ke akun Supabase.

## Status publik

- **URL produksi:** belum dideploy.
- **Backend hosted:** belum ada project Supabase hosted yang didokumentasikan atau diverifikasi.
- **Source hosting:** workspace lokal ini tidak memiliki Git remote atau repository GitHub publik.
- **Auth/SMTP produksi dan smoke test produksi:** belum dikonfigurasi atau dijalankan.
- **Screenshot produksi:** belum ada URL publik. Capture lokal ada di `artifacts/`, tetapi direktori tersebut diabaikan Git dan bersifat transien; capture final pasca-fitur untuk publikasi masih pending. Gambar lama tidak dianggap bukti produksi.

## Fitur yang tersedia

- Auth email/kata sandi: daftar, masuk, konfirmasi email, lupa/reset kata sandi, callback PKCE, cookie sesi, proteksi route, dan onboarding nama/zona waktu.
- Lamaran Supabase-backed untuk akun terautentikasi: tambah/edit/hapus, Kanban/tabel, pencarian/filter, catatan, riwayat status, dan arsip/pulihkan.
- Kalender dan tugas Supabase-backed dengan CRUD, relasi opsional ke lamaran, konversi zona waktu, unduhan `.ics`, dan tautan event ke Google Calendar.
- Pustaka dokumen Supabase-backed: upload, relasi ke lamaran, unduhan dengan signed URL 60 detik, dan penghapusan dari bucket Storage privat.
- Profil/pengaturan Supabase-backed, ekspor data akun JSON, dan alur penghapusan akun server-only.
- Sepuluh status lamaran: `saved`, `preparing`, `applied`, `screening`, `interview`, `technical_test`, `offer`, `accepted`, `rejected`, dan `withdrawn`.
- Pengingat in-app untuk agenda/tugas, status baca/tutup yang persisten, serta izin Notification API opsional saat aplikasi terbuka. Tidak ada push/background worker atau email reminder.
- Analisis kecocokan CV terhadap deskripsi pekerjaan, mendukung teks Indonesia/Inggris dan input tempel atau PDF/DOCX. Ekstraksi memakai PDF.js/Mammoth dan analisis deterministik berjalan lokal di browser tanpa AI eksternal secara default.
- Statistik dari data lamaran aktif, tema terang/gelap, UI responsif, dan mode demo lokal.

## Status implementasi

| Area                  | Implementasi terbaru                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth dan onboarding   | Terhubung ke Supabase bila public environment tersedia; profile trigger dan onboarding upsert tersedia.                                                                                                              |
| Lamaran dan statistik | Akun terautentikasi membaca/menulis Supabase; statistik menghitung data provider lamaran.                                                                                                                            |
| Kalender dan tugas    | Akun terautentikasi memakai tabel `calendar_events`/`tasks`; CRUD tersedia.                                                                                                                                          |
| Dokumen               | Akun terautentikasi memakai metadata Postgres dan bucket `documents` privat; hanya PDF/DOCX, maksimal 10 MiB.                                                                                                        |
| Profil dan pengaturan | Nama/zona waktu disimpan ke `profiles`; ekspor akun dan permintaan penghapusan tersedia. Tema tetap preferensi browser.                                                                                              |
| Pengingat             | Tabel `reminders` dengan RLS tersedia; pusat pengingat menampilkan rentang jatuh tempo sampai 72 jam ke depan. Pembuatan reminder tersedia di server action/repository, tetapi UI penjadwalan khusus belum diekspos. |
| Mode demo             | Terisolasi dari Supabase, memakai fixture fiktif dan `localStorage`; tidak memerlukan akun.                                                                                                                          |
| Analisis CV vs JD     | Aktif di browser dengan skor berbobot 100, istilah bilingual, PDF.js, dan Mammoth; bukan ATS atau AI generatif.                                                                                                      |
| Deployment            | Belum ada deployment, hosted Supabase, SMTP produksi, smoke test produksi, atau screenshot produksi publik.                                                                                                          |

## Semantik status dan arsip

Dua status pra-pengiriman adalah `saved` dan `preparing`; status `applied` sampai `withdrawn` dianggap pernah dikirim. `applied_at` diisi saat pertama kali masuk status terkirim dan tidak dikosongkan ketika status bergerak mundur. Setiap transisi status nyata membuat satu row history append-only; no-op tidak menambah history.

Arsip **bukan status ke-11**. RPC `set_application_archived` mengisi atau mengosongkan `archived_at` tanpa mengubah status dan tanpa membuat history status. Query aktif, statistik, dan pilihan relasi mengabaikan lamaran yang diarsipkan; lamaran dapat dipulihkan.

## Arsitektur

```text
Browser
├── Next.js Client Components dan Supabase public client
├── mode demo: fixture + localStorage terpisah
└── analisis CV/JD + ekstraksi PDF/DOCX lokal

Next.js server
├── proxy: validasi Auth, refresh cookie, onboarding, demo cookie
├── Server Components/actions: lamaran, kalender, tugas, profil, pengingat
├── route handlers: upload dokumen, ICS, ekspor, hapus akun
└── public Supabase client per request; admin client hanya untuk hapus akun

Supabase
├── Auth
├── Postgres + RLS + owner-scoped foreign keys
└── bucket `documents` privat + signed URL
```

`src/proxy.ts` mengizinkan `/dashboard?demo=true`, menetapkan cookie demo selama 24 jam, dan melewati query Supabase untuk route terlindungi selama mode itu aktif. `/dashboard?demo=false` menghapus cookie. Untuk akun, `getUser()` memvalidasi sesi dan profile yang belum menyelesaikan onboarding diarahkan ke `/onboarding`. Redirect proxy hanya UX; RLS dan Storage policy adalah batas otorisasi.

Lapisan data akun memakai repository Supabase untuk lamaran, kalender, tugas, dokumen, dan pengingat. Dashboard/statistik mengonsumsi data lamaran tersebut. Beberapa copy ringkasan dashboard masih bertanggal/bersifat statis, dan panel ringkasan agenda/tugas dashboard utama belum menampilkan data akun, meskipun workspace Kalender dan Tugas sudah Supabase-backed.

Detail tersedia di [arsitektur](docs/architecture.md), [keamanan](docs/security.md), [migrasi](docs/migrations.md), dan [deployment](docs/deployment.md).

## Struktur folder

```text
jobtrack/
├── .github/workflows/ci.yml       # quality, browser, Supabase integration
├── docs/                          # architecture, security, migration, deployment
├── examples/                      # data teks fiktif untuk pengembangan
├── src/
│   ├── app/                       # 24 route hasil build: UI, actions, API
│   ├── components/                # auth, dashboard, domain workspaces
│   ├── data/                      # fixture fiktif khusus demo
│   ├── lib/                       # repositories, Supabase, analyzer, ICS, akun
│   ├── store/                     # store demo browser
│   └── types/                     # tipe domain
├── supabase/
│   ├── migrations/                # foundation, profile insert, reminders
│   ├── tests/                     # pgTAP
│   └── seed.sql                   # seed lokal opsional
├── tests/
│   ├── e2e/                       # Playwright desktop/mobile
│   ├── integration/               # local two-user RLS/Storage
│   └── support/                   # auth/API stub untuk E2E
├── .env.example
└── package.json
```

## Database, RLS, dan Storage

Migration yang diterapkan berurutan:

1. `20260908000000_jobtrack_foundation.sql`: schema domain, enum, index, trigger, RLS, RPC status/arsip, dan bucket.
2. `20260909000000_profiles_insert_own.sql`: recovery profile milik user saat onboarding.
3. `20260909010000_reminders.sql`: tabel reminder, owner foreign keys, index, dan RLS.

Tabel domain mencakup `profiles`, `companies`, `applications`, `application_status_history`, `contacts`, `interviews`, `calendar_events`, `tasks`, `reminders`, `documents`, `document_applications`, dan `activities`. Semua tabel aplikasi memakai RLS. Child record memakai composite owner foreign key agar user tidak dapat mereferensikan parent milik user lain.

Alur dokumen akun menerima **PDF dan DOCX saja**, masing-masing maksimal **10 MiB**. UI dan service memvalidasi ekstensi/MIME/ukuran, menulis object ke `<user-id>/<document-id>/file.<ext>`, lalu metadata dan relasi. Kegagalan metadata/link memicu cleanup best-effort yang melaporkan bila tidak tuntas. Unduhan memakai signed URL 60 detik. Saat penghapusan satu dokumen, object dihapus lebih dulu; bila gagal metadata dipertahankan agar retry memungkinkan. Migration foundation historis juga mencantumkan MIME DOC/text pada bucket, tetapi aplikasi terbaru sengaja tidak menerima atau mengklaim dukungan DOC/text.

## Instalasi lokal

### Prasyarat

- Node.js 22 dan npm
- Docker Desktop/Engine untuk stack Supabase lokal
- Supabase CLI melalui `npx`
- Chromium Playwright untuk E2E (`npx playwright install chromium`)

Workspace ini belum memiliki remote publik, jadi tidak ada URL clone yang dapat diberikan. Dari checkout lokal:

```bash
npm ci
cp .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev
```

Perintah `cp` bekerja di Git Bash; di PowerShell gunakan `Copy-Item .env.example .env.local`. Salin `API_URL` serta `PUBLISHABLE_KEY` atau `ANON_KEY` dari `npx supabase status --output env` ke `.env.local`. Jangan menyalin service-role key kecuali sedang menguji endpoint penghapusan akun di server lokal.

Landing page, build, dan mode demo tetap dapat dipakai tanpa Supabase public environment. Route akun non-demo akan diarahkan ke login/configuration error.

## Variabel lingkungan

| Nama                                   | Scope            | Keterangan                                                                      |
| -------------------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Browser + server | Origin kanonis utama tanpa trailing slash; fallback metadata ke site URL/lokal. |
| `NEXT_PUBLIC_SITE_URL`                 | Browser + server | Alias kompatibilitas untuk origin kanonis.                                      |
| `NEXT_PUBLIC_SUPABASE_URL`             | Browser + server | URL API project lokal/hosted.                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Public key yang disarankan.                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Browser + server | Fallback legacy; set salah satu public key.                                     |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only      | Diperlukan hanya oleh `DELETE /api/account`; melewati RLS.                      |

Tidak ada `AI_API_KEY`, `AI_PROVIDER`, atau `AI_MODEL` yang dipakai implementasi. Analisis inti tidak mengirim dokumen ke provider eksternal. Variabel khusus test (`PLAYWRIGHT_*`, `JOBTRACK_AUTH_STUB_PORT`) diatur oleh konfigurasi test, bukan deployment aplikasi.

## Mode demo

Mode demo dibuka melalui `/dashboard?demo=true` atau tombol demo dan bekerja tanpa sesi Supabase. Cookie HTTP-only memilih backend demo; seluruh mutation demo tetap lokal dan tidak membaca/menulis data akun.

- Lamaran, status/history, arsip, catatan, kalender, tugas, dan data dokumen awal berasal dari fixture lalu persisten melalui store `jobtrack.demo.v1` di `localStorage`.
- Read/dismiss reminder demo persisten di `jobtrack.demo.reminders.v1`.
- Upload dokumen demo hanya menambah metadata untuk sesi komponen; byte file tidak disimpan dan tidak dapat diunduh.
- Profil demo yang diedit tidak dipersistenkan setelah reload; tema tersimpan di `jobtrack-theme`.
- Ekspor demo mengunduh snapshot store JSON. Reset demo memulihkan fixture/preferences lokal.
- Kontrol penghapusan akun demo adalah no-op yang tidak memanggil endpoint server.

Data demo bersifat fiktif dan terisolasi. Jangan memakai mode demo untuk menyimpan data pribadi.

## Analisis CV versus deskripsi pekerjaan

Halaman aktif memakai `analyzeCv` yang sama dengan library teruji. Pengguna dapat menempel teks atau mengekstrak **PDF/DOCX maksimal 10 MiB** untuk CV dan job description. PDF.js membaca teks PDF; Mammoth membaca raw text DOCX. PDF pindaian tanpa text layer memerlukan OCR di luar JobTrack; PDF terenkripsi dan file malformed ditolak.

Analyzer deterministik memberi total bobot 100:

| Pemeriksaan          | Bobot |
| -------------------- | ----: |
| Kecocokan keahlian   |    35 |
| Kecocokan kata kunci |    20 |
| Kecocokan bidang     |    10 |
| Struktur CV          |    10 |
| Dampak terukur       |    10 |
| Bahasa aktif         |     5 |
| Keterbacaan          |     5 |
| Kontak profesional   |     5 |

Kamus konsep, heading, stopword, dan action verb mendukung pola Indonesia/Inggris. Analyzer mengecualikan baris/sinyal atribut sensitif yang dikenal dari scoring, menampilkan istilah cocok/hilang dan saran, serta tidak merangking kandidat. Teks dan hasil berada di browser; tidak diunggah oleh fitur ini dan tidak ada AI eksternal secara default.

> Analisis ini bukan ATS vendor, bukan penilaian kandidat, dan tidak menjamin hasil rekrutmen.

## Ekspor dan penghapusan akun

Ekspor akun terautentikasi menghasilkan JSON versioned dan paginated berisi email/id akun serta row milik user dari profile, perusahaan, lamaran/history, kontak, wawancara, agenda, tugas, reminder, metadata/relasi dokumen, dan aktivitas. Ekspor **tidak berisi byte object Storage**, `storage_path`, `extracted_text`, signed URL, password, secret, atau token. Karena itu ekspor bukan backup file lengkap.

Penghapusan akun memerlukan frasa konfirmasi, autentikasi ulang kata sandi di browser langsung ke Supabase Auth, origin same-site, sesi tervalidasi, dan `SUPABASE_SERVICE_ROLE_KEY` server-only. Server:

1. menelusuri object bucket di prefix user dengan pagination;
2. menghapus object dalam batch;
3. baru memanggil Admin Auth `deleteUser`; cascade database membersihkan profile dan row turunannya.

Ini bukan transaksi lintas Storage/Auth/Postgres. Jika Storage gagal, Auth/database dipertahankan untuk retry. Jika semua object sudah terhapus tetapi Auth deletion gagal, akun/database tetap ada sementara file telah hilang; operator harus retry/investigasi. Implementasi telah diuji dengan mock dan validasi kode/lokal, tetapi **belum pernah diuji destruktif pada production**. Tanpa admin key endpoint mengembalikan 503 dan tidak menghapus apa pun.

## Pengujian dan bukti lokal

Script kanonis:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
npm run test:integration
npm audit --omit=dev --audit-level=high
```

Hasil lokal terbaru pada 10 September 2026 (snapshot, bukan jaminan run berikutnya):

| Pemeriksaan                            | Hasil                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Prettier, ESLint, TypeScript           | lulus setelah artifact coverage hasil generate dibersihkan; dokumentasi divalidasi lagi setelah edit ini    |
| Vitest + coverage                      | **34 file / 93 test lulus**                                                                                 |
| Coverage V8                            | **57.67% statements, 47.84% branches, 61.49% functions, 59.71% lines**                                      |
| Threshold package                      | statements 55%, branches 45%, functions 55%, lines 55%                                                      |
| Next.js production build               | lulus; **24 route** di manifest build                                                                       |
| Playwright Chromium                    | **8 lulus** (desktop + viewport mobile 375 px) terhadap production server lokal dan Supabase auth/data stub |
| pgTAP                                  | **30 lulus**                                                                                                |
| Local two-user RLS/Storage integration | **1 lulus**; menolak cross-user row/reference/object serta menguji signed URL dan limit Storage             |
| Supabase DB lint                       | tidak ada schema error                                                                                      |
| npm production audit                   | **0 vulnerability**                                                                                         |

CI di `.github/workflows/ci.yml` memiliki job quality (format/lint/typecheck/coverage/build/audit), browser (Playwright terhadap build production), dan Supabase integration (local stack, reset tanpa seed, DB lint, pgTAP, two-user test). Workflow dipicu untuk pull request dan push ke `main`, tetapi karena belum ada remote GitHub publik, tidak ada run hosted yang dapat ditautkan.

## Migrasi dan deployment

Untuk lokal dan CI:

```bash
npx supabase db reset --no-seed
npx supabase db lint --level error
npx supabase test db
npm run test:integration
```

Seed default opsional berisi data fiktif, tidak membuat Auth user, dan dapat membuat metadata dokumen tanpa object Storage. Migration yang sudah dibagikan harus forward-only; gunakan migration kompensasi atau expand-and-contract, jangan edit history yang telah diterapkan.

Belum ada deployment publik. Sebelum production perlu dibuat project Supabase staging/production, menerapkan migration, mengatur Site URL/callback Auth, SMTP produksi, environment deployment, backup/restore, secret rotation, dan smoke test dua user/Storage. Jangan menjalankan `supabase db reset` pada remote. Lihat [panduan deployment](docs/deployment.md).

## Keamanan, privasi, dan free tier

- Public Supabase key memang berada di browser; RLS, composite owner foreign keys, dan Storage policy membatasi akses.
- Bucket harus tetap privat. Jangan log token, service-role key, CV/JD, extracted text, atau signed URL.
- Validasi client bukan satu-satunya kontrol: service mengulang validasi, bucket membatasi ukuran/MIME, dan policy memeriksa prefix pemilik.
- Notification API hanya menghasilkan notifikasi foreground setelah izin; tidak ada service worker, push, background scheduler, atau email reminder.
- Free tier/provider dapat membatasi database, Storage, egress, Auth/email, build, backup/PITR, observability, atau masa aktif dan kebijakannya dapat berubah. Batas aplikasi 10 MiB per dokumen bukan janji kuota provider.

## Keterbatasan dan pekerjaan tersisa

- Belum ada remote/repository publik, hosted Supabase, URL deployment, Auth/SMTP production, production smoke test, atau screenshot production publik.
- Ringkasan dashboard utama masih memuat copy tanggal/hint fiktif dan belum menampilkan agenda/tugas akun, walau workspace domain sudah memakai Supabase.
- UI belum menyediakan form untuk membuat reminder; create server action/repository dan pusat baca/tutup sudah tersedia.
- Reminder hanya foreground/in-app; tidak ada background delivery, push, atau email.
- Analisis tidak menyediakan OCR, tidak menerima legacy DOC/text, dan bukan ATS/AI generatif.
- Ekspor akun tidak menyertakan byte dokumen, storage path, atau extracted text.
- Penghapusan akun belum diuji destruktif pada production dan memiliki kemungkinan partial failure lintas Storage/Auth.
- Capture lokal di `artifacts/` diabaikan Git dan transien; final post-feature capture/publikasi masih pending.
- Belum ada monitoring production, restore drill, import data, kolaborasi, atau integrasi kalender dua arah.

## Kontribusi dan lisensi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk setup dan validation matrix. JobTrack menggunakan [MIT License](LICENSE).
