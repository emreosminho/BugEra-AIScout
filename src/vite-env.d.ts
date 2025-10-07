/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly VITE_HUGGINGFACE_MODEL: string
  readonly VITE_DEFAULT_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

