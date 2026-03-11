# Scenario 2: Multi-Region Email Compliance

## Prompt

```
You are an AI coding assistant. A developer asks you:

"I'm building an email newsletter for my SaaS product. I have users in the US, EU, and Canada. What legal requirements do I need to follow? Give me a comparison table of requirements by region and the specific implementation steps."

Be specific about penalty amounts, timing requirements for unsubscribe processing, and consent record requirements.
```

## Expected Correctness Criteria

### Penalties (compliance.md)

- [ ] CAN-SPAM: $53k/email
- [ ] GDPR: EUR 20M or 4% revenue
- [ ] CASL: $1M (individual) to $10M (organization) CAD

### Consent types (compliance.md)

- [ ] CAN-SPAM: opt-out model (can send without opt-in)
- [ ] GDPR: explicit opt-in (no pre-checked boxes)
- [ ] CASL express: explicit opt-in
- [ ] CASL implied: existing relationship (2 years) or inquiry (6 months)

### Unsubscribe timing (compliance.md)

- [ ] CAN-SPAM: 10 business days, must work 30 days after send
- [ ] GDPR: immediately, as easy as opting in
- [ ] CASL: 10 business days, must work 60 days after send

### CASL specifics (compliance.md)

- [ ] Sender identification valid 60 days after send
- [ ] Keep consent records 3 years after expiration

### Consent records (compliance.md)

- [ ] Record: email, date/time, method, what consented to, source

### International sending (compliance.md)

- [ ] Best practice: follow GDPR (most restrictive) for all regions

### Managing preferences vs unsubscribe (compliance.md)

- [ ] One-click unsubscribe required; preference management is nice-to-have, doesn't replace unsubscribe

### List-Unsubscribe header (compliance.md)

- [ ] Required by Gmail/Yahoo since Feb 2024
- [ ] Headers: `List-Unsubscribe` URL + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
- [ ] Endpoint: POST returns 200/202, GET shows unsubscribe page
- [ ] Stop sending within 48 hours
