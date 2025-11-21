/**
 * Feature → Component Mapping Configuration
 *
 * Maps feature categories to appropriate UI components based on semantic analysis.
 * Replaces generic "card" blocks with feature-specific component recommendations.
 */

export interface FeatureComponentMapping {
  category: string;
  patterns: string[];  // Keywords that match this category
  description: string;
  requiredComponents: string[];  // Must-have component IDs
  optionalComponents: string[];  // Nice-to-have component IDs
  layoutPattern: 'form' | 'grid' | 'list' | 'dashboard' | 'detail' | 'hero' | 'split';
  priority: 'high' | 'medium' | 'low';
  designGuidance: string;
}

/**
 * Comprehensive feature category mappings
 */
export const FEATURE_COMPONENT_MAPPINGS: FeatureComponentMapping[] = [
  // Authentication & User Management
  {
    category: 'authentication',
    patterns: ['auth', 'login', 'signup', 'sign in', 'sign up', 'register', 'password', 'forgot password', 'reset password', 'verification', '2fa', 'two-factor'],
    description: 'User authentication and account access',
    requiredComponents: ['input-email', 'input-password', 'btn-primary', 'form-group', 'form-label'],
    optionalComponents: ['input-checkbox', 'form-error', 'feedback-alert', 'btn-secondary'],
    layoutPattern: 'form',
    priority: 'high',
    designGuidance: 'Center-aligned form with clear hierarchy, prominent CTA button, secondary actions below',
  },

  // Dashboard & Overview
  {
    category: 'dashboard',
    patterns: ['dashboard', 'overview', 'home', 'main', 'summary', 'analytics', 'metrics', 'stats', 'kpi', 'insights'],
    description: 'Overview screen with key metrics and information',
    requiredComponents: ['card-basic', 'layout-grid', 'nav-header'],
    optionalComponents: ['chart-basic', 'badge', 'progress-bar', 'data-table'],
    layoutPattern: 'dashboard',
    priority: 'high',
    designGuidance: 'Grid layout with metric cards, use spacing for visual hierarchy, group related information',
  },

  // Search & Discovery
  {
    category: 'search',
    patterns: ['search', 'find', 'discover', 'explore', 'browse', 'filter', 'lookup'],
    description: 'Search and content discovery features',
    requiredComponents: ['input-search', 'list', 'card-basic'],
    optionalComponents: ['input-dropdown', 'input-checkbox', 'badge', 'pagination'],
    layoutPattern: 'list',
    priority: 'high',
    designGuidance: 'Prominent search bar at top, filter options sidebar or top, results in list or grid',
  },

  // User Profile & Settings
  {
    category: 'profile',
    patterns: ['profile', 'account', 'settings', 'preferences', 'user', 'edit profile', 'personal'],
    description: 'User profile and account management',
    requiredComponents: ['form-group', 'input-text', 'btn-primary', 'avatar'],
    optionalComponents: ['input-email', 'input-dropdown', 'input-checkbox', 'btn-secondary'],
    layoutPattern: 'form',
    priority: 'medium',
    designGuidance: 'Sections for different settings groups, save/cancel buttons at bottom or sticky',
  },

  // E-commerce & Shopping
  {
    category: 'ecommerce',
    patterns: ['shop', 'store', 'product', 'cart', 'checkout', 'purchase', 'buy', 'order', 'payment', 'catalog'],
    description: 'E-commerce and shopping features',
    requiredComponents: ['card-product', 'btn-primary', 'layout-grid'],
    optionalComponents: ['image', 'badge', 'btn-secondary', 'data-table', 'pagination'],
    layoutPattern: 'grid',
    priority: 'high',
    designGuidance: 'Product cards in grid, prominent pricing and CTA, use badges for promotions',
  },

  // Data Visualization & Analytics
  {
    category: 'analytics',
    patterns: ['analytics', 'report', 'data', 'chart', 'graph', 'visualization', 'metrics', 'statistics'],
    description: 'Data visualization and reporting',
    requiredComponents: ['chart-basic', 'data-table', 'card-basic'],
    optionalComponents: ['input-dropdown', 'input-date', 'badge', 'progress-bar'],
    layoutPattern: 'dashboard',
    priority: 'medium',
    designGuidance: 'Charts above tables, filter controls at top, use cards to group related metrics',
  },

  // Notifications & Alerts
  {
    category: 'notifications',
    patterns: ['notification', 'alert', 'message', 'inbox', 'updates', 'activity', 'feed'],
    description: 'Notifications and activity feed',
    requiredComponents: ['list', 'badge', 'feedback-alert'],
    optionalComponents: ['avatar', 'btn-secondary', 'pagination'],
    layoutPattern: 'list',
    priority: 'medium',
    designGuidance: 'List layout with timestamps, unread indicators (badges), group by date or category',
  },

  // Social & Community
  {
    category: 'social',
    patterns: ['social', 'feed', 'post', 'comment', 'like', 'share', 'follow', 'community', 'chat', 'messaging'],
    description: 'Social features and user interactions',
    requiredComponents: ['card-basic', 'avatar', 'list'],
    optionalComponents: ['input-text', 'btn-primary', 'badge', 'image'],
    layoutPattern: 'list',
    priority: 'medium',
    designGuidance: 'Feed layout with user avatars, action buttons (like, comment), timestamps',
  },

  // Content Management
  {
    category: 'content',
    patterns: ['content', 'editor', 'create', 'write', 'publish', 'cms', 'article', 'blog', 'page'],
    description: 'Content creation and management',
    requiredComponents: ['input-textarea', 'btn-primary', 'form-group'],
    optionalComponents: ['input-text', 'input-dropdown', 'btn-secondary', 'feedback-alert'],
    layoutPattern: 'form',
    priority: 'medium',
    designGuidance: 'Large text area for content, toolbar above, save/publish buttons prominent',
  },

  // File Management
  {
    category: 'files',
    patterns: ['file', 'upload', 'download', 'document', 'attachment', 'media', 'gallery', 'library'],
    description: 'File and media management',
    requiredComponents: ['card-basic', 'layout-grid', 'btn-primary'],
    optionalComponents: ['image', 'badge', 'list', 'pagination'],
    layoutPattern: 'grid',
    priority: 'low',
    designGuidance: 'Grid or list view toggle, file previews, upload button prominent, filters for file types',
  },

  // Admin & Management
  {
    category: 'admin',
    patterns: ['admin', 'manage', 'control panel', 'configuration', 'system', 'users', 'permissions', 'roles'],
    description: 'Administrative and management features',
    requiredComponents: ['data-table', 'btn-primary', 'nav-sidebar'],
    optionalComponents: ['input-search', 'input-dropdown', 'badge', 'pagination', 'modal'],
    layoutPattern: 'dashboard',
    priority: 'high',
    designGuidance: 'Table layout with actions, filter/search at top, sidebar navigation for sections',
  },

  // Forms & Data Entry
  {
    category: 'forms',
    patterns: ['form', 'input', 'entry', 'submit', 'questionnaire', 'survey', 'wizard', 'step'],
    description: 'Data entry and form-based features',
    requiredComponents: ['form-group', 'input-text', 'btn-primary', 'form-label'],
    optionalComponents: ['input-email', 'input-dropdown', 'input-checkbox', 'input-radio', 'form-error', 'btn-secondary'],
    layoutPattern: 'form',
    priority: 'medium',
    designGuidance: 'Single column layout, logical field grouping, required field indicators, validation messages',
  },

  // Help & Support
  {
    category: 'help',
    patterns: ['help', 'support', 'faq', 'documentation', 'guide', 'tutorial', 'contact', 'feedback'],
    description: 'Help and support features',
    requiredComponents: ['card-basic', 'list', 'input-search'],
    optionalComponents: ['feedback-alert', 'modal', 'btn-primary', 'breadcrumb'],
    layoutPattern: 'list',
    priority: 'low',
    designGuidance: 'Searchable content, accordion or card layout, contact options prominent',
  },

  // Generic/Fallback (catch-all for unmapped features)
  {
    category: 'generic',
    patterns: ['feature', 'custom', 'other', 'miscellaneous'],
    description: 'Generic feature without specific mapping',
    requiredComponents: ['card-basic', 'layout-flex'],
    optionalComponents: ['btn-primary', 'list', 'image'],
    layoutPattern: 'detail',
    priority: 'medium',
    designGuidance: 'Flexible layout with clear sections, use cards for grouping, buttons for actions',
  },
];

/**
 * Find the best matching feature category for a given feature
 */
export function matchFeatureToCategory(featureName: string, featureDescription?: string): FeatureComponentMapping {
  const searchText = `${featureName} ${featureDescription || ''}`.toLowerCase();

  // Try to find exact pattern match
  for (const mapping of FEATURE_COMPONENT_MAPPINGS) {
    if (mapping.category === 'generic') continue; // Skip generic, save for fallback

    for (const pattern of mapping.patterns) {
      if (searchText.includes(pattern.toLowerCase())) {
        return mapping;
      }
    }
  }

  // Fallback to generic mapping
  return FEATURE_COMPONENT_MAPPINGS.find(m => m.category === 'generic')!;
}

/**
 * Get all components (required + optional) for a mapping
 */
export function getAllComponents(mapping: FeatureComponentMapping): string[] {
  return [...mapping.requiredComponents, ...mapping.optionalComponents];
}

/**
 * Get layout pattern for a feature category
 */
export function getLayoutPattern(category: string): string {
  const mapping = FEATURE_COMPONENT_MAPPINGS.find(m => m.category === category);
  return mapping?.layoutPattern || 'detail';
}
