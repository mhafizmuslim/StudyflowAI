# Figma Integration untuk StudyFlowAI

Integrasi Figma memungkinkan Anda untuk menghubungkan design UI/UX dari Figma langsung ke aplikasi StudyFlowAI. Dengan integrasi ini, design akan selalu up-to-date dan sinkron dengan file Figma asli.

## 🚀 Fitur

- **Figma Viewer**: Embed design Figma langsung ke dalam aplikasi
- **Design Tokens**: Sinkronisasi warna, typography, spacing dari Figma
- **Image Preview**: Preview dan gunakan gambar dari node Figma
- **Real-time Sync**: Design selalu up-to-date dengan Figma

## 📋 Setup

### 1. Setup Figma Access Token

1. Buka [Figma Settings](https://www.figma.com/settings)
2. Scroll ke bagian "Personal access tokens"
3. Klik "Create a new personal access token"
4. Beri nama token (contoh: "StudyFlowAI Integration")
5. Copy token dan paste ke file `.env`:

```env
VITE_FIGMA_ACCESS_TOKEN=yfigd_kjq4pDdYdVq2LJ9kzZE0lCByJ37ZT9mk_k3Lphfa
```

### 2. Mendapatkan File ID dari Figma

1. Buka file Figma di browser
2. Copy URL dari address bar
3. URL format: `https://www.figma.com/file/FILE_ID/FILE_NAME`
4. FILE_ID adalah bagian setelah "/file/" dan sebelum "/"

**Contoh:**
```
https://www.figma.com/file/ABC123def456/My-Design-System
```
File ID: `ABC123def456`

### 3. Mendapatkan Node ID (Opsional)

1. Pilih frame/component di Figma
2. Klik kanan → "Copy/Paste" → "Copy link"
3. Node ID ada di akhir URL setelah "node-id="
4. Atau gunakan Dev Mode di Figma untuk melihat ID

## 🎯 Cara Penggunaan

### Akses Halaman Design Preview

1. Login ke aplikasi StudyFlowAI
2. Akses URL: `http://localhost:3001/design-preview`
3. Atau tambahkan link di navigation menu

### Menggunakan Figma Viewer

```jsx
import FigmaViewer from '../components/FigmaViewer';

function MyComponent() {
  return (
    <FigmaViewer
      fileId="your-figma-file-id"
      nodeId="optional-node-id"
      title="My Design"
      height="600px"
    />
  );
}
```

### Menggunakan Design Tokens

```jsx
import { DesignSystemProvider, useDesignSystem } from '../components/DesignSystem';

function App() {
  return (
    <DesignSystemProvider figmaFileId="your-design-system-file-id">
      <MyComponent />
    </DesignSystemProvider>
  );
}

function MyComponent() {
  const { designTokens } = useDesignSystem();

  return (
    <div style={{
      color: designTokens?.colors?.primary?.value,
      fontFamily: designTokens?.typography?.body?.value?.fontFamily
    }}>
      Content with design tokens
    </div>
  );
}
```

### Menggunakan Figma Images

```jsx
import { FigmaImage } from '../components/FigmaViewer';

function MyComponent() {
  return (
    <FigmaImage
      fileId="your-figma-file-id"
      nodeId="image-node-id"
      alt="Design Preview"
      className="w-full h-auto"
    />
  );
}
```

## 🔧 API Reference

### FigmaService

```javascript
import { figmaService } from '../utils/figma';

// Ambil data file
const fileData = await figmaService.getFile('file-id');

// Ambil gambar dari node
const images = await figmaService.getImages('file-id', ['node-id-1', 'node-id-2']);

// Ambil komponen
const components = await figmaService.getComponents('file-id');

// Ambil design tokens
const tokens = await figmaService.getDesignTokens('file-id');

// Generate embed URL
const embedUrl = figmaService.getEmbedUrl('file-id', 'node-id');
```

## 📁 Struktur File

```
src/
├── components/
│   ├── FigmaViewer.jsx      # Komponen untuk embed Figma
│   └── DesignSystem.jsx     # Komponen untuk design tokens
├── pages/
│   └── DesignPreview.jsx    # Halaman demo integrasi
├── utils/
│   └── figma.js            # Service untuk Figma API
└── ...
```

## 🔒 Keamanan

- Access token disimpan di environment variables
- Tidak ada data sensitif yang di-cache
- Semua request menggunakan HTTPS
- Token hanya digunakan untuk read operations

## 🐛 Troubleshooting

### Error: "Gagal mengambil data file Figma"
- Pastikan Figma Access Token valid
- Pastikan File ID benar
- Pastikan file Figma bersifat public atau Anda memiliki akses

### Error: "Gambar tidak tersedia"
- Pastikan Node ID mengacu ke node yang berisi gambar
- Pastikan node tidak hidden atau locked

### Design tidak update
- Refresh halaman untuk load design terbaru
- Pastikan file Figma sudah di-publish jika menggunakan library

## 📚 Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma Token Guide](https://www.figma.com/developers/api#access-tokens)
- [Figma Embed Documentation](https://www.figma.com/developers/embed)

## 🤝 Contributing

Untuk menambah fitur atau memperbaiki bug, silakan buat issue atau pull request di repository ini.