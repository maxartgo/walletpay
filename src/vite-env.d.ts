/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_DESTINATION_WALLET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
