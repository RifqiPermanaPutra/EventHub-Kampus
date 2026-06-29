# Dokumentasi Sistem KampusHub

Berikut adalah kode Mermaid untuk Entity-Relationship Diagram (ERD) dan Flowchart sistem kita. Anda bisa menyalin kode di bawah ini dan menempelkannya ke [Mermaid Live Editor](https://mermaid.live/) atau menggunakannya langsung di aplikasi Markdown/Notion Anda.

## 1. Entity-Relationship Diagram (ERD)

ERD ini mencakup seluruh struktur data yang kita simpan di Firebase Firestore, lengkap dengan semua *field* dan relasi antar koleksinya.

```mermaid
erDiagram
    USERS ||--o{ EVENTS : "creates (Panitia)"
    USERS ||--o{ RSVPS : "makes"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    EVENTS ||--o{ RSVPS : "has"
    EVENTS ||--o{ COMMENTS : "has"

    USERS {
        string uid PK
        string name
        string email
        string role "admin | panitia | mahasiswa"
        string createdAt
        string bio "optional"
        string npm "optional (Mahasiswa)"
        string fakultas "optional (Mahasiswa)"
        string jurusan "optional (Mahasiswa)"
        string angkatan "optional (Mahasiswa)"
        string organisasi "optional (Panitia)"
        string jabatan "optional (Panitia)"
        string noTelepon "optional (Panitia)"
    }

    EVENTS {
        string id PK
        string title
        string description
        string category
        string date
        string location
        string posterUrl "optional"
        string status "pending | approved | rejected"
        string organizerId FK "references USERS.uid"
        string organizerName
        int capacity "optional"
        string createdAt
    }

    RSVPS {
        string id PK
        string userId FK "references USERS.uid"
        string userName
        string eventId FK "references EVENTS.id"
        string status "registered | checked-in"
        string createdAt
    }

    COMMENTS {
        string id PK
        string userId FK "references USERS.uid"
        string userName
        string eventId FK "references EVENTS.id"
        string body
        string createdAt
    }

    NOTIFICATIONS {
        string id PK
        string userId FK "references USERS.uid"
        string eventId "references EVENTS.id"
        string message
        boolean isRead
        string createdAt
    }
```

---

## 2. Flowchart Sistem

Berikut adalah Flowchart untuk 3 proses utama yang terjadi di sistem KampusHub.

### A. Flowchart Registrasi & Autentikasi
Alur pengguna saat pertama kali masuk ke aplikasi hingga melengkapi profil.

```mermaid
flowchart TD
    Start([Mulai Aplikasi]) --> Login[Halaman Login/Daftar]
    Login --> AuthChoice{Pilih Metode}
    
    AuthChoice -->|Google| GoogleAuth[Autentikasi via Google]
    AuthChoice -->|Email/Password| EmailAuth[Autentikasi via Email]
    
    GoogleAuth --> CheckNewUser{User Baru?}
    EmailAuth --> CheckNewUser
    
    CheckNewUser -->|Ya| CompleteProfile[Halaman Lengkapi Profil]
    CheckNewUser -->|Tidak| Home[Masuk ke Beranda]
    
    CompleteProfile --> ChooseRole{Pilih Role}
    
    ChooseRole -->|Mahasiswa| FormMhs[Isi NPM, Fakultas, Jurusan, Angkatan]
    ChooseRole -->|Panitia| FormPanitia[Isi Nama Organisasi, Jabatan, No.Telp]
    
    FormMhs --> SaveProfile[Simpan Data ke Firestore]
    FormPanitia --> SaveProfile
    
    SaveProfile --> Home
    Home --> End([Selesai])
```

### B. Flowchart Pembuatan & Persetujuan Event
Alur panitia membuat event hingga disetujui oleh Admin.

```mermaid
flowchart TD
    Start([Panitia Login]) --> Dashboard[Buka Dashboard]
    Dashboard --> CreateEvent[Isi Form Buat Event]
    CreateEvent --> SubmitEvent[Submit Event]
    SubmitEvent --> SaveEvent[Simpan di Firestore dengan status 'pending']
    
    SaveEvent --> AdminLogin([Admin Login])
    AdminLogin --> AdminDash[Lihat Daftar Event Pending]
    AdminDash --> ReviewEvent{Review Event}
    
    ReviewEvent -->|Tolak| EventRejected[Ubah status jadi 'rejected']
    ReviewEvent -->|Setuju| EventApproved[Ubah status jadi 'approved']
    
    EventRejected --> NotifyPanitia[Kirim Notifikasi Penolakan ke Panitia]
    EventApproved --> NotifyPanitia2[Kirim Notifikasi Persetujuan ke Panitia]
    
    NotifyPanitia --> End([Selesai])
    NotifyPanitia2 --> Publish[Event Tampil di Beranda & Explore]
    Publish --> End
```

### C. Flowchart RSVP & Check-in (Sistem Tiket QR)
Alur mahasiswa mendaftar event hingga di-scan tiketnya oleh panitia.

```mermaid
flowchart TD
    Start([Mahasiswa Login]) --> Explore[Cari Event di Explore]
    Explore --> EventDetail[Lihat Detail Event]
    
    EventDetail --> CheckCapacity{Kapasitas Penuh?}
    
    CheckCapacity -->|Ya| ButtonDisabled[Tombol RSVP Terkunci]
    CheckCapacity -->|Tidak| ClickRSVP[Klik 'RSVP Sekarang']
    
    ButtonDisabled --> End([Selesai])
    
    ClickRSVP --> SaveRSVP[Simpan Data RSVP ke Firestore]
    SaveRSVP --> NotifyOrg[Kirim Notifikasi ke Panitia]
    SaveRSVP --> MyRSVPs[Data masuk ke 'RSVP Saya']
    
    MyRSVPs --> ViewTicket[Mahasiswa Klik 'Lihat Tiket']
    ViewTicket --> ShowQR[Tampilkan QR Code]
    
    ShowQR --> DayD([Hari H Acara])
    DayD --> PanitiaScanner[Panitia Buka Scanner]
    
    PanitiaScanner --> ScanAction{Scan QR Code}
    
    ScanAction -->|Valid| UpdateStatus[Ubah Status RSVP jadi 'checked-in']
    ScanAction -->|Tidak Valid| ShowError[Tampilkan Pesan Error]
    
    UpdateStatus --> SuccessMsg[Tampilkan Notifikasi Sukses]
    SuccessMsg --> End
    ShowError --> ScanAction
```
