#!/usr/bin/env node

/**
 * Figma Integration Setup Helper
 * Membantu setup integrasi Figma dengan mudah
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Figma Integration Setup Helper');
console.log('================================\n');

// Cek apakah .env file ada
const envPath = path.join(__dirname, '.env');
const exampleEnvPath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ File .env tidak ditemukan!');
  console.log('📝 Membuat file .env baru...\n');

  const envContent = `# Environment Variables untuk StudyFlowAI

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyflow
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=my-super-secret-key-12345

# API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIGMA_ACCESS_TOKEN=your_figma_access_token_here

# App Config
PORT=3001
VITE_API_URL=http://localhost:3001/api
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ File .env berhasil dibuat!');
  console.log('📍 Lokasi: .env\n');
} else {
  console.log('✅ File .env sudah ada');
}

// Cek apakah Figma token sudah diisi
const envContent = fs.readFileSync(envPath, 'utf8');
const hasFigmaToken = envContent.includes('VITE_FIGMA_ACCESS_TOKEN=your_figma_access_token_here') === false &&
                     envContent.includes('VITE_FIGMA_ACCESS_TOKEN=') &&
                     !envContent.includes('your_figma_access_token_here');

if (!hasFigmaToken) {
  console.log('⚠️  Figma Access Token belum diisi!');
  console.log('📋 Cara mendapatkan Figma Access Token:');
  console.log('   1. Buka: https://www.figma.com/settings');
  console.log('   2. Scroll ke "Personal access tokens"');
  console.log('   3. Klik "Create a new personal access token"');
  console.log('   4. Beri nama: "StudyFlowAI Integration"');
  console.log('   5. Copy token dan paste ke file .env\n');
} else {
  console.log('✅ Figma Access Token sudah diisi');
}

// Buat file contoh penggunaan
const examplePath = path.join(__dirname, 'src', 'examples', 'FigmaExample.jsx');

if (!fs.existsSync(path.dirname(examplePath))) {
  fs.mkdirSync(path.dirname(examplePath), { recursive: true });
}

const exampleContent = `import React from 'react';
import FigmaViewer, { FigmaImage } from '../components/FigmaViewer';
import { DesignSystemProvider, DesignTokensPanel } from '../components/DesignSystem';

/**
 * CONTOH PENGGUNAAN FIGMA INTEGRATION
 * Ganti fileId dengan ID file Figma Anda
 */
export default function FigmaExample() {
  // GANTI DENGAN FILE ID FIGMA ANDA
  const FIGMA_FILE_ID = 'your-figma-file-id-here';
  const FIGMA_NODE_ID = 'optional-node-id-here';

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Figma Integration Example</h1>

      {/* 1. EMBED DESIGN FIGMA */}
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Figma Design Viewer</h2>
        <FigmaViewer
          fileId={FIGMA_FILE_ID}
          nodeId={FIGMA_NODE_ID}
          title="My Design"
          height="500px"
        />
      </section>

      {/* 2. DESIGN TOKENS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">2. Design Tokens</h2>
        <DesignSystemProvider figmaFileId={FIGMA_FILE_ID}>
          <DesignTokensPanel />
        </DesignSystemProvider>
      </section>

      {/* 3. GAMBAR DARI FIGMA */}
      <section>
        <h2 className="text-xl font-semibold mb-4">3. Figma Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FigmaImage
            fileId={FIGMA_FILE_ID}
            nodeId={FIGMA_NODE_ID}
            alt="Design Preview"
            className="w-full h-auto rounded-lg shadow"
          />
        </div>
      </section>
    </div>
  );
}

/*
CARA MENDAPATKAN FILE ID FIGMA:
1. Buka file Figma di browser
2. Copy URL: https://www.figma.com/file/FILE_ID_HERE/file-name
3. FILE_ID_HERE adalah ID yang Anda butuhkan

CONTOH:
URL: https://www.figma.com/file/ABC123def456/My-Design-System
FILE ID: ABC123def456
*/`;

fs.writeFileSync(examplePath, exampleContent);
console.log('✅ File contoh dibuat: src/examples/FigmaExample.jsx');

console.log('\n🎉 Setup selesai!');
console.log('📋 Langkah selanjutnya:');
console.log('   1. Isi VITE_FIGMA_ACCESS_TOKEN di file .env');
console.log('   2. Restart server: npm run dev');
console.log('   3. Akses: http://localhost:3001/design-preview');
console.log('   4. Atau lihat contoh: src/examples/FigmaExample.jsx\n');

console.log('💡 Tips:');
console.log('   - File ID Figma ada di URL setelah "/file/"');
console.log('   - Access token hanya untuk read, aman digunakan');
console.log('   - Design akan selalu up-to-date dengan Figma\n');