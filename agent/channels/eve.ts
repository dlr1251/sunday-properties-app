import { eveChannel } from 'eve/channels/eve';
import { localDev } from 'eve/channels/auth';

import { sunnyAnonSessionAuth } from '../lib/anon-auth';

export default eveChannel({
  auth: [sunnyAnonSessionAuth(), localDev()],
  turnPolicy: 'queue',
});
