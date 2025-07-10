// Client-side polyfill loader
// Import this in components that use async/await or generators

export async function ensurePolyfills() {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Ensure regeneratorRuntime is available
    if (!window.regeneratorRuntime) {
      try {
        const regeneratorRuntime = await import('regenerator-runtime/runtime');
        window.regeneratorRuntime = regeneratorRuntime.default || regeneratorRuntime;
      } catch (error) {
        console.warn('Failed to load regenerator-runtime:', error);
      }
    }
    
    // Ensure Promise is available
    if (typeof Promise === 'undefined') {
      try {
        await import('es6-promise/auto');
      } catch (error) {
        console.warn('Failed to load Promise polyfill:', error);
      }
    }
  }
}

// Auto-load polyfills when this module is imported
ensurePolyfills().catch(console.warn);

export default ensurePolyfills;
