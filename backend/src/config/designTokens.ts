/**
 * Design Tokens System
 * Central source of truth for design values used across the wireframe generation system
 */

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, { fontSize: string; fontWeight: string; lineHeight: string }>;
  breakpoints: Record<string, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

export const DESIGN_TOKENS: DesignTokens = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    'primary-50': '#f0f9ff',
    'primary-100': '#e0f2fe',
    'primary-200': '#bae6fd',
    'primary-300': '#7dd3fc',
    'primary-400': '#38bdf8',
    'primary-500': '#0ea5e9',
    'primary-600': '#0284c7',
    'primary-700': '#0369a1',
    'primary-800': '#075985',
    'primary-900': '#0c3d66',

    // Neutral/Gray Colors
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',

    // Success Colors
    'success-50': '#f0fdf4',
    'success-100': '#dcfce7',
    'success-200': '#bbf7d0',
    'success-300': '#86efac',
    'success-400': '#4ade80',
    'success-500': '#22c55e',
    'success-600': '#16a34a',
    'success-700': '#15803d',
    'success-800': '#166534',
    'success-900': '#145231',

    // Warning/Yellow Colors
    'warning-50': '#fffbeb',
    'warning-100': '#fef3c7',
    'warning-200': '#fde68a',
    'warning-300': '#fcd34d',
    'warning-400': '#fbbf24',
    'warning-500': '#f59e0b',
    'warning-600': '#d97706',
    'warning-700': '#b45309',
    'warning-800': '#92400e',
    'warning-900': '#78350f',

    // Error/Red Colors
    'error-50': '#fef2f2',
    'error-100': '#fee2e2',
    'error-200': '#fecaca',
    'error-300': '#fca5a5',
    'error-400': '#f87171',
    'error-500': '#ef4444',
    'error-600': '#dc2626',
    'error-700': '#b91c1c',
    'error-800': '#991b1b',
    'error-900': '#7f1d1d',

    // Info/Blue Colors
    'info-50': '#f0f9ff',
    'info-100': '#e0f2fe',
    'info-200': '#bae6fd',
    'info-300': '#7dd3fc',
    'info-400': '#38bdf8',
    'info-500': '#0ea5e9',
    'info-600': '#0284c7',
    'info-700': '#0369a1',
    'info-800': '#075985',
    'info-900': '#0c3d66',

    // Semantic Colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // Accent Colors
    'accent-purple': '#8b5cf6',
    'accent-pink': '#ec4899',
    'accent-orange': '#f97316',
  },

  // Spacing/Sizing Scale (based on 4px grid)
  spacing: {
    'none': '0',
    'xs': '2px',
    'sm': '4px',
    'base': '8px',
    'md': '12px',
    'lg': '16px',
    'xl': '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '48px',
    '5xl': '56px',
    '6xl': '64px',

    // Padding variants
    'padding-xs': '2px',
    'padding-sm': '4px',
    'padding-base': '8px',
    'padding-md': '12px',
    'padding-lg': '16px',
    'padding-xl': '24px',
    'padding-2xl': '32px',

    // Margin variants
    'margin-xs': '2px',
    'margin-sm': '4px',
    'margin-base': '8px',
    'margin-md': '12px',
    'margin-lg': '16px',
    'margin-xl': '24px',
    'margin-2xl': '32px',

    // Gap variants (flexbox/grid)
    'gap-xs': '2px',
    'gap-sm': '4px',
    'gap-base': '8px',
    'gap-md': '12px',
    'gap-lg': '16px',
    'gap-xl': '24px',
    'gap-2xl': '32px',

    // Heights
    'height-xs': '20px',
    'height-sm': '32px',
    'height-md': '40px',
    'height-lg': '48px',
    'height-xl': '56px',
    'height-2xl': '64px',

    // Widths
    'width-full': '100%',
    'width-half': '50%',
    'width-third': '33.33%',
    'width-two-thirds': '66.66%',
  },

  // Typography System
  typography: {
    // Display/Hero Sizes
    'display-lg': {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    'display-md': {
      fontSize: '40px',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    'display-sm': {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
    },

    // Heading Sizes
    'h1': {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    'h2': {
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '1.3',
    },
    'h3': {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3',
    },
    'h4': {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
    },
    'h5': {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.4',
    },
    'h6': {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.5',
    },

    // Body Text
    'body-lg': {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    'body-base': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'body-md': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'body-sm': {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.4',
    },

    // Specific Variants
    'text-base': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'text-sm': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'text-xs': {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.4',
    },
    'text-lg': {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
    },

    // Font Weight Utilities
    'font-light': {
      fontSize: '16px',
      fontWeight: '300',
      lineHeight: '1.5',
    },
    'font-normal': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    'font-medium': {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '1.5',
    },
    'font-semibold': {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.5',
    },
    'font-bold': {
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '1.5',
    },
  },

  // Responsive Breakpoints
  breakpoints: {
    'xs': '320px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },

  // Shadows
  shadows: {
    'none': 'none',
    'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Border Radius
  borderRadius: {
    'none': '0',
    'xs': '2px',
    'sm': '4px',
    'base': '6px',
    'md': '8px',
    'lg': '12px',
    'xl': '16px',
    '2xl': '20px',
    '3xl': '24px',
    'full': '9999px',
  },
};

// Helper functions for accessing tokens
export const getColor = (colorKey: string): string => {
  return DESIGN_TOKENS.colors[colorKey] || '#000000';
};

export const getSpacing = (spacingKey: string): string => {
  return DESIGN_TOKENS.spacing[spacingKey] || '0';
};

export const getTypography = (typographyKey: string) => {
  return DESIGN_TOKENS.typography[typographyKey] || DESIGN_TOKENS.typography['body-base'];
};

export const getBreakpoint = (breakpointKey: string): string => {
  return DESIGN_TOKENS.breakpoints[breakpointKey] || '768px';
};

export const getShadow = (shadowKey: string): string => {
  return DESIGN_TOKENS.shadows[shadowKey] || 'none';
};

export const getBorderRadius = (radiusKey: string): string => {
  return DESIGN_TOKENS.borderRadius[radiusKey] || '0';
};

// Export as JSON for use in other tools/configs
export const designTokensJSON = JSON.stringify(DESIGN_TOKENS, null, 2);
