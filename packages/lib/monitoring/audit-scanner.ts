import { getAdminClient } from "@asym/database/supabase/admin";

interface AnomalyResult {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, unknown>;
  timestamp: string;
}

export async function scanAuditLogs(): Promise<AnomalyResult[]> {
  const { client: supabaseAdmin, error } = getAdminClient();
  if (!supabaseAdmin) {
    console.warn("[audit-scan] Skipping audit scan:", error);
    return [];
  }

  const anomalies: AnomalyResult[] = [];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: failedLogins } = await supabaseAdmin
    .from("audit_logs")
    .select("user_id, ip_address, created_at")
    .eq("action", "login_failed")
    .gte("created_at", twentyFourHoursAgo.toISOString());

  if (failedLogins) {
    const failedByUser = new Map<string, number>();
    const failedByIP = new Map<string, number>();

    for (const log of failedLogins) {
      if (log.user_id) {
        failedByUser.set(log.user_id, (failedByUser.get(log.user_id) || 0) + 1);
      }
      if (log.ip_address) {
        failedByIP.set(
          log.ip_address,
          (failedByIP.get(log.ip_address) || 0) + 1,
        );
      }
    }

    for (const [userId, count] of failedByUser) {
      if (count >= 5) {
        anomalies.push({
          type: "repeated_failed_logins",
          severity: count >= 10 ? "high" : "medium",
          details: { userId, failedAttempts: count, period: "24h" },
          timestamp: now.toISOString(),
        });
      }
    }

    for (const [ip, count] of failedByIP) {
      if (count >= 10) {
        anomalies.push({
          type: "suspicious_ip_activity",
          severity: count >= 20 ? "critical" : "high",
          details: { ipAddress: ip, failedAttempts: count, period: "24h" },
          timestamp: now.toISOString(),
        });
      }
    }
  }

  const { data: roleChanges } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .eq("action", "role_change")
    .gte("created_at", twentyFourHoursAgo.toISOString());

  if (roleChanges && roleChanges.length > 10) {
    anomalies.push({
      type: "unusual_role_changes",
      severity: "medium",
      details: { count: roleChanges.length, period: "24h" },
      timestamp: now.toISOString(),
    });
  }

  const { data: performanceViolations } = await supabaseAdmin
    .from("audit_logs")
    .select("details")
    .eq("action", "performance_violation")
    .gte("created_at", twentyFourHoursAgo.toISOString());

  if (performanceViolations && performanceViolations.length > 50) {
    anomalies.push({
      type: "performance_degradation",
      severity: "high",
      details: { violationCount: performanceViolations.length, period: "24h" },
      timestamp: now.toISOString(),
    });
  }

  return anomalies;
}

export async function recordAnomaly(anomaly: AnomalyResult) {
  const { client: supabaseAdmin, error } = getAdminClient();
  if (!supabaseAdmin) {
    console.warn("[audit-scan] Skipping anomaly record:", error);
    return;
  }

  await supabaseAdmin.from("audit_logs").insert({
    tenant_id: null,
    user_id: "00000000-0000-0000-0000-000000000000",
    action: "security_anomaly_detected",
    resource_type: "audit",
    details: anomaly,
  });
}
