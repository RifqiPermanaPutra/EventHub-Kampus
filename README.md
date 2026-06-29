# KampusHub - Platform Event Kampus

KampusHub adalah aplikasi web terintegrasi untuk manajemen kegiatan (event) di lingkungan kampus. Sistem ini menghubungkan penyelenggara acara (panitia/organisasi) dengan peserta (mahasiswa), lengkap dengan fitur RSVP dan tiket elektronik berbasis QR Code.

## Fitur Utama
- **Role-Based Access Control**: Mendukung 3 peran (Mahasiswa, Panitia, Admin).
- **RSVP & E-Ticket**: Pendaftaran acara dengan pembuatan QR Code instan.
- **Ticket Scanner**: Validasi kehadiran instan menggunakan kamera *smartphone* panitia.
- **Dashboard Manajemen**: Sistem persetujuan (*approval*) event oleh Admin.

## Tech Stack
- Frontend: React 19, TypeScript, React Router, Vite
- Styling: Tailwind CSS v4, Framer Motion
- Backend & Database: Firebase Authentication & Cloud Firestore
- Utilities: `html5-qrcode` (Scanner), `qrcode.react` (Generator)

## Cara Menjalankan (Run Locally)

1. Pastikan Anda telah menginstal Node.js
2. Install semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan *development server*:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses `http://localhost:3000`
