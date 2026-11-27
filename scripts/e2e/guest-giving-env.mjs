export const GUEST_GIVING_PORTS = {
  donor: Number(process.env.GUEST_GIVING_DONOR_PORT || 3165),
  admin: Number(process.env.GUEST_GIVING_ADMIN_PORT || 3166),
};

export const TURNSTILE_TEST_KEYS = {
  site: "1x00000000000000000000AA",
  secret: "1x0000000000000000000000000000000AA",
};

export const JOURNEY_PUBLISHABLE_KEY = [
  "pk",
  "test",
  "guestgivingjourney",
].join("_");
