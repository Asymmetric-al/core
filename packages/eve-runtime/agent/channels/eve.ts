import { localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

import {
  adminEveRouteAuth,
  adminEveSessionEvents,
  withAdminSessionCreationClaim,
} from "../../src/admin-session-auth";

export default withAdminSessionCreationClaim(
  eveChannel({
    auth: [adminEveRouteAuth, localDev()],
    events: adminEveSessionEvents,
    uploadPolicy: "disabled",
  }),
);
