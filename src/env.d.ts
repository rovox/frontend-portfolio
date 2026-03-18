/// <reference types="astro/client" />
/// <reference types="@astrojs/react/client" />

declare global {
  interface Window {
    __portfolioLoaderDone?: boolean;
  }
}

export {};