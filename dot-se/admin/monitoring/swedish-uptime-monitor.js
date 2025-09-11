/**
 * Swedish Market Uptime Monitoring System
 * Monitors verkflode.se domain availability and response times
 */

class SwedishUptimeMonitor {
    constructor() {
        this.domain = 'verkflode.se';
        this.endpoints = [
            '/',
            '/om-oss.html',
            '/integritetspolicy.html'
        ];
        this.checkInterval = 60000; // 1 minute
        this.alertThreshold = 5000; // 5 seconds
        this.downTimeThreshold = 3; // 3 consecutive failures
        this.consecutiveFailures = 0;
        this.isMonitoring = false;
        this.lastStatus = null;
        this.uptimeStats = {
            totalChecks: 0,
            successfulChecks: 0,
            averageResponseTime: 0,
            lastDowntime: null,
            uptimePercentage: 100
        };
    }

    async checkEndpoint(endpoint) {
        const url = `https://${this.domain}${endpoint}`;
        const startTime = Date.now();
        
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                timeout: 10000
            });
            
            const responseTime = Date.now() - startTime;
            
            return {
                url,
                status: response.status,
                responseTime,
                success: response.ok,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                url,
                status: 0,
                responseTime: Date.now() - startTime,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async performHealthCheck() {
        const results = [];
        
        for (const endpoint of this.endpoints) {
            const result = await this.checkEndpoint(endpoint);
            results.push(result);
        }
        
        return results;
    }

    updateUptimeStats(results) {
        this.uptimeStats.totalChecks++;
        
        const allSuccessful = results.every(r => r.success);
        if (allSuccessful) {
            this.uptimeStats.successfulChecks++;
            this.consecutiveFailures = 0;
        } else {
            this.consecutiveFailures++;
        }
        
        // Calculate average response time
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        this.uptimeStats.averageResponseTime = 
            (this.uptimeStats.averageResponseTime * (this.uptimeStats.totalChecks - 1) + avgResponseTime) / 
            this.uptimeStats.totalChecks;
        
        // Update uptime percentage
        this.uptimeStats.uptimePercentage = 
            (this.uptimeStats.successfulChecks / this.uptimeStats.totalChecks) * 100;
        
        return allSuccessful;
    }

    async sendAlert(type, data) {
        const alert = {
            type: `uptime_${type}`,
            source: 'uptime_monitor',
            domain: this.domain,
            timestamp: new Date().toISOString(),
            severity: type === 'downtime' ? 'critical' : 'warning',
            title: this.getAlertTitle(type),
            message: data.message,
            url: `https://${this.domain}`,
            metrics: this.getAlertMetrics(type, data),
            action: this.getRecommendedAction(type),
            data
        };
        
        // Log alert
        console.error(`🚨 SWEDISH SITE ALERT [${alert.severity.toUpperCase()}]:`, alert);
        
        // Store alert for dashboard
        this.storeAlert(alert);
        
        // Send email alert if email system is available
        if (window.SwedishMonitoring?.systems?.emailAlerts) {
            try {
                await window.SwedishMonitoring.systems.emailAlerts.sendAlert(alert);
            } catch (emailError) {
                console.error('Failed to send email alert:', emailError);
            }
        }
        
        return alert;
    }

    getAlertTitle(type) {
        switch (type) {
            case 'downtime':
                return 'Website Downtime Detected';
            case 'performance':
                return 'Slow Response Times Detected';
            case 'error':
                return 'Monitoring System Error';
            default:
                return 'Uptime Alert';
        }
    }

    getAlertMetrics(type, data) {
        const metrics = {
            'Consecutive Failures': this.consecutiveFailures,
            'Uptime Percentage': `${this.uptimeStats.uptimePercentage.toFixed(2)}%`,
            'Average Response Time': `${Math.round(this.uptimeStats.averageResponseTime)}ms`
        };

        if (type === 'downtime' && data.failedEndpoints) {
            metrics['Failed Endpoints'] = data.failedEndpoints.length;
        }

        if (type === 'performance' && data.slowEndpoints) {
            metrics['Slow Endpoints'] = data.slowEndpoints.length;
            metrics['Threshold'] = `${data.threshold}ms`;
        }

        return metrics;
    }

    getRecommendedAction(type) {
        switch (type) {
            case 'downtime':
                return 'Check server status, DNS configuration, and hosting provider. Verify SSL certificate validity.';
            case 'performance':
                return 'Check server load, CDN performance, and optimize page resources. Consider scaling if needed.';
            case 'error':
                return 'Review monitoring system logs and check for configuration issues.';
            default:
                return 'Monitor the situation and investigate if issues persist.';
        }
    }

    storeAlert(alert) {
        const alerts = this.getStoredAlerts();
        alerts.unshift(alert);
        
        // Keep only last 100 alerts
        if (alerts.length > 100) {
            alerts.splice(100);
        }
        
        localStorage.setItem('swedish_uptime_alerts', JSON.stringify(alerts));
    }

    getStoredAlerts() {
        try {
            return JSON.parse(localStorage.getItem('swedish_uptime_alerts') || '[]');
        } catch {
            return [];
        }
    }

    async runMonitoringCycle() {
        try {
            const results = await this.performHealthCheck();
            const isHealthy = this.updateUptimeStats(results);
            
            // Check for downtime
            if (!isHealthy && this.consecutiveFailures >= this.downTimeThreshold) {
                await this.sendAlert('downtime', {
                    consecutiveFailures: this.consecutiveFailures,
                    failedEndpoints: results.filter(r => !r.success),
                    message: `Swedish site has been down for ${this.consecutiveFailures} consecutive checks`
                });
            }
            
            // Check for slow response times
            const slowEndpoints = results.filter(r => r.success && r.responseTime > this.alertThreshold);
            if (slowEndpoints.length > 0) {
                await this.sendAlert('performance', {
                    slowEndpoints,
                    threshold: this.alertThreshold,
                    message: `Swedish site response times exceed ${this.alertThreshold}ms threshold`
                });
            }
            
            // Store monitoring data
            this.storeMonitoringData(results);
            
            return {
                timestamp: new Date().toISOString(),
                healthy: isHealthy,
                results,
                stats: this.uptimeStats
            };
            
        } catch (error) {
            console.error('Monitoring cycle error:', error);
            await this.sendAlert('error', {
                error: error.message,
                message: 'Error occurred during monitoring cycle'
            });
        }
    }

    storeMonitoringData(results) {
        const data = {
            timestamp: new Date().toISOString(),
            results,
            stats: { ...this.uptimeStats }
        };
        
        const history = this.getMonitoringHistory();
        history.unshift(data);
        
        // Keep only last 1000 entries (about 16 hours at 1-minute intervals)
        if (history.length > 1000) {
            history.splice(1000);
        }
        
        localStorage.setItem('swedish_uptime_history', JSON.stringify(history));
    }

    getMonitoringHistory() {
        try {
            return JSON.parse(localStorage.getItem('swedish_uptime_history') || '[]');
        } catch {
            return [];
        }
    }

    startMonitoring() {
        if (this.isMonitoring) {
            console.log('Swedish uptime monitoring already running');
            return;
        }
        
        this.isMonitoring = true;
        console.log(`🇸🇪 Starting Swedish uptime monitoring for ${this.domain}`);
        
        // Run initial check
        this.runMonitoringCycle();
        
        // Set up interval
        this.monitoringInterval = setInterval(() => {
            this.runMonitoringCycle();
        }, this.checkInterval);
    }

    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        console.log('🇸🇪 Swedish uptime monitoring stopped');
    }

    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            domain: this.domain,
            stats: this.uptimeStats,
            consecutiveFailures: this.consecutiveFailures,
            lastCheck: this.getMonitoringHistory()[0]?.timestamp || null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishUptimeMonitor;
} else if (typeof window !== 'undefined') {
    window.SwedishUptimeMonitor = SwedishUptimeMonitor;
}