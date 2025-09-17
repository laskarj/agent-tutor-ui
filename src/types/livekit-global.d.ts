// Minimal global declaration for LiveKit UMD loaded via CDN
// Provides loose typing to avoid TS errors without installing the package.

declare global {
  interface Window {
    livekitClient?: any; // set by UMD build
  }
}

export {};

