/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUNNY_CHAT_ENABLED?: string;
  readonly VITE_SUNNY_AGENT_NAME?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
