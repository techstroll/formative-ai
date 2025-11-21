/**
 * SVG Wireframe Generator - Converts wireframe layouts to SVG
 * Generates interactive SVG wireframes from block-based layouts
 * Phase 2.2: Enhanced with design token integration for consistent styling
 */

import { WireframeLayout, WireframeScreen, WireframeBlock } from './layoutGenerator';
import {
  getColor,
  getSpacing,
  getTypography,
  getBorderRadius,
  DESIGN_TOKENS,
} from '../config/designTokens';

class SVGWireframeGenerator {
  // Phase 2.2: All colors now use design tokens instead of hardcoded values
  private colors = {
    header: getColor('gray-900'),
    hero: getColor('primary-600'),
    section: getColor('gray-500'),
    card: getColor('gray-50'),
    grid: getColor('gray-100'),
    list: getColor('gray-50'),
    chart: getColor('gray-200'),
    cta: getColor('success-600'),
    text: getColor('gray-900'),
    border: getColor('gray-300'),
  };

  // Priority-based color coding for features (using semantic colors from design tokens)
  private readonly priorityColors = {
    high: getColor('error-600'),      // Red
    medium: getColor('warning-600'),  // Orange
    low: getColor('primary-600'),     // Blue
  };

  // Category colors (using design token palette)
  private readonly categoryColors: Record<string, string> = {
    core: getColor('purple-600'),       // Purple
    secondary: getColor('teal-600'),    // Teal
    'nice-to-have': getColor('gray-500'), // Gray
    custom: getColor('red-700'),        // Dark Red
  };

  // Spacing values from design tokens
  private readonly spacing = {
    padding: getSpacing('padding-md'),
    margin: getSpacing('margin-md'),
    gap: getSpacing('gap-sm'),
    borderWidth: '1',  // Base border width
  };

  // Typography values from design tokens
  private readonly typography = {
    title: getTypography('heading-lg'),
    heading: getTypography('heading-md'),
    body: getTypography('body-base'),
    caption: getTypography('body-sm'),
  };

  /**
   * Generate SVG for entire layout
   */
  generateSVG(layout: WireframeLayout): string {
    // Create multi-screen SVG with tabs
    let svg = this.createSVGHeader();

    // Add each screen as a separate group
    layout.screens.forEach((screen, index) => {
      const display = index === 0 ? 'block' : 'none';
      svg += `<g id="screen-${index}" style="display: ${display}">`;
      svg += this.generateScreenSVG(screen);
      svg += `</g>`;
    });

    // Add navigation controls
    svg += this.generateNavigationControls(layout.screens.length);

    svg += '</svg>';

    return svg;
  }

  /**
   * Generate SVG for single screen
   */
  private generateScreenSVG(screen: WireframeScreen): string {
    let svg = '';

    // Screen background
    svg += `
      <rect width="1200" height="800" fill="#FFFFFF" stroke="${this.colors.border}" stroke-width="1"/>
    `;

    // Render each block
    screen.blocks.forEach((block) => {
      svg += this.generateBlockSVG(block);
    });

    return svg;
  }

  /**
   * Generate SVG for a single wireframe block (Enhanced with feature styling)
   */
  private generateBlockSVG(block: WireframeBlock): string {
    const { type, title, content, position, size, data } = block;
    const baseColor = this.colors[type as keyof typeof this.colors] || '#CCCCCC';

    // Use priority color if this block has feature data (priority)
    const priority = data?.priority || 'low';
    const category = data?.category || 'custom';
    const blockColor = data?.priority ? baseColor : baseColor;

    // Extract priority color before template strings to avoid 'this' context issues
    const priorityColor = this.priorityColors[priority as keyof typeof this.priorityColors] || '#95A5A6';
    const borderColor = data?.priority ? priorityColor : this.colors.border;

    let svg = '';

    // Block background with priority indicator border
    svg += `
      <g id="${block.id}" class="wireframe-block" data-type="${type}" data-priority="${priority}">
        <!-- Main block background -->
        <rect
          x="${position.x}"
          y="${position.y}"
          width="${size.width}"
          height="${size.height}"
          fill="${blockColor}"
          stroke="${borderColor}"
          stroke-width="${data?.priority ? '3' : '1'}"
          opacity="0.85"
          rx="4"
        />

        <!-- Priority indicator bar (if feature) -->
        ${data?.priority ? `
        <rect
          x="${position.x}"
          y="${position.y}"
          width="8"
          height="${size.height}"
          fill="${priorityColor}"
          rx="4"
        />
        ` : ''}
    `;

    // Block content with improved spacing
    let currentY = position.y + 15;

    // Feature title (main heading)
    if (title) {
      svg += this.generateTextElement(
        title,
        position.x + (data?.priority ? 18 : 10),
        currentY + 12,
        Math.min(size.width - (data?.priority ? 35 : 20), 300),
        13,
        'bold'
      );
      currentY += 22;
    }

    // Feature description (secondary text)
    if (content && size.height > 80) {
      svg += this.generateTextElement(
        content,
        position.x + (data?.priority ? 18 : 10),
        currentY + 12,
        size.width - (data?.priority ? 35 : 20),
        11,
        'normal'
      );
      currentY += 20;
    }

    // Priority badge (if feature)
    if (data?.priority) {
      svg += this.generatePriorityBadge(
        priority,
        position.x + size.width - 70,
        position.y + 5
      );
    }

    // Category badge (if feature category exists)
    if (data?.category && data.category !== 'custom') {
      svg += this.generateCategoryBadge(
        category,
        position.x + size.width - 70,
        position.y + 28
      );
    }

    // Type label (bottom right)
    if (!data?.priority) {
      svg += this.generateTypeBadge(type, position.x + size.width - 80, position.y + size.height - 25);
    }

    svg += `</g>`;

    return svg;
  }

