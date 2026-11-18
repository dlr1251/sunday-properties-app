import { defineSandbox } from 'eve/sandbox';

import { createInertLucySandboxProvider } from './lib/no-sandbox';

const NoSandbox = createInertLucySandboxProvider({ name: 'sunny-none', scope: 'sunny' });

export const environment = NoSandbox.environment({});
export default defineSandbox(() => environment.open());
