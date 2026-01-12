import React, { useState, useEffect } from 'react';
import { figmaService } from '../utils/figma';
import { Eye, ExternalLink, Download, Loader2 } from 'lucide-react';

/**
 * Komponen untuk menampilkan design Figma
 * Mendukung embed, preview gambar, dan navigasi
 */
export default function FigmaViewer({
  fileId,
  nodeId = null,
  title = "Figma Design",
  height = "600px",
  showControls = true,
  className = "",
  onLoad = null,
  onError = null,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [images, setImages] = useState({});

  useEffect(() => {
    loadFigmaData();
  }, [fileId, nodeId]);

  const loadFigmaData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil data file
      const data = await figmaService.getFile(fileId);
      setFileData(data);

      // Jika ada nodeId spesifik, ambil gambarnya
      if (nodeId) {
        const imageData = await figmaService.getImages(fileId, [nodeId]);
        setImages(imageData.images || {});
      }

      if (onLoad) {
        onLoad(data);
      }
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const embedUrl = figmaService.getEmbedUrl(fileId, nodeId);
  const shareUrl = figmaService.getShareUrl(fileId, nodeId);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Memuat design Figma...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ Error memuat Figma</div>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={loadFigmaData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`figma-viewer ${className}`}>
      {showControls && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {fileData && (
              <p className="text-sm text-gray-600">
                {fileData.name} • Last modified: {new Date(fileData.lastModified).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka di Figma</span>
            </button>
            {nodeId && images[nodeId] && (
              <button
                onClick={() => window.open(images[nodeId], '_blank')}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          style={{ width: '100%', height, border: 'none' }}
          allowFullScreen
          title={title}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

/**
 * Komponen untuk preview gambar dari Figma node
 */
export function FigmaImage({ fileId, nodeId, alt = "", className = "", ...props }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImage();
  }, [fileId, nodeId]);

  const loadImage = async () => {
    try {
      setLoading(true);
      const imageData = await figmaService.getImages(fileId, [nodeId]);
      if (imageData.images && imageData.images[nodeId]) {
        setImageUrl(imageData.images[nodeId]);
      } else {
        throw new Error('Gambar tidak ditemukan');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <span className="text-gray-400 text-sm">Gambar tidak tersedia</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
}