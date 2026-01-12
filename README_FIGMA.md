# 🎨 FIGMA INTEGRATION - SETUP CEPAT

## ⚡ 3 LANGKAH MUDAH

### 1️⃣ DAPATKAN FIGMA TOKEN
```
🔗 Buka: https://www.figma.com/settings
📍 Scroll ke: "Personal access tokens"
➕ Klik: "Create a new personal access token"
✏️  Nama: "StudyFlowAI"
📋 Copy token
```

### 2️⃣ PASTE KE .env
```
📁 Buka file: .env
🔍 Cari baris: VITE_FIGMA_ACCESS_TOKEN=
📝 Ganti dengan: token yang Anda copy
💾 Save file
```

### 3️⃣ DAPATKAN FILE ID FIGMA
```
🔗 Buka file Figma Anda
📋 Copy URL dari browser
✂️  Ambil bagian setelah "/file/"

Contoh:
https://www.figma.com/file/ABC123def456/My-Design
⬆️  File ID: ABC123def456
```

---

## 🚀 TEST INTEGRASI

### Opsi 1: Halaman Demo (REKOMENDASI)
```
1. Jalankan: npm run dev
2. Login ke aplikasi
3. Klik: "Figma Example" di menu
4. Paste File ID Anda
5. Design muncul! 🎉
```

### Opsi 2: Halaman Lengkap
```
1. Klik: "Design Preview" di menu
2. Pilih tab yang diinginkan
3. Ikuti panduan di halaman
```

---

## 📋 CONTOH CEPAT

### File Demo (Testing)
```jsx
<FigmaViewer
  fileId="8bmahyJQFkZ6ZfK3"
  title="Demo Design"
  height="500px"
/>
```

### File Anda Sendiri
```jsx
<FigmaViewer
  fileId="YOUR_FILE_ID_HERE"  // Ganti ini!
  title="My Design"
  height="500px"
/>
```

---

## 🔧 TOOLS BANTUAN

### Setup Otomatis
```bash
node setup-figma.js
```

### Cek Status
Script akan cek:
- ✅ File .env siap
- ✅ Token sudah diisi
- ✅ File contoh dibuat

---

## ❓ MASALAH UMUM

### ❌ "Design tidak muncul"
- ✅ Cek File ID benar
- ✅ Pastikan token valid
- ✅ Restart aplikasi

### ❌ "Error API"
- ✅ Token Figma masih aktif?
- ✅ File Figma bisa diakses?
- ✅ Internet connection OK?

---

## 📚 FILE PANDUAN

- `FIGMA_GUIDE.md` - Panduan lengkap
- `FIGMA_INTEGRATION.md` - Dokumentasi teknis
- `setup-figma.js` - Script setup otomatis
- `src/examples/` - File contoh siap pakai

---

## 🎯 YANG ANDA DAPATKAN

✅ **Embed Design** - Design Figma langsung di app
✅ **Real-time Sync** - Selalu up-to-date
✅ **Design Tokens** - Sync warna, font, spacing
✅ **Easy Setup** - 3 langkah selesai
✅ **No Coding** - Tinggal copy-paste

---

## 💬 BUTUH BANTUAN?

1. **Cek Console** - Lihat error di browser
2. **Verifikasi Token** - Pastikan token benar
3. **Test File ID** - Gunakan file demo dulu
4. **Restart App** - Environment perlu restart

---

**SELAMAT MENCOBA! 🚀**

Integrasi Figma StudyFlowAI siap digunakan! 🎉