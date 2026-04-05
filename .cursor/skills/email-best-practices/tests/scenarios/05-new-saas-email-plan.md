# Scenario 5: New SaaS Email Infrastructure Plan

## Prompt

```
You are an AI coding assistant. A developer asks you:

"I'm building a new SaaS app and need to plan my entire email infrastructure. I need to know: (1) what types of transactional emails I should plan for, (2) how to set up DNS authentication, (3) how to warm up my sending domain, (4) how to handle bounces/complaints in production, and (5) what compliance requirements I need for international users. Give me a comprehensive implementation roadmap."

Be specific about: IP warming schedules (daily volumes by week), bounce rate thresholds, complaint rate thresholds, DNS record formats, and legal requirements by region.
```

## Expected Correctness Criteria

### Email planning (transactional-email-catalog.md)

- [ ] References the transactional email catalog for SaaS planning
- [ ] Covers at minimum: verification, password reset, OTP/2FA, security alerts, billing

### DNS authentication (deliverability.md)

- [ ] SPF, DKIM, DMARC records with examples
- [ ] DMARC rollout strategy (none -> quarantine; pct=25 -> reject)
- [ ] Dedicated subdomains for transactional vs marketing

### Warming (deliverability.md)

- [ ] Correct weekly schedule: 50-100 / 200-500 / 1k-2k / 5k-10k
- [ ] Start with engaged users, send consistently

### Bounce/complaint handling (deliverability.md + list-management.md + webhooks-events.md)

- [ ] Bounce thresholds: <1% good, >4% critical
- [ ] Complaint thresholds: <0.01% excellent, >0.05% critical
- [ ] Hard bounce: immediate suppression
- [ ] Soft bounce: suppress after 3 failures
- [ ] Complaint: immediate suppression
- [ ] Pre-send suppression check

### Compliance (compliance.md)

- [ ] Covers CAN-SPAM, GDPR, CASL
- [ ] Correct penalty amounts
- [ ] Correct unsubscribe timing by region
- [ ] Recommends GDPR as global standard

### Data retention (list-management.md)

- [ ] Send attempts: 90 days
- [ ] Bounce/complaint events: 3 years
- [ ] Suppression list: indefinite
- [ ] Email content: 30 days
- [ ] Consent records: 3 years after expiry

### Cross-resource synthesis

- [ ] Agent references multiple resource files (not just one)
- [ ] "Start Here" routing from SKILL.md is followed
