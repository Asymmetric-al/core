# Scenario 1: Emails Going to Spam

## Prompt

```
You are an AI coding assistant. A developer asks you:

"My transactional emails (password resets, order confirmations) are going to spam in Gmail. What do I do to fix this?"

Answer with specific, actionable steps. Include exact DNS records, commands to verify, and threshold numbers where relevant.

Format your response as a numbered action plan.
```

## Expected Correctness Criteria

The agent MUST include these skill-specific details:

### Authentication (deliverability.md)

- [ ] SPF record example: `v=spf1 include:amazonses.com ~all`
- [ ] DKIM: provider supplies the record
- [ ] DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
- [ ] DMARC rollout: `p=none` → `p=quarantine; pct=25` → `p=reject`
- [ ] Verification commands: `dig TXT yourdomain.com +short`, `dig TXT resend._domainkey.yourdomain.com +short`, `dig TXT _dmarc.yourdomain.com +short`

### Thresholds (deliverability.md)

- [ ] Bounce targets: <1% good, 1-3% acceptable, 3-4% concerning, >4% critical
- [ ] Complaint targets: <0.01% excellent, 0.01-0.05% good, >0.05% critical

### IP Warming (deliverability.md)

- [ ] Week 1: 50-100/day
- [ ] Week 2: 200-500/day
- [ ] Week 3: 1,000-2,000/day
- [ ] Week 4: 5,000-10,000/day

### Infrastructure (deliverability.md)

- [ ] Dedicated subdomains: `t.yourdomain.com` (transactional), `m.yourdomain.com` (marketing)
- [ ] DNS TTL: 300s during setup, 3600s+ after stable

### Troubleshooting order (deliverability.md)

- [ ] Check in order: 1. Authentication, 2. List-Unsubscribe header, 3. Reputation, 4. Content, 5. Sending patterns

### Diagnostic tools (deliverability.md)

- [ ] Google Postmaster Tools
- [ ] mail-tester.com
- [ ] MXToolbox blacklist check
