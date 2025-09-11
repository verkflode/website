/**
 * Swedish Monitoring Email Alert System
 * Sends email alerts using Mailgun for critical monitoring events
 */

class SwedishMonitoringEmailAlerts {
    constructor(config = {}) {
        this.config = {
            // Email configuration
            enabled: config.enabled || false,
            apiEndpoint: config.apiEndpoint || '/api/monitoring-alert', // Lambda endpoint
            fromEmail: config.fromEmail || 'monitoring@verkflode.se',
            toEmails: config.toEmails || ['admin@verkflode.se'],

            // Alert thresholds
            cooldownPeriod: config.cooldownPeriod || 300000, // 5 minutes between same alerts
            maxAlertsPerHour: config.maxAlertsPerHour || 10,

            // Alert types to email
            emailAlertTypes: config.emailAlertTypes || [
                'uptime_failure',
                'performance_critical',
                'error_spike',
                'seo_critical'
            ],

            // Debug mode
            debug: config.debug || false
        };

        this.alertHistory = new Map();
        this.hourlyAlertCount = 0;
        this.lastHourReset = Date.now();

        this.log('Swedish Monitoring Email Alerts initialized', this.config);
    }

    /**
     * Send an alert email
     */
    async sendAlert(alertData) {
        try {
            if (!this.config.enabled) {
                this.log('Email alerts disabled, skipping alert');
                return false;
            }

            if (!this.shouldSendAlert(alertData)) {
                this.log('Alert filtered out by rate limiting or cooldown');
                return false;
            }

            const emailData = this.formatAlertEmail(alertData);
            const success = await this.sendEmailViaAPI(emailData);

            if (success) {
                this.recordAlertSent(alertData);
                this.log('Alert email sent successfully', alertData.type);
            } else {
                this.log('Failed to send alert email', alertData.type);
            }

            return success;
        } catch (error) {
            this.log('Error sending alert email:', error);
            return false;
        }
    }

    /**
     * Check if alert should be sent based on rate limiting and cooldown
     */
    shouldSendAlert(alertData) {
        const now = Date.now();

        // Reset hourly counter if needed
        if (now - this.lastHourReset > 3600000) { // 1 hour
            this.hourlyAlertCount = 0;
            this.lastHourReset = now;
        }

        // Check hourly limit
        if (this.hourlyAlertCount >= this.config.maxAlertsPerHour) {
            this.log('Hourly alert limit reached, skipping alert');
            return false;
        }

        // Check if alert type should be emailed
        if (!this.config.emailAlertTypes.includes(alertData.type)) {
            this.log('Alert type not configured for email', alertData.type);
            return false;
        }

        // Check cooldown period for same alert type
        const alertKey = `${alertData.type}_${alertData.source || 'general'}`;
        const lastSent = this.alertHistory.get(alertKey);

        if (lastSent && (now - lastSent) < this.config.cooldownPeriod) {
            this.log('Alert in cooldown period', alertKey);
            return false;
        }

        return true;
    }

