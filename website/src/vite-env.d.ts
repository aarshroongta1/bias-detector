/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHROME_EXTENSION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
