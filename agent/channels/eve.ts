import { defaultEveAuth, eveChannel } from 'eve/channels/eve';
import { localDev } from 'eve/channels/auth';

import { sunnyAnonSessionAuth } from '../lib/anon-auth';
import { isClaudeMcpCaller, mcpApiKeyAuth } from '../lib/mcp-auth';

const CLAUDE_MCP_CONTEXT =
  'Esta conversación llegó por el canal claude-mcp. Trátala como un visitante público de la web: mismas restricciones (sin direcciones, propietarios, oferta mínima, depósito ni notas internas).';

export default eveChannel({
  auth: [mcpApiKeyAuth(), sunnyAnonSessionAuth(), localDev()],
  turnPolicy: 'queue',
  onMessage(ctx) {
    const auth = defaultEveAuth(ctx);
    if (isClaudeMcpCaller(auth)) {
      return { auth, context: [CLAUDE_MCP_CONTEXT] };
    }
    return { auth };
  },
});