    /**
     * Format alert data into email content
     */
    formatAlertEmail(alertData) {
        const timestamp = new Date().toLocaleString('sv-SE', {
            timeZone: 'Europe/Stockholm'
        });

        const severity = alertData.severity || 'warning';
        const severityEmoji = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const subject = `${severityEmoji[severity]} Verkflöde.se Monitoring Alert: ${alertData.type}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: ${severity === 'critical' ? '#dc3545' : severity === 'warning' ? '#ffc107' : '#17a2b8'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .metric { margin: 8px 0; }
        .metric strong { color: #2d5a27; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${severityEmoji[severity]} Monitoring Alert</h1>
            <p>Verkflöde.se - Swedish Site</p>
        </div>
        
        <div class="content">
            <h2>${alertData.title || alertData.type}</h2>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            
            <div class="alert-details">
                <h3>Alert Details</h3>
                <p><strong>Type:</strong> ${alertData.type}</p>
                ${alertData.source ? `<p><strong>Source:</strong> ${alertData.source}</p>` : ''}
                <p><strong>Message:</strong> ${alertData.message || 'No additional details'}</p>
                
                ${alertData.metrics ? this.formatMetrics(alertData.metrics) : ''}
                ${alertData.url ? `<p><strong>Affected URL:</strong> <a href="${alertData.url}">${alertData.url}</a></p>` : ''}
            </div>
            
            ${alertData.action ? `
            <div class="alert-details">
                <h3>Recommended Action</h3>
                <p>${alertData.action}</p>
            </div>
            ` : ''}
            
            <p>
                <a href="https://verkflode.se/admin/swedish-monitoring-dashboard.html" class="btn">
                    View Monitoring Dashboard
                </a>
            </p>
        </div>
        
        <div class="footer">
            <p>This alert was generated by the Verkflöde.se monitoring system.</p>
            <p>To modify alert settings, access the admin dashboard.</p>
        </div>
    </div>
</body>
</html>`;

        const textContent = `
VERKFLÖDE.SE MONITORING ALERT

${severityEmoji[severity]} ${alertData.title || alertData.type}

Time: ${timestamp}
Severity: ${severity.toUpperCase()}
Type: ${alertData.type}
${alertData.source ? `Source: ${alertData.source}` : ''}
Message: ${alertData.message || 'No additional details'}

${alertData.metrics ? this.formatMetricsText(alertData.metrics) : ''}
${alertData.url ? `Affected URL: ${alertData.url}` : ''}
${alertData.action ? `\nRecommended Action: ${alertData.action}` : ''}

Dashboard: https://verkflode.se/admin/swedish-monitoring-dashboard.html

---
This alert was generated by the Verkflöde.se monitoring system.
        `.trim();

        return {
            subject,
            html: htmlContent,
            text: textContent,
            to: this.config.toEmails,
            from: this.config.fromEmail
        };
    }

    /**
     * Format metrics for HTML display
     */
    formatMetrics(metrics) {
        if (!metrics || typeof metrics !== 'object') return '';

        return Object.entries(metrics)
            .map(([key, value]) => `<div class="metric"><strong>${key}:</strong> ${value}</div>`)
            .join('');
    }

    /**
     * Format metrics for text display
     */
    formatMetricsText(metrics) {
        if (!metrics || typeof metrics !== 'object') return '';

        return Object.entries(metrics)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
    }

    /**
     * Send email via API endpoint (Lambda function)
     */
    async sendEmailViaAPI(emailData) {
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'monitoring_alert',
                    ...emailData
                })
            });

            if (response.ok) {
                this.log('Email sent successfully via API');
                return true;
            } else {
                this.log('API request failed:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            this.log('API request error:', error);
            return false;
        }
    }

    /**
     * Record that an alert was sent
     */
    recordAlertSent(alertData) {
        const alertKey = `${alertData.type}_${alertData.source || 'general'}`;
        this.alertHistory.set(alertKey, Date.now());
        this.hourlyAlertCount++;

        // Clean up old history entries (keep last 100)
        if (this.alertHistory.size > 100) {
            const entries = Array.from(this.alertHistory.entries());
            entries.sort((a, b) => b[1] - a[1]); // Sort by timestamp, newest first

            this.alertHistory.clear();
            entries.slice(0, 100).forEach(([key, timestamp]) => {
                this.alertHistory.set(key, timestamp);
            });
        }
    }

    /**
     * Test email functionality
     */
    async testEmail() {
        const testAlert = {
            type: 'test_alert',
            severity: 'info',
            title: 'Email Alert System Test',
            message: 'This is a test email to verify the monitoring alert system is working correctly.',
            source: 'email_test',
            metrics: {
                'Test Status': 'Success',
                'System': 'Swedish Monitoring',
                'Timestamp': new Date().toISOString()
            },
            action: 'No action required - this is a test alert.'
        };

        return await this.sendAlert(testAlert);
    }

    /**
     * Get alert statistics
     */
    getStats() {
        return {
            enabled: this.config.enabled,
            hourlyAlertCount: this.hourlyAlertCount,
            alertHistorySize: this.alertHistory.size,
            lastHourReset: new Date(this.lastHourReset).toISOString(),
            cooldownPeriod: this.config.cooldownPeriod,
            maxAlertsPerHour: this.config.maxAlertsPerHour,
            emailAlertTypes: this.config.emailAlertTypes
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('Email alert configuration updated', newConfig);
    }

    /**
     * Enable/disable email alerts
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.log(`Email alerts ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Logging utility
     */
    log(message, data = null) {
        if (this.config.debug) {
            console.log(`[SwedishEmailAlerts] ${message}`, data || '');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishMonitoringEmailAlerts;
} else if (typeof window !== 'undefined') {
    window.SwedishMonitoringEmailAlerts = SwedishMonitoringEmailAlerts;
}