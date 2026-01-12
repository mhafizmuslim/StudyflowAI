import axios from 'axios';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_ACCESS_TOKEN = import.meta.env.VITE_FIGMA_ACCESS_TOKEN;

/**
 * Figma API Integration Utility
 * Mengintegrasikan aplikasi dengan Figma untuk mengambil design data
 */
class FigmaService {
  constructor() {
    this.client = axios.create({
      baseURL: FIGMA_API_BASE,
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Mengambil informasi file Figma
   * @param {string} fileId - ID file Figma
   * @returns {Promise<Object>} Data file Figma
   */
  async getFile(fileId) {
    try {
      const response = await this.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw new Error('Gagal mengambil data file Figma');
    }
  }

  /**
   * Mengambil gambar dari node Figma
   * @param {string} fileId - ID file Figma
   * @param {string[]} nodeIds - Array ID node yang ingin diambil gambarnya
   * @param {Object} options - Opsi untuk gambar (scale, format, dll)
   * @returns {Promise<Object>} URL gambar untuk setiap node
   */
  async getImages(fileId, nodeIds, options = {}) {
    try {
      const params = {
        ids: nodeIds.join(','),
        scale: options.scale || 1,
        format: options.format || 'png',
        ...options,
      };

      const response = await this.client.get(`/images/${fileId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma images:', error);
      throw new Error('Gagal mengambil gambar dari Figma');
    }
  }

  /**
   * Mengambil komponen dari file Figma
   * @param {string} fileId - ID file Figma
   * @returns {Promise<Object>} Data komponen
   */
  async getComponents(fileId) {
    try {
      const fileData = await this.getFile(fileId);
      const components = {};

      // Fungsi rekursif untuk mencari komponen
      const findComponents = (node) => {
        if (node.type === 'COMPONENT') {
          components[node.id] = {
            id: node.id,
            name: node.name,
            description: node.description || '',
            properties: node.componentPropertyDefinitions || {},
          };
        }

        if (node.children) {
          node.children.forEach(findComponents);
        }
      };

      findComponents(fileData.document);
      return components;
    } catch (error) {
      console.error('Error fetching Figma components:', error);
      throw new Error('Gagal mengambil komponen dari Figma');
    }
  }

  /**
   * Mengambil style guide/tokens dari file Figma
   * @param {string} fileId - ID file Figma
   * @returns {Promise<Object>} Design tokens
   */
  async getDesignTokens(fileId) {
    try {
      const fileData = await this.getFile(fileId);
      const tokens = {
        colors: {},
        typography: {},
        spacing: {},
        shadows: {},
      };

      // Fungsi untuk extract styles
      const extractStyles = (node) => {
        if (node.styles) {
          Object.entries(node.styles).forEach(([styleType, styleId]) => {
            const style = fileData.styles[styleId];
            if (style) {
              switch (styleType) {
                case 'fill':
                  if (node.fills && node.fills[0]?.type === 'SOLID') {
                    tokens.colors[style.name] = {
                      value: node.fills[0].color,
                      type: 'color',
                    };
                  }
                  break;
                case 'text':
                  if (node.style) {
                    tokens.typography[style.name] = {
                      value: node.style,
                      type: 'typography',
                    };
                  }
                  break;
              }
            }
          });
        }

        if (node.children) {
          node.children.forEach(extractStyles);
        }
      };

      extractStyles(fileData.document);
      return tokens;
    } catch (error) {
      console.error('Error fetching design tokens:', error);
      throw new Error('Gagal mengambil design tokens dari Figma');
    }
  }

  /**
   * Generate embed URL untuk Figma
   * @param {string} fileId - ID file Figma
   * @param {string} nodeId - ID node spesifik (optional)
   * @returns {string} Embed URL
   */
  getEmbedUrl(fileId, nodeId = null) {
    let url = `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileId}`;
    if (nodeId) {
      url += `&node-id=${nodeId}`;
    }
    return url;
  }

  /**
   * Generate share URL untuk Figma
   * @param {string} fileId - ID file Figma
   * @param {string} nodeId - ID node spesifik (optional)
   * @returns {string} Share URL
   */
  getShareUrl(fileId, nodeId = null) {
    let url = `https://www.figma.com/file/${fileId}`;
    if (nodeId) {
      url += `?node-id=${nodeId}`;
    }
    return url;
  }
}

// Export singleton instance
export const figmaService = new FigmaService();
export default figmaService;