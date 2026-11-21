const meta = { name: "fault" };
const create = JSON.parse.bind(JSON, "fixture-plugin-crash");
export default { meta, rules: { crash: { create } } };
