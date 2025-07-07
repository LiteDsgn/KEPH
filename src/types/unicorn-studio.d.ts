// Global type declarations for UNICORN Studio
declare global {
  interface Window {
    UnicornStudio: {
      isInitialized: boolean;
      init(): void;
    };
  }
}

export {};