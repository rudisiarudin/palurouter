# Panduan Install PALU Router v1.0.0 di PC / Laptop Rumah

## Prasyarat
1. Node.js v20+ atau v22+ terpasang di PC.
2. Port 20128 tidak dipakai aplikasi lain.

---

## Langkah 1: Ekstrak ZIP
Ekstrak file **palu-router-v1.0.0.zip** ke folder tujuan, misal:
- Windows: `D:Webpalurouter` atau `C:palurouter`
- Linux/Mac: `~/palurouter`

---

## Langkah 2: Install Dependencies
Buka terminal / CMD / PowerShell di dalam folder ekstrak:
```bash
npm install
```

---

## Langkah 3: Menjalankan PALU Router

### A. Mode Development (Praktis & Ringan)
```bash
npm run dev
```
Buka browser di:
👉 **http://localhost:20128**

### B. Mode Production (Kompilasi Penuh)
```bash
npm run build
npm run start
```

---

## Langkah 4: Konfigurasi Supabase (Opsional)
Jika ingin menggunakan Supabase cloud database daripada SQLite lokal:
1. Buka Supabase Dashboard -> **SQL Editor**.
2. Copy seluruh isi file `supabase_schema.sql` dan jalankan (Run) untuk membuat tabel & RLS.
3. Buat file `.env` di root project dan masukkan connection string Supabase pooler:
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```
4. Jalankan `npm run dev`. PALU Router otomatis terhubung ke Supabase!

---

## Fitur Utama yang Sudah Terpasang:
- **Dual Database Engine (Supabase PostgreSQL & SQLite Local)**
- **Teal / Slate Modern UI**
- **Sistem Quota Tracker & Saldo Rupiah (Rp x16.000)**
- **Multi-Account & RBAC (Admin & Client Least-Privilege Guard)**
- **Google OAuth / OIDC Integration (Bonus balance Rp 5.000 untuk pendaftaran baru)**
- **Commercial Landing Page Modern**

Tetap Gesit! 🚀
