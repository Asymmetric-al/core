import type { Capability } from "../../../packages/auth/capabilities/registry";

export const registered: Capability = "permissions.view";
export const unregistered: Capability = "admin.crm.delete"; // error TS2322
export const legacy: Capability = "finance:manage_contributions"; // error TS2322

const take = (capability: Capability) => capability;
export const passed = take("automation:manage"); // error TS2345
