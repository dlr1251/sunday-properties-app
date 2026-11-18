import { defineAgent } from 'eve';

import { sunnyAgentConfig } from '../src/lib/sunny/agent-config';

/** Sunny — public Sunday Properties chat agent (eve runtime). */
export default defineAgent(sunnyAgentConfig());