  /**
   * Generate text element with wrapping (Phase 2.2: Now supports design token typography)
   */
  private generateTextElement(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontWeight: string = 'normal',
    typographyType?: 'title' | 'heading' | 'body' | 'caption'
  ): string {
    if (!text) return '';

    // Use typography token if provided, otherwise use fontSize parameter
    let actualFontSize = fontSize;
    let actualFontWeight = fontWeight;

    if (typographyType && this.typography[typographyType]) {
      const typoToken = this.typography[typographyType];
      actualFontSize = parseInt(typoToken.fontSize);
      actualFontWeight = typoToken.fontWeight;
    }

    // Truncate long text
    const maxChars = Math.floor(maxWidth / (actualFontSize * 0.5));
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

    return `
      <text
        x="${x}"
        y="${y}"
        font-size="${actualFontSize}"
        font-weight="${actualFontWeight}"
        fill="${this.colors.text}"
        font-family="Arial, sans-serif"
        max-width="${maxWidth}"
      >
        ${this.escapeXML(truncatedText)}
      </text>
    `;
  }

  /**
   * Generate priority badge for features
   */
  private generatePriorityBadge(priority: string, x: number, y: number): string {
    const badgeColor = this.priorityColors[priority as keyof typeof this.priorityColors] || '#95A5A6';
    const priorityLabel = priority.toUpperCase();

    return `
      <g class="priority-badge">
        <rect x="${x}" y="${y}" width="65" height="20" fill="${badgeColor}" rx="3" opacity="0.9"/>
        <text
          x="${x + 32.5}"
          y="${y + 14}"
          font-size="11"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          font-family="Arial, sans-serif"
        >
          ${priorityLabel}
        </text>
      </g>
    `;
  }

  /**
   * Generate category badge for features
   */
  private generateCategoryBadge(category: string, x: number, y: number): string {
    const badgeColor = this.categoryColors[category] || '#95A5A6';
    const categoryLabel = category.replace('-', ' ').toUpperCase();

    return `
      <g class="category-badge">
        <rect x="${x}" y="${y}" width="65" height="18" fill="${badgeColor}" rx="3" opacity="0.8"/>
        <text
          x="${x + 32.5}"
          y="${y + 13}"
          font-size="9"
          font-weight="normal"
          fill="white"
          text-anchor="middle"
          font-family="Arial, sans-serif"
        >
          ${categoryLabel}
        </text>
      </g>
    `;
  }

  /**
   * Generate type badge
   */
  private generateTypeBadge(type: string, x: number, y: number): string {
    const badgeColors: Record<string, string> = {
      header: '#34495E',
      hero: '#2980B9',
      section: '#7F8C8D',
      card: '#BDC3C7',
      grid: '#D5DBDB',
      list: '#ECF0F1',
      chart: '#95A5A6',
      cta: '#229954',
    };

    const bgColor = badgeColors[type] || '#95A5A6';

    return `
      <g>
        <rect x="${x}" y="${y}" width="70" height="18" fill="${bgColor}" rx="3"/>
        <text
          x="${x + 35}"
          y="${y + 13}"
          font-size="10"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          font-family="Arial, sans-serif"
        >
          ${type.toUpperCase()}
        </text>
      </g>
    `;
  }

