import React, { useState, useEffect, createContext, useContext } from 'react';
import { figmaService } from '../utils/figma';
import { Loader2, RefreshCw, Palette } from 'lucide-react';

// Context untuk design system
const DesignSystemContext = createContext(null);

/**
 * Hook untuk menggunakan design system
 */
export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

/**
 * Provider untuk Design System yang terintegrasi dengan Figma
 */
export function DesignSystemProvider({ children, figmaFileId }) {
  const [designTokens, setDesignTokens] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDesignTokens = async () => {
    if (!figmaFileId) return;

    try {
      setLoading(true);
      setError(null);
      const tokens = await figmaService.getDesignTokens(figmaFileId);
      setDesignTokens(tokens);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignTokens();
  }, [figmaFileId]);

  const value = {
    designTokens,
    loading,
    error,
    reloadTokens: loadDesignTokens,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

/**
 * Komponen untuk menampilkan dan mengelola design tokens
 */
export function DesignTokensPanel({ className = "" }) {
  const { designTokens, loading, error, reloadTokens } = useDesignSystem();
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Warna', icon: Palette },
    { id: 'typography', label: 'Typography', icon: 'T' },
    { id: 'spacing', label: 'Spacing', icon: '↔' },
    { id: 'shadows', label: 'Shadows', icon: '⬤' },
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Memuat design tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-medium">Error memuat design tokens</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={reloadTokens}
            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload</span>
          </button>
        </div>
      </div>
    );
  }

  if (!designTokens) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-600">Design tokens belum dimuat</p>
      </div>
    );
  }

  const renderColorTokens = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.entries(designTokens.colors).map(([name, token]) => (
        <div key={name} className="flex flex-col items-center space-y-2 p-3 bg-white border rounded-lg">
          <div
            className="w-12 h-12 rounded border-2 border-gray-200"
            style={{
              backgroundColor: `rgba(${Math.round(token.value.r * 255)}, ${Math.round(token.value.g * 255)}, ${Math.round(token.value.b * 255)}, ${token.value.a || 1})`
            }}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">
              {token.value.a !== undefined
                ? `rgba(${Math.round(token.value.r * 255)}, ${Math.round(token.value.g * 255)}, ${Math.round(token.value.b * 255)}, ${token.value.a})`
                : `rgb(${Math.round(token.value.r * 255)}, ${Math.round(token.value.g * 255)}, ${Math.round(token.value.b * 255)})`
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTypographyTokens = () => (
    <div className="space-y-4">
      {Object.entries(designTokens.typography).map(([name, token]) => (
        <div key={name} className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">{name}</h4>
          <div
            className="text-lg"
            style={{
              fontFamily: token.value.fontFamily,
              fontSize: `${token.value.fontSize}px`,
              fontWeight: token.value.fontWeight,
              lineHeight: token.value.lineHeightPx ? `${token.value.lineHeightPx}px` : 'normal',
              letterSpacing: token.value.letterSpacing ? `${token.value.letterSpacing}px` : 'normal',
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {token.value.fontFamily} • {token.value.fontSize}px • {token.value.fontWeight}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSpacingTokens = () => (
    <div className="space-y-4">
      {Object.entries(designTokens.spacing).map(([name, token]) => (
        <div key={name} className="flex items-center space-x-4 p-4 bg-white border rounded-lg">
          <div className="font-medium text-gray-800 w-24">{name}</div>
          <div
            className="bg-blue-200 flex items-center justify-center text-blue-800 text-sm font-medium"
            style={{ width: `${token.value}px`, height: '32px', minWidth: '32px' }}
          >
            {token.value}px
          </div>
        </div>
      ))}
    </div>
  );

  const renderShadowTokens = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(designTokens.shadows).map(([name, token]) => (
        <div key={name} className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">{name}</h4>
          <div
            className="w-full h-20 bg-white rounded border flex items-center justify-center"
            style={{ boxShadow: token.value }}
          >
            <span className="text-sm text-gray-500">Shadow Preview</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 font-mono">{token.value}</p>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'colors':
        return renderColorTokens();
      case 'typography':
        return renderTypographyTokens();
      case 'spacing':
        return renderSpacingTokens();
      case 'shadows':
        return renderShadowTokens();
      default:
        return null;
    }
  };

  return (
    <div className={`design-tokens-panel ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Design Tokens</h2>
        <button
          onClick={reloadTokens}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload</span>
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tokenCount = designTokens[tab.id] ? Object.keys(designTokens[tab.id]).length : 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {typeof Icon === 'string' ? (
                  <span className="text-lg">{Icon}</span>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tokenCount}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
}