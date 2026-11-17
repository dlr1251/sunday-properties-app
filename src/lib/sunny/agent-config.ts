import type { defineAgent } from 'eve';
import { defineDynamic } from 'eve/models';

import { sunnyLiteModelId, sunnyPrimaryModelId, sunnySessionSpendCapCents } from './config';
import { classifySunnyModelRoute, sunnyRoutingTurnContext } from './model-routing';

type AgentDefinition = Parameters<typeof defineAgent>[0];
type Env = Readonly<Record<string, string | undefined>>;

function sunnyModelOptions() {
  return {
    providerOptions: {
      anthropic: {
        thinking: { type: 'disabled' as const },
        effort: 'low' as const,
      },
      gateway: {
        caching: 'auto' as const,
      },
    },
  };
}

function modelSelection(modelId: string) {
  return {
    model: modelId,
    reasoning: 'none' as const,
    modelOptions: sunnyModelOptions(),
  };
}

function sunnyAgentModel(env: Env): AgentDefinition['model'] {
  return defineDynamic(async (ctx) => {
    const messages = await ctx.messages();
    const turn = sunnyRoutingTurnContext(messages);
    if (classifySunnyModelRoute(turn) === 'lite') {
      return modelSelection(sunnyLiteModelId(env));
    }
    return modelSelection(sunnyPrimaryModelId(env));
  });
}

export function sunnyAgentConfig(env: Env = process.env): AgentDefinition {
  const capCents = sunnySessionSpendCapCents(env);
  return {
    model: sunnyAgentModel(env),
    defaultTools: false,
    ...(capCents
      ? {
          limits: {
            sessionUsage: ({ total }: { total: { inputTokens: number; outputTokens: number } }) => {
              const spent =
                (total.inputTokens / 1_000_000) * 10 + (total.outputTokens / 1_000_000) * 50;
              return spent * 100 >= capCents;
            },
          },
        }
      : {}),
  } as AgentDefinition;
}
