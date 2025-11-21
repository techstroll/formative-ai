/**
 * Component Library with Metadata for Semantic Search
 * Used by vectorDbService for RAG pipeline component retrieval
 */

export interface ComponentMetadata {
  id: string;
  name: string;
  category: 'button' | 'input' | 'card' | 'layout' | 'navigation' | 'form' | 'feedback' | 'media' | 'other';
  description: string;
  usage: string;
  tags: string[];
  variants?: string[];
  props?: Array<{ name: string; type: string; required?: boolean; description?: string }>;
  designTokens?: {
    colors?: string[];
    spacing?: string[];
    typography?: string[];
  };
  relatedComponents?: string[];
}

export const COMPONENT_LIBRARY: ComponentMetadata[] = [
  // BUTTONS
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'button',
    description: 'Primary action button with full color background for main CTAs',
    usage: 'Use for primary actions like Submit, Create, Save, Send',
    tags: ['action', 'primary', 'interactive', 'cta', 'form'],
    variants: ['default', 'disabled', 'loading', 'outline'],
    props: [
      { name: 'label', type: 'string', required: true, description: 'Button text' },
      { name: 'onClick', type: 'function', required: true, description: 'Click handler' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disable button' },
      { name: 'loading', type: 'boolean', required: false, description: 'Show loading state' },
    ],
    designTokens: {
      colors: ['primary-600', 'primary-700'],
      spacing: ['padding-md', 'padding-lg'],
      typography: ['text-base', 'font-semibold'],
    },
    relatedComponents: ['btn-secondary', 'btn-danger'],
  },
  {
    id: 'btn-secondary',
    name: 'Secondary Button',
    category: 'button',
    description: 'Secondary action button with outline style for alternative actions',
    usage: 'Use for secondary actions like Cancel, Clear, Back, Delete',
    tags: ['action', 'secondary', 'interactive', 'alternative'],
    variants: ['default', 'disabled'],
    designTokens: {
      colors: ['gray-600', 'gray-700'],
      spacing: ['padding-md'],
      typography: ['text-base', 'font-medium'],
    },
    relatedComponents: ['btn-primary', 'btn-tertiary'],
  },
  {
    id: 'btn-danger',
    name: 'Danger Button',
    category: 'button',
    description: 'Destructive action button for delete/remove operations',
    usage: 'Use for destructive actions like Delete, Remove, Clear all data',
    tags: ['action', 'danger', 'destructive', 'warning'],
    variants: ['default', 'disabled'],
    designTokens: {
      colors: ['red-600', 'red-700'],
      spacing: ['padding-md'],
      typography: ['text-base', 'font-semibold'],
    },
    relatedComponents: ['btn-primary', 'btn-secondary'],
  },

  // INPUTS
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'input',
    description: 'Single-line text input for user data entry',
    usage: 'Use for email, names, URLs, single-line text',
    tags: ['form', 'input', 'text', 'data-entry'],
    props: [
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
      { name: 'value', type: 'string', required: false, description: 'Input value' },
      { name: 'onChange', type: 'function', required: true, description: 'Change handler' },
      { name: 'type', type: 'string', required: false, description: 'Input type (text, email, password, etc)' },
      { name: 'required', type: 'boolean', required: false, description: 'Mark as required' },
    ],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md', 'margin-sm'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-email', 'input-password', 'input-number'],
  },
  {
    id: 'input-email',
    name: 'Email Input',
    category: 'input',
    description: 'Specialized text input with email validation',
    usage: 'Use for email address entry with built-in validation',
    tags: ['form', 'input', 'email', 'validation'],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-text', 'input-password'],
  },
  {
    id: 'input-password',
    name: 'Password Input',
    category: 'input',
    description: 'Text input with masked characters for password entry',
    usage: 'Use for password entry with show/hide toggle',
    tags: ['form', 'input', 'password', 'security'],
    variants: ['masked', 'visible'],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-text', 'input-email'],
  },
  {
    id: 'input-textarea',
    name: 'Textarea Input',
    category: 'input',
    description: 'Multi-line text input for longer content',
    usage: 'Use for descriptions, comments, feedback',
    tags: ['form', 'input', 'text', 'multi-line'],
    props: [
      { name: 'rows', type: 'number', required: false, description: 'Number of rows' },
      { name: 'cols', type: 'number', required: false, description: 'Number of columns' },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
    ],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-text'],
  },
  {
    id: 'input-checkbox',
    name: 'Checkbox Input',
    category: 'input',
    description: 'Binary choice input for single or multiple selections',
    usage: 'Use for terms agreement, feature toggles, filters',
    tags: ['form', 'input', 'toggle', 'selection'],
    designTokens: {
      colors: ['primary-600', 'gray-200'],
      spacing: ['margin-sm'],
    },
    relatedComponents: ['input-radio', 'input-toggle'],
  },
  {
    id: 'input-radio',
    name: 'Radio Input',
    category: 'input',
    description: 'Mutually exclusive choice input',
    usage: 'Use for selecting one option from a list',
    tags: ['form', 'input', 'selection'],
    designTokens: {
      colors: ['primary-600', 'gray-200'],
      spacing: ['margin-sm'],
    },
    relatedComponents: ['input-checkbox', 'select-dropdown'],
  },
  {
    id: 'select-dropdown',
    name: 'Select Dropdown',
    category: 'input',
    description: 'Dropdown menu for selecting from predefined options',
    usage: 'Use for countries, categories, statuses',
    tags: ['form', 'input', 'selection', 'dropdown'],
    props: [
      { name: 'options', type: 'array', required: true, description: 'List of options' },
      { name: 'value', type: 'string', required: false, description: 'Selected value' },
      { name: 'onChange', type: 'function', required: true, description: 'Change handler' },
    ],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-radio', 'select-multiselect'],
  },

  // CARDS
  {
    id: 'card-basic',
    name: 'Basic Card',
    category: 'card',
    description: 'Container with shadow and padding for content grouping',
    usage: 'Use to group related content with visual separation',
    tags: ['layout', 'container', 'grouping'],
    designTokens: {
      colors: ['white', 'gray-100'],
      spacing: ['padding-lg', 'margin-md'],
    },
    relatedComponents: ['card-image', 'card-product'],
  },
  {
    id: 'card-image',
    name: 'Image Card',
    category: 'card',
    description: 'Card with image header and content below',
    usage: 'Use for articles, blog posts, portfolio items',
    tags: ['layout', 'media', 'content'],
    props: [
      { name: 'image', type: 'string', required: true, description: 'Image URL' },
      { name: 'title', type: 'string', required: true, description: 'Card title' },
    ],
    designTokens: {
      colors: ['white', 'gray-100'],
      spacing: ['padding-lg'],
    },
    relatedComponents: ['card-basic', 'card-product'],
  },
  {
    id: 'card-product',
    name: 'Product Card',
    category: 'card',
    description: 'Card specifically designed for product display with price and rating',
    usage: 'Use in product listings, marketplace, ecommerce',
    tags: ['layout', 'product', 'commerce'],
    props: [
      { name: 'image', type: 'string', required: true, description: 'Product image' },
      { name: 'name', type: 'string', required: true, description: 'Product name' },
      { name: 'price', type: 'number', required: true, description: 'Product price' },
      { name: 'rating', type: 'number', required: false, description: 'Star rating' },
    ],
    designTokens: {
      colors: ['white', 'primary-600'],
      spacing: ['padding-lg'],
      typography: ['text-base'],
    },
    relatedComponents: ['card-basic', 'card-image'],
  },

  // LAYOUT
  {
    id: 'layout-container',
    name: 'Container Layout',
    category: 'layout',
    description: 'Max-width container for content constraint',
    usage: 'Use to constrain content width and center on page',
    tags: ['layout', 'structure'],
    designTokens: {
      spacing: ['padding-lg', 'margin-auto'],
    },
    relatedComponents: ['layout-grid', 'layout-flex'],
  },
  {
    id: 'layout-grid',
    name: 'Grid Layout',
    category: 'layout',
    description: 'CSS Grid based layout for responsive columns',
    usage: 'Use for multi-column product listings, dashboards',
    tags: ['layout', 'structure', 'responsive'],
    props: [
      { name: 'columns', type: 'number', required: false, description: 'Number of columns' },
      { name: 'gap', type: 'string', required: false, description: 'Gap between items' },
    ],
    designTokens: {
      spacing: ['gap-md', 'gap-lg'],
    },
    relatedComponents: ['layout-flex', 'layout-container'],
  },
  {
    id: 'layout-flex',
    name: 'Flex Layout',
    category: 'layout',
    description: 'Flexbox based layout for flexible arrangement',
    usage: 'Use for navigation, toolbars, form layouts',
    tags: ['layout', 'structure', 'flexible'],
    designTokens: {
      spacing: ['gap-md', 'gap-lg'],
    },
    relatedComponents: ['layout-grid', 'layout-container'],
  },

  // NAVIGATION
  {
    id: 'nav-header',
    name: 'Header Navigation',
    category: 'navigation',
    description: 'Main navigation bar at top of page',
    usage: 'Use as main site header with logo and menu',
    tags: ['navigation', 'header', 'menu'],
    designTokens: {
      colors: ['white', 'gray-900'],
      spacing: ['padding-lg'],
      typography: ['text-base', 'font-semibold'],
    },
    relatedComponents: ['nav-sidebar', 'nav-footer'],
  },
  {
    id: 'nav-sidebar',
    name: 'Sidebar Navigation',
    category: 'navigation',
    description: 'Vertical sidebar menu for navigation',
    usage: 'Use for main application navigation on desktop',
    tags: ['navigation', 'menu', 'sidebar'],
    designTokens: {
      colors: ['gray-900', 'white'],
      spacing: ['padding-md'],
    },
    relatedComponents: ['nav-header', 'nav-footer'],
  },
  {
    id: 'nav-footer',
    name: 'Footer Navigation',
    category: 'navigation',
    description: 'Footer section with links and information',
    usage: 'Use at bottom of page for secondary links and info',
    tags: ['navigation', 'footer', 'meta'],
    designTokens: {
      colors: ['gray-900', 'gray-200'],
      spacing: ['padding-lg'],
    },
    relatedComponents: ['nav-header', 'nav-sidebar'],
  },
  {
    id: 'nav-breadcrumb',
    name: 'Breadcrumb Navigation',
    category: 'navigation',
    description: 'Hierarchical navigation showing current location',
    usage: 'Use to show user location in site hierarchy',
    tags: ['navigation', 'hierarchy', 'wayfinding'],
    designTokens: {
      colors: ['gray-600', 'primary-600'],
      spacing: ['margin-sm'],
      typography: ['text-sm'],
    },
    relatedComponents: ['nav-header', 'nav-sidebar'],
  },

  // FORM
  {
    id: 'form-group',
    name: 'Form Group',
    category: 'form',
    description: 'Container for label, input, and help text',
    usage: 'Use to structure form fields with consistent spacing',
    tags: ['form', 'structure'],
    designTokens: {
      spacing: ['margin-md', 'gap-sm'],
    },
    relatedComponents: ['form-label', 'form-error'],
  },
  {
    id: 'form-label',
    name: 'Form Label',
    category: 'form',
    description: 'Label text for form inputs',
    usage: 'Use with form inputs for accessibility',
    tags: ['form', 'text', 'accessibility'],
    designTokens: {
      typography: ['text-sm', 'font-medium'],
      colors: ['gray-900'],
    },
    relatedComponents: ['form-group', 'form-error'],
  },
  {
    id: 'form-error',
    name: 'Form Error Message',
    category: 'form',
    description: 'Error message display for form validation',
    usage: 'Use to show validation errors under inputs',
    tags: ['form', 'validation', 'feedback'],
    designTokens: {
      colors: ['red-600'],
      typography: ['text-sm'],
    },
    relatedComponents: ['form-group', 'form-label'],
  },

  // FEEDBACK
  {
    id: 'feedback-alert',
    name: 'Alert Message',
    category: 'feedback',
    description: 'Alert notification for user attention',
    usage: 'Use for important messages, warnings, errors',
    tags: ['feedback', 'notification', 'alert'],
    variants: ['success', 'error', 'warning', 'info'],
    designTokens: {
      colors: ['red-600', 'yellow-600', 'green-600', 'blue-600'],
      spacing: ['padding-md'],
    },
    relatedComponents: ['feedback-toast', 'feedback-modal'],
  },
  {
    id: 'feedback-toast',
    name: 'Toast Notification',
    category: 'feedback',
    description: 'Temporary notification that auto-dismisses',
    usage: 'Use for brief notifications like saved/deleted success',
    tags: ['feedback', 'notification', 'temporary'],
    designTokens: {
      colors: ['gray-900', 'white'],
      spacing: ['padding-md'],
    },
    relatedComponents: ['feedback-alert', 'feedback-modal'],
  },
  {
    id: 'feedback-modal',
    name: 'Modal Dialog',
    category: 'feedback',
    description: 'Modal overlay for user interaction and confirmation',
    usage: 'Use for confirmations, forms, detailed information',
    tags: ['feedback', 'dialog', 'interactive'],
    designTokens: {
      colors: ['white', 'gray-900'],
      spacing: ['padding-lg'],
    },
    relatedComponents: ['feedback-alert', 'feedback-toast'],
  },

  // MEDIA
  {
    id: 'media-image',
    name: 'Image Component',
    category: 'media',
    description: 'Responsive image with lazy loading support',
    usage: 'Use for all images with proper responsive behavior',
    tags: ['media', 'image', 'responsive'],
    props: [
      { name: 'src', type: 'string', required: true, description: 'Image source URL' },
      { name: 'alt', type: 'string', required: true, description: 'Alt text for accessibility' },
    ],
    designTokens: {
      spacing: ['margin-md'],
    },
    relatedComponents: ['media-video'],
  },
  {
    id: 'media-video',
    name: 'Video Component',
    category: 'media',
    description: 'Responsive video player',
    usage: 'Use for video content embedding',
    tags: ['media', 'video'],
    props: [
      { name: 'src', type: 'string', required: true, description: 'Video source URL' },
      { name: 'controls', type: 'boolean', required: false, description: 'Show player controls' },
    ],
    designTokens: {
      spacing: ['margin-md'],
    },
    relatedComponents: ['media-image'],
  },

  // SEARCH AND FILTER
  {
    id: 'search-bar',
    name: 'Search Bar',
    category: 'input',
    description: 'Input field optimized for search functionality',
    usage: 'Use for main search, filters, keyword search',
    tags: ['search', 'input', 'filtering'],
    designTokens: {
      colors: ['gray-200', 'gray-600'],
      spacing: ['padding-md'],
      typography: ['text-base'],
    },
    relatedComponents: ['input-text', 'select-dropdown'],
  },
  {
    id: 'filter-panel',
    name: 'Filter Panel',
    category: 'input',
    description: 'Panel with multiple filter options',
    usage: 'Use for product filters, advanced search',
    tags: ['filtering', 'input', 'search'],
    designTokens: {
      colors: ['white', 'gray-100'],
      spacing: ['padding-lg'],
    },
    relatedComponents: ['search-bar', 'select-dropdown'],
  },

  // DATA DISPLAY
  {
    id: 'table-basic',
    name: 'Data Table',
    category: 'other',
    description: 'Table for displaying tabular data',
    usage: 'Use for lists of data, records, transactions',
    tags: ['data', 'table', 'display'],
    designTokens: {
      colors: ['white', 'gray-100'],
      spacing: ['padding-md'],
      typography: ['text-sm'],
    },
    relatedComponents: ['card-basic'],
  },
  {
    id: 'list-basic',
    name: 'List Component',
    category: 'other',
    description: 'Vertical list of items',
    usage: 'Use for menus, todo lists, item listings',
    tags: ['data', 'list', 'display'],
    designTokens: {
      spacing: ['padding-sm', 'margin-sm'],
    },
    relatedComponents: ['table-basic'],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'other',
    description: 'Navigation for paginated content',
    usage: 'Use to split large lists into pages',
    tags: ['navigation', 'pagination', 'data'],
    designTokens: {
      colors: ['primary-600', 'gray-200'],
      spacing: ['padding-sm'],
    },
    relatedComponents: ['table-basic', 'list-basic'],
  },

  // PROGRESS
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    category: 'feedback',
    description: 'Visual progress indicator for processes',
    usage: 'Use for upload progress, loading states, task completion',
    tags: ['feedback', 'progress'],
    designTokens: {
      colors: ['primary-600', 'gray-200'],
      spacing: ['height-md'],
    },
    relatedComponents: ['feedback-toast'],
  },
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    category: 'feedback',
    description: 'Animated loading indicator',
    usage: 'Use during async operations, data loading',
    tags: ['feedback', 'loading'],
    designTokens: {
      colors: ['primary-600'],
    },
    relatedComponents: ['progress-bar'],
  },

  // BADGE
  {
    id: 'badge-basic',
    name: 'Badge',
    category: 'feedback',
    description: 'Small label or status indicator',
    usage: 'Use for status, tags, counts',
    tags: ['feedback', 'status', 'label'],
    variants: ['success', 'error', 'warning', 'info'],
    designTokens: {
      colors: ['primary-600', 'white'],
      spacing: ['padding-xs'],
      typography: ['text-xs', 'font-bold'],
    },
    relatedComponents: ['badge-icon'],
  },
  {
    id: 'badge-icon',
    name: 'Icon Badge',
    category: 'feedback',
    description: 'Badge with icon indicator',
    usage: 'Use for notifications, unread counts with icon',
    tags: ['feedback', 'status', 'notification'],
    designTokens: {
      colors: ['primary-600', 'white'],
    },
    relatedComponents: ['badge-basic'],
  },

  // AVATAR
  {
    id: 'avatar-basic',
    name: 'Avatar',
    category: 'media',
    description: 'User profile picture or placeholder',
    usage: 'Use for user profiles, team members, comments',
    tags: ['media', 'user', 'profile'],
    variants: ['small', 'medium', 'large'],
    designTokens: {
      colors: ['gray-200', 'primary-600'],
      spacing: ['size-sm', 'size-md', 'size-lg'],
    },
    relatedComponents: ['media-image'],
  },
];

// Export for direct use
export const getComponentById = (id: string): ComponentMetadata | undefined => {
  return COMPONENT_LIBRARY.find(c => c.id === id);
};

export const getComponentsByCategory = (category: string): ComponentMetadata[] => {
  return COMPONENT_LIBRARY.filter(c => c.category === category);
};

export const searchComponents = (query: string): ComponentMetadata[] => {
  const lowerQuery = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
