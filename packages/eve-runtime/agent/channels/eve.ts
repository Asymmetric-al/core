import { localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

import {
  adminEveRouteAuth,
  adminEveSessionEvents,
} from "../../src/admin-session-auth";

export default eveChannel({
  auth: [adminEveRouteAuth, localDev()],
  events: adminEveSessionEvents,
  uploadPolicy: "disabled",
});
