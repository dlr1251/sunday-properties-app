import { defineSandboxProvider, type SandboxConnection } from 'eve/sandbox/provider';

export type InertLucySandboxOptions = {
  /** Provider id recorded in the eve build manifest. */
  name: string;
  /** Prefix for errors when a sandbox-only tool is mistakenly enabled. */
  scope: string;
};

/**
 * Shared inert sandbox (same approach as Lucy PR #138). Without this, eve's
 * default provisions a Vercel Sandbox per chat session even when no sandbox
 * tool is enabled.
 */
export function createInertLucySandboxProvider({ name, scope }: InertLucySandboxOptions) {
  function refuse(): never {
    throw new Error(
      `${scope}: the agent has no sandbox; a sandbox tool is enabled that Sunny must not have.`,
    );
  }

  const connection: SandboxConnection = {
    spawn: refuse,
    readFile: refuse,
    writeFiles: refuse,
    removePath: refuse,
    stop: async () => {},
  };

  return defineSandboxProvider({
    name,
    environment() {
      return {
        async prepare() {
          return {};
        },
        async start() {
          return { connection, state: {} };
        },
        async resume() {
          return connection;
        },
        async onSessionEnd() {},
      };
    },
  });
}
