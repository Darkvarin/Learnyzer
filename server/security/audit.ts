import { db } from "../db/index";
import { securityConfig } from "./config.js";

// Audit logging system for security events
interface SecurityEvent {
  event: string;
  ip?: string;
  userAgent?: string;
  userId?: number;
  path?: string;
  origin?: string;
  filename?: string;
  timestamp: Date;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: any;
}

interface RequestLog {
  method: string;
  path: string;
  ip?: string;
  userAgent?: string;
  userId?: number;
  timestamp: Date;
}

interface ResponseLog {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: number;
  timestamp: Date;
}

class AuditLogger {
  private securityLogs: SecurityEvent[] = [];
  private requestLogs: RequestLog[] = [];
  private responseLogs: ResponseLog[] = [];

  // Log security events
  logSecurityEvent(event: SecurityEvent) {
    if (!securityConfig.audit.enabled) return;

    const enhancedEvent = {
      ...event,
      severity: event.severity || this.determineSeverity(event.event),
      id: this.generateLogId(),
    };

    this.securityLogs.push(enhancedEvent);
    
    // Console log for immediate monitoring
    console.log(`🚨 SECURITY EVENT: ${event.event}`, {
      ip: event.ip,
      userId: event.userId,
      timestamp: event.timestamp.toISOString(),
      severity: enhancedEvent.severity
    });

    // Store critical events immediately
    if (enhancedEvent.severity === "critical" || enhancedEvent.severity === "high") {
      this.persistSecurityEvent(enhancedEvent);
    }

    // Cleanup old logs (keep last 1000)
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000);
    }
  }

  // Log user authentication actions
  logAuthEvent(action: string, userId?: number, ip?: string, success: boolean = true) {
    this.logSecurityEvent({
      event: `auth_${action}`,
      userId,
      ip,
      timestamp: new Date(),
      severity: success ? "low" : "medium",
      metadata: { success }
    });
  }

  // Log data access events
  logDataAccess(action: string, userId: number, resource: string, ip?: string) {
    this.logSecurityEvent({
      event: `data_access_${action}`,
      userId,
      ip,
      timestamp: new Date(),
      severity: "low",
      metadata: { resource }
    });
  }

  // Log sensitive operations
  logSensitiveOperation(operation: string, userId: number, details: any, ip?: string) {
    if (securityConfig.audit.sensitiveActions.includes(operation)) {
      this.logSecurityEvent({
        event: `sensitive_${operation}`,
        userId,
        ip,
        timestamp: new Date(),
        severity: "medium",
        metadata: details
      });
    }
  }

  // Log HTTP requests
  logRequest(request: RequestLog) {
    this.requestLogs.push(request);
    
    // Cleanup old logs
    if (this.requestLogs.length > 5000) {
      this.requestLogs = this.requestLogs.slice(-5000);
    }
  }

  // Log HTTP responses
  logResponse(response: ResponseLog) {
    this.responseLogs.push(response);
    
    // Log suspicious response patterns
    if (response.statusCode === 401) {
      this.logSecurityEvent({
        event: "unauthorized_access_attempt",
        path: response.path,
        userId: response.userId,
        timestamp: response.timestamp,
        severity: "medium"
      });
    }

    // Cleanup old logs
    if (this.responseLogs.length > 5000) {
      this.responseLogs = this.responseLogs.slice(-5000);
    }
  }

  // Get security events for monitoring
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityLogs.slice(-limit).reverse();
  }

  // Get recent suspicious activity
  getSuspiciousActivity(timeWindow: number = 3600000): SecurityEvent[] { // 1 hour default
    const cutoff = new Date(Date.now() - timeWindow);
    return this.securityLogs.filter(event => 
      event.timestamp > cutoff && 
      (event.severity === "high" || event.severity === "critical")
    );
  }

  // Analyze patterns for potential threats
  analyzeSecurityPatterns(): {
    failedLogins: number;
    rateLimitViolations: number;
    suspiciousIPs: string[];
    recentThreats: SecurityEvent[];
  } {
    const lastHour = new Date(Date.now() - 3600000);
    const recentEvents = this.securityLogs.filter(event => event.timestamp > lastHour);

    const failedLogins = recentEvents.filter(event => 
      event.event.includes("auth_") && event.metadata?.success === false
    ).length;

    const rateLimitViolations = recentEvents.filter(event => 
      event.event === "rate_limit_exceeded"
    ).length;

    // Identify IPs with multiple security events
    const ipCounts: { [ip: string]: number } = {};
    recentEvents.forEach(event => {
      if (event.ip) {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      }
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([_, count]) => count > 5)
      .map(([ip, _]) => ip);

    const recentThreats = recentEvents.filter(event => 
      event.severity === "high" || event.severity === "critical"
    );

    return {
      failedLogins,
      rateLimitViolations,
      suspiciousIPs,
      recentThreats
    };
  }

  // Export logs for external security analysis
  exportLogs(format: "json" | "csv" = "json") {
    const data = {
      securityEvents: this.securityLogs,
      requests: this.requestLogs,
      responses: this.responseLogs,
      exportedAt: new Date().toISOString()
    };

    if (format === "json") {
      return JSON.stringify(data, null, 2);
    }

    // Convert to CSV format for security events
    const headers = ["timestamp", "event", "severity", "ip", "userId", "path"];
    const csvLines = [headers.join(",")];
    
    this.securityLogs.forEach(event => {
      const row = [
        event.timestamp.toISOString(),
        event.event,
        event.severity || "low",
        event.ip || "",
        event.userId || "",
        event.path || ""
      ];
      csvLines.push(row.join(","));
    });

    return csvLines.join("\n");
  }

  private determineSeverity(eventType: string): "low" | "medium" | "high" | "critical" {
    const criticalEvents = ["malicious_file_upload", "sql_injection_attempt", "xss_attempt"];
    const highEvents = ["rate_limit_exceeded", "cors_violation", "unauthorized_access_attempt"];
    const mediumEvents = ["auth_failed", "suspicious_activity"];

    if (criticalEvents.includes(eventType)) return "critical";
    if (highEvents.includes(eventType)) return "high";
    if (mediumEvents.includes(eventType)) return "medium";
    return "low";
  }

  private generateLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async persistSecurityEvent(event: SecurityEvent) {
    try {
      // Store in database for persistent audit trail
      // This would be implemented with your audit_logs table
      console.log("📝 Persisting critical security event:", event.event);
    } catch (error) {
      console.error("Failed to persist security event:", error);
    }
  }
}

export const auditLogger = new AuditLogger();