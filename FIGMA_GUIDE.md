# 🚀 Panduan Integrasi Figma - CARA MUDAH

## ⚡ 5 Langkah Cepat Setup Figma

### LANGKAH 1: Dapatkan Figma Access Token
```
1. Buka browser → https://www.figma.com/settings
2. Scroll ke bawah → "Personal access tokens"
3. Klik "Create a new personal access token"
4. Nama: "StudyFlowAI"
5. Copy token yang muncul
```

### LANGKAH 2: Paste Token ke File .env
```
Buka file .env di project StudyFlowAI
Cari baris: VITE_FIGMA_ACCESS_TOKEN=your_figma_access_token_here
Ganti dengan token yang Anda copy tadi
```

### LANGKAH 3: Dapatkan File ID dari Figma
```
1. Buka file Figma yang ingin diintegrasikan
2. Lihat URL di address bar browser
3. Copy bagian setelah "/file/" dan sebelum "/"

Contoh URL:
https://www.figma.com/file/ABC123def456/My-Design-System

File ID yang dicopy: ABC123def456
```

### LANGKAH 4: Restart Aplikasi
```bash
# Stop server (Ctrl+C)
# Jalankan ulang
npm run dev
```

### LANGKAH 5: Test Integrasi
```
1. Login ke aplikasi StudyFlowAI
2. Klik menu "Design Preview"
3. Paste File ID Figma Anda
4. Lihat design muncul! 🎉
```

---

## 🎯 CONTOH PRAKTIS

### File Figma untuk Testing
Gunakan file Figma publik ini untuk testing:
- **File ID**: `8bmahyJQFkZ6ZfK3`
- **URL**: https://www.figma.com/file/8bmahyJQFkZ6ZfK3/StudyFlowAI-Design-System

### Kode Siap Pakai

```jsx
// src/components/MyDesign.jsx
import React from 'react';
import FigmaViewer from './FigmaViewer';

export default function MyDesign() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Figma Design</h1>

      <FigmaViewer
        fileId="8bmahyJQFkZ6ZfK3"  // Ganti dengan File ID Anda
        title="StudyFlowAI Design"
        height="600px"
      />
    </div>
  );
}
```

---

## 🔧 TOOLS BANTUAN

### Setup Otomatis
Jalankan script ini untuk setup cepat:
```bash
node setup-figma.js
```

### Cek Status Setup
Script akan mengecek:
- ✅ File .env ada
- ✅ Figma token sudah diisi
- ✅ Membuat file contoh

---

## 📱 CARA CEPAT TESTING

### 1. Gunakan File Demo
```jsx
// Paste di component mana saja
<FigmaViewer
  fileId="8bmahyJQFkZ6ZfK3"
  title="Demo Design"
  height="500px"
/>
```

### 2. Test dengan File Anda Sendiri
```jsx
<FigmaViewer
  fileId="YOUR_FILE_ID_HERE"  // Ganti ini
  title="My Design"
  height="500px"
/>
```

### 3. Test Design Tokens
```jsx
import { DesignSystemProvider } from './components/DesignSystem';

<DesignSystemProvider figmaFileId="YOUR_FILE_ID_HERE">
  <div>Design akan sync otomatis!</div>
</DesignSystemProvider>
```

---

## ❓ MASIH BINGUNG? IKUTI STEP INI

### Jika Setup Gagal:
1. **Cek Console Browser** - Lihat error message
2. **Verifikasi Token** - Pastikan token benar di .env
3. **Test File ID** - Pastikan file Figma accessible
4. **Restart Server** - Environment variables butuh restart

### Jika Design Tidak Muncul:
1. **File Figma Public?** - Pastikan file bisa diakses publik
2. **Token Valid?** - Coba generate token baru
3. **File ID Benar?** - Double check URL Figma

---

## 🎉 SELESAI!

Setelah setup, Anda bisa:
- ✅ Embed design Figma langsung
- ✅ Sync warna, font, spacing otomatis
- ✅ Preview gambar dari Figma
- ✅ Design selalu up-to-date

**Butuh bantuan?** Cek file `FIGMA_INTEGRATION.md` untuk detail lengkap!

---

## 📞 CONTACT

Ada masalah? Buat issue di repository atau tanya di chat! 🚀