# Sistem Administrasi Kampus

## Overview
Campus Administration System for managing student letter requests with automated numbering, notifications, and role-based access control.

## Project Structure
```
sistem-administrasi-kampus/
├── frontend/       # React.js application
├── backend/        # Node.js + Express API
├── database/       # SQL scripts and migrations
└── docs/          # Project documentation
```

## Features
- Student letter request management (30+ letter types)
- Automated letter numbering system
- Role-based access control (Student, Admin, Supervisor, Lecturer)
- Email & SMS notifications
- Supervisor dashboard with audit logs
- Real-time status tracking

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: SQLite (for development), PostgreSQL (for production)
- **Authentication**: JWT

## Getting Started
Follow these steps to set up and run the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/AchmadAth/sistem-administrasi-kampus.git
cd sistem-administrasi-kampus
```

### 2. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the server.

```bash
cd backend
pnpm install
# Create a .env file based on .env.example
cp .env.example .env
# Update .env with your database configuration if not using default SQLite
# Run database migrations (if any, for SQLite it will auto-sync)
node server.js
```
The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend/campus-admin-frontend` directory, install dependencies, and start the development server.

```bash
cd ../frontend/campus-admin-frontend
pnpm install
# Create a .env file based on .env.example
cp .env.example .env
# Ensure VITE_API_URL in .env points to your backend (e.g., VITE_API_URL=http://localhost:5000/api)
pnpm run dev
```
The frontend application will typically run on `http://localhost:5173` (or another available port).

## Project Progress Log

### ✅ Langkah 1: Setup Awal Proyek (6 Oktober 2025)
**Status**: Selesai

**Aktivitas**:
- Repository GitHub dibuat: `sistem-administrasi-kampus`
- Struktur folder diinisialisasi:
	- `frontend/` - React.js application
	- `backend/` - Node.js + Express API
	- `database/` - SQL scripts
	- `docs/` - Documentation
- `README.md` dibuat dengan overview proyek
- `.gitignore` dikonfigurasi
- Initial commit dipush ke GitHub

**Commit**: `chore: initial project setup with folder structure`

---

### ✅ Langkah 2: Setup Autentikasi dan Authorization (6 Oktober 2025)
**Status**: Selesai

**Aktivitas**:
- Dokumentasi test case dibuat
- Backend project diinisialisasi dengan Node.js + Express
- Dependencies diinstall (express, bcryptjs, jsonwebtoken, sequelize, dll)
- Database configuration dengan SQLite
- User model dengan role-based fields
- JWT utility functions
- Authentication & Authorization middleware
- Auth controller (register, login, getMe)
- Input validation middleware
- Comprehensive test suite (14 tests)

**Test Results**:
- ✅ 14/14 tests passed
- ✅ 75.72% code coverage

**Commit**: `feat: setup auth and rbac`

---

### ✅ Langkah 3: Fitur Permohonan Surat Mahasiswa (6 Oktober 2025)
**Status**: Selesai

**Aktivitas**:
- Konfigurasi 31 jenis surat
- Model Letter dibuat dengan relasi ke User
- Controller Letter (CRUD, update status)
- Routes Letter dengan RBAC
- Test suite komprehensif (17 tests)

**Test Results**:
- ✅ 17/17 tests passed
- ✅ 82.39% code coverage

---

### ✅ Langkah 4: Sistem Penomoran Surat Otomatis (6 Oktober 2025)
**Status**: Selesai

**Aktivitas**:
- Implementasi `generateLetterNumber` dengan format `[Tahun]/[Bulan]/[Jenis Surat]/[Nomor Urut]`
- Auto-assign nomor surat saat status disetujui
- Supervisor dapat membatalkan/mengedit nomor surat
- Endpoint statistik penomoran surat
- Test suite komprehensif (12 tests)

**Test Results**:
- ✅ 12/12 tests passed
- ✅ 82.23% code coverage

---

### ✅ Langkah 5: Pengembangan Frontend UI (6 Oktober 2025)

**Status**: Selesai

**Aktivitas**:
- Frontend React app diinisialisasi
- Integrasi API dengan backend
- Halaman Login dan Register dibuat
- Dashboard dengan statistik surat
- Halaman daftar surat dengan filter dan pencarian
- Halaman detail surat dengan aksi approve/reject
- Halaman pengajuan surat baru
- Navigasi sidebar dengan kontrol akses berbasis peran
- Desain responsif menggunakan Tailwind CSS dan Shadcn/UI

**Commit**: `feat: complete React frontend UI`

---

## Akun Pengujian

Untuk menguji sistem, Anda dapat mendaftar akun baru dengan peran "student" atau "supervisor". Berikut adalah contoh kredensial yang dapat Anda gunakan:

**Supervisor (untuk menyetujui surat):**
- **Email**: `supervisor@example.com`
- **Password**: `SupervisorPass123!`
- **NIP**: `SUP001`

**Student (untuk mengajukan surat):**
- **Email**: `student@example.com`
- **Password**: `StudentPass123!`
- **NIM**: `2021001`

Anda dapat mendaftar melalui halaman registrasi frontend setelah dipublikasikan.

## Deployment

### Frontend (GitHub Pages)
The frontend application is deployed to GitHub Pages and can be accessed at: [https://AchmadAth.github.io/sistem-administrasi-kampus](https://AchmadAth.github.io/sistem-administrasi-kampus)

### Backend API
The backend API is currently running on a temporary public URL: [https://5000-i7hcw4h7n5d72ed1zhq23-487f8923.manus.computer/api](https://5000-i7hcw4h7n5d72ed1zhq23-487f8923.manus.computer/api)

For a permanent deployment of the backend, you would need to host it on a dedicated server or a cloud platform (e.g., AWS, Google Cloud, Heroku, Vercel).

## License
MIT