  /**
   * Generate navigation controls for multi-screen wireframes
   */
  private generateNavigationControls(screenCount: number): string {
    let svg = `
      <g id="navigation" style="display: none;">
        <rect x="0" y="820" width="1200" height="60" fill="#F8F9F9" stroke="${this.colors.border}"/>
    `;

    // Previous button
    svg += `
      <g id="btn-prev" cursor="pointer" onclick="previousScreen()">
        <rect x="20" y="830" width="80" height="40" fill="#3498DB" rx="4"/>
        <text x="60" y="858" text-anchor="middle" fill="white" font-weight="bold">Previous</text>
      </g>
    `;

    // Screen counter
    svg += `
      <text x="600" y="858" text-anchor="middle" font-size="14" fill="${this.colors.text}" font-family="Arial">
        <tspan id="current-screen">1</tspan> / ${screenCount}
      </text>
    `;

    // Next button
    svg += `
      <g id="btn-next" cursor="pointer" onclick="nextScreen()">
        <rect x="1100" y="830" width="80" height="40" fill="#3498DB" rx="4"/>
        <text x="1140" y="858" text-anchor="middle" fill="white" font-weight="bold">Next</text>
      </g>
    `;

    svg += `</g>`;

    return svg;
  }

  /**
   * Create SVG header
   */
  private createSVGHeader(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1200 880"
  width="1200"
  height="880"
  style="background-color: #F5F5F5; border: 1px solid #DDD;"
>
  <defs>
    <style>
      .wireframe-block {
        transition: opacity 0.3s ease;
      }
      .wireframe-block:hover {
        opacity: 0.9;
      }
    </style>
  </defs>
  <title>Wireframe Layout</title>
`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate responsive SVG (scales based on viewport) - Multi-screen support
   */
  generateResponsiveSVG(layout: WireframeLayout): string {
    // Create SVG with proper dimensions for multi-screen layout
    // Each screen is 1200x880, plus padding between screens
    const screenHeight = 880;
    const screenWidth = 1200;
    const padding = 40;
    const totalHeight = (screenHeight + padding) * layout.screens.length;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1200 ${totalHeight}"
  preserveAspectRatio="xMidYMid meet"
  style="max-width: 100%; height: auto; border: 1px solid #DDD; background: #f9f9f9;"
>
  <defs>
    <style>
      .wireframe-block {
        transition: opacity 0.3s ease;
      }
      .wireframe-block:hover {
        opacity: 0.95 !important;
        cursor: pointer;
      }
      text {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .screen-header {
        font-size: 18px;
        font-weight: bold;
        fill: #2C3E50;
      }
      .screen-divider {
        stroke: #DDD;
        stroke-dasharray: 5,5;
      }
      .priority-badge, .category-badge {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      }
    </style>
  </defs>

  <!-- Render all screens with headers and dividers -->
`;

    layout.screens.forEach((screen, index) => {
      const yOffset = index * (screenHeight + padding);

      // Screen header with divider
      svg += `
      <g id="screen-header-${index}">
        <text x="20" y="${yOffset + 25}" class="screen-header">
          Screen ${index + 1}: ${screen.title}
        </text>
        <text x="20" y="${yOffset + 42}" style="font-size: 12px; fill: #7F8C8D;">
          ${screen.description || `${screen.blocks.length} elements`}
        </text>
        <line x1="0" y1="${yOffset + 55}" x2="1200" y2="${yOffset + 55}" class="screen-divider" />
      </g>

      <!-- Screen content with offset -->
      <g id="screen-${index}" transform="translate(0, ${yOffset + 60})">
        ${this.generateScreenContentSVG(screen)}
      </g>
      `;
    });

    svg += `</svg>`;

    return svg;
  }

  /**
   * Generate screen content (blocks only, no outer rect)
   */
  private generateScreenContentSVG(screen: WireframeScreen): string {
    let svg = '';

    // Render each block
    screen.blocks.forEach((block) => {
      svg += this.generateBlockSVG(block);
    });

    return svg;
  }

  /**
   * Generate wireframe as PNG-ready canvas data
   * Returns SVG that can be converted to image
   */
  generateWireframeForExport(layout: WireframeLayout, screenIndex: number = 0): string {
    const screen = layout.screens[screenIndex];
    if (!screen) {
      throw new Error(`Screen ${screenIndex} not found`);
    }

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1200 800"
  width="1200"
  height="800"
  style="background-color: #FFFFFF;"
>
  <title>${screen.title}</title>
`;

    svg += this.generateScreenSVG(screen);

    // Add metadata
    svg += `
      <text x="10" y="790" font-size="10" fill="#999" font-family="Arial">
        ${screen.name} | Generated by Formative.AI
      </text>
    `;

    svg += `</svg>`;

    return svg;
  }
}

export const svgWireframeGenerator = new SVGWireframeGenerator();
