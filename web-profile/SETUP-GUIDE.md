# Panduan Online-kan Web Profile (GitHub + Cloudflare)

Panduan lengkap dari nol sampai bisa posting sendiri dari web. Ikuti berurutan.
Folder yang di-upload adalah **isi** dari folder tempat `index.html` berada
(folder `web-profile` ini) — jadi `index.html` harus ada di paling atas repo.

Ringkasan hasil akhir:
- Hosting gratis di Cloudflare Pages (bandwidth unlimited).
- Halaman admin dikunci login email (Cloudflare Access) — aman, bisa dari HP.
- Posting artikel/foto/project/NFT langsung dari web → klik Publish → situs
  update sendiri ~1 menit. Tanpa upload manual.

---

## Bagian 1 — Upload ke GitHub (sekali saja)

1. Buka github.com → tombol **New** (buat repository baru).
2. Beri nama, misal `web-profile`. Pilih **Public** (atau Private bila mau; catatan
   keamanan ada di Bagian 5). Klik **Create repository**.
3. Di halaman repo yang masih kosong, klik teks **uploading an existing file**.
4. Buka folder `web-profile` di komputermu. Pilih semua isinya:
   `index.html`, folder `code`, folder `image`, `README.md`, `SETUP-GUIDE.md`.
5. Seret (drag & drop) semua itu ke halaman GitHub.
6. Klik **Commit changes**.

Selesai — tidak perlu install aplikasi apa pun.

> Penting: jangan upload folder `_backup`. Itu cuma cadangan versi lama.

---

## Bagian 2 — Buat Token GitHub (untuk tombol Publish)

Token ini yang membuat tombol "Publish" bisa menyimpan perubahan ke GitHub.

1. GitHub → klik foto profil (kanan atas) → **Settings**.
2. Menu paling bawah: **Developer settings**.
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
4. Isi:
   - **Token name**: bebas, misal `web-profile-admin`.
   - **Expiration**: beri tanggal kedaluwarsa (misal 1 tahun).
   - **Repository access**: pilih **Only select repositories** → pilih repo
     `web-profile`.
   - **Permissions** → **Repository permissions** → cari **Contents** →
     pilih **Read and write**.
5. **Generate token**. Salin token-nya (muncul sekali saja — simpan sementara).

Token hanya akan disimpan di browser kamu nanti, tidak pernah masuk ke situs.

---

## Bagian 3 — Hosting di Cloudflare Pages (gratis)

1. Dashboard Cloudflare → **Workers & Pages** → **Create** → tab **Pages**.
2. **Connect to Git** → sambungkan akun GitHub → pilih repo `web-profile`.
3. **Begin setup**. Isi build settings (ini situs statis, tanpa build):
   - **Framework preset**: None
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `/`
4. **Save and Deploy**. Tunggu ~1 menit. Situs online di alamat seperti
   `namamu.pages.dev`.

Mulai sekarang, setiap kali kamu klik Publish (atau push ke GitHub),
Cloudflare otomatis deploy ulang.

---

## Bagian 4 — Kunci halaman admin (Cloudflare Access, gratis)

Tanpa ini, halaman admin bisa dibuka siapa pun yang tahu alamatnya.

1. Dashboard Cloudflare → **Zero Trust**. Kalau pertama kali, selesaikan setup
   tim dan pilih plan **Free**.
2. **Access** → **Applications** → **Add an application** → **Self-hosted**.
3. Isi:
   - **Application name**: `Web Profile Admin`
   - **Session Duration**: bebas (misal 24 jam).
   - **Application domain**: `namamu.pages.dev`, **Path**: `code/admin`
4. **Next** → buat **Policy**:
   - **Policy name**: `Only me`
   - **Action**: Allow
   - **Include** → **Emails** → masukkan email kamu.
5. Simpan. Metode login default **One-time PIN** (kode dikirim ke email).
6. (Opsional) ulangi Add application untuk Path `code/login.html` juga.

Hasil: buka `/code/admin` minta kode email dulu. Dari HP mana pun bisa, aman.

---

## Bagian 5 — Cara posting (setelah semua jalan)

1. Buka `namamu.pages.dev/code/admin/articles.html`.
2. Lewati gerbang Cloudflare (masukkan kode dari email).
3. **Sekali saja**: buka menu **Settings (GitHub)** di sidebar admin. Isi:
   - **GitHub username (owner)**: username GitHub kamu.
   - **Repository name**: `web-profile`
   - **Branch**: `main`
   - **Access token**: tempel token dari Bagian 2.
   - Klik **Save** lalu **Test connection** (harus muncul "Connected to ...").
4. Sekarang tinggal pakai:
   - **Write Article** — tulis artikel, bisa filter kategori.
   - **Photo Gallery** — upload foto (maks 10 tampil), tiap foto punya halaman.
   - **NFT Gallery** — upload item, isi Chain + Link.
   - **Project Showcase** — tambah project, tiap project punya halaman sendiri.
   - **Profile & About** — ganti foto profil (bisa crop bulat) + teks About.
   - **Image Library** — lihat semua gambar yang terpakai.
5. Setelah edit, klik **Publish to GitHub**. ~1 menit situs update sendiri.

Foto ikut tersimpan di dalam file data, jadi Publish satu kali membawa semuanya.

---

## Ganti username & password admin

Login bawaan hanya "pagar" ringan (Cloudflare Access yang mengamankan sungguhan).
Untuk ganti: buka file `code/login.html`, cari 2 baris ini di dekat bawah:

    var ADMIN_USER = "admin";
    var ADMIN_PASS = "admin123";

Ganti isinya, simpan, lalu Publish/push.

---

## Catatan keamanan

- Repo **Public**: semua kode (termasuk `login.html`) bisa dibaca orang. Login
  bawaan jadi tidak rahasia — itulah kenapa Cloudflare Access dipakai sebagai
  kunci utama.
- Mau kode ikut tersembunyi: pakai repo **Private**. Cloudflare Pages tetap bisa
  deploy dari repo private.
- Token GitHub aman karena hanya tersimpan di browser kamu, bukan di situs.
  Pakai token fine-grained yang dibatasi ke 1 repo + Contents write + ada expiry.

---

## Opsional (kalau nanti perlu)

- Foto jadi **file terpisah** di folder `image/` (bukan base64) — lebih ringan
  kalau foto sudah banyak (puluhan+).
- Rapikan struktur folder yang agak bertingkat (`web-profile/web-profile`).
