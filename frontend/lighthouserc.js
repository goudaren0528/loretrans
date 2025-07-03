module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/creole-to-english',
        'http://localhost:3000/lao-to-english',
        'http://localhost:3000/burmese-to-english',
        'http://localhost:3000/swahili-to-english',
        'http://localhost:3000/telugu-to-english',
        'http://localhost:3000/text-translate',
        'http://localhost:3000/about',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best Practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'hreflang': 'warn',
        'canonical': 'warn',
        
        // Performance
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        
        // Progressive Web App
        'installable-manifest': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        'content-width': 'error',
        'viewport': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-results',
    },
  },
}
