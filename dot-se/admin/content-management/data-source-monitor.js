/**
 * Swedish Data Source Monitoring System
 * Monitors government statistics, regulations, and other data sources for updates
 */

class SwedishDataSourceMonitor {
    constructor() {
        this.dataSources = this.loadDataSources();
        this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.lastCheck = localStorage.getItem('last-source-check') || null;
    }

    /**
     * Load data sources configuration
     */
    loadDataSources() {
        return {
            foodWasteStats: {
                name: "Swedish Food Waste Statistics",
                url: "https://www.naturvardsverket.se/amnesomraden/avfall/matsvinn/",
                backup_url: "https://www.sverigesradio.se/artikel/matsvinn-pa-restauranger-okar-de-har-losningen",
                authority: "Naturvårdsverket",
                currentClaim: "6kg till 11kg per person och år",
                lastUpdated: "2024-01-15",
                checkFrequency: "weekly",
                criticalData: true
            },
            
            sustainabilityTargets: {
                name: "Swedish 2025 Sustainability Targets",
                url: "https://www.regeringen.se/regeringens-politik/miljo-och-klimat/",
                authority: "Regeringen",
                currentClaim: "20-procentig minskning av matsvinnet till 2025",
                lastUpdated: "2024-01-10",
                checkFrequency: "monthly",
                criticalData: true
            },

            csrdRegulation: {
                name: "EU CSRD Directive Implementation",
                url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
                authority: "European Commission",
                currentClaim: "CSRD-direktivet nya, tvingande krav på transparens",
                lastUpdated: "2024-02-01",
                checkFrequency: "monthly",
                criticalData: true
            },

            restaurantMargins: {
                name: "Swedish Restaurant Industry Margins",
                url: "https://www.visita.se/",
                backup_url: "https://www.scb.se/",
                authority: "Visita / SCB",
                currentClaim: "marginaler på 3-5%",
                lastUpdated: "2024-01-20",
                checkFrequency: "quarterly",
                criticalData: false
            },

            samsInitiative: {
                name: "SAMS (Swedish Food Waste Initiative)",
                url: "https://www.livsmedelsverket.se/",
                authority: "Livsmedelsverket",
                currentClaim: "initiativ som SAMS",
                lastUpdated: "2024-01-05",
                checkFrequency: "monthly",
                criticalData: false
            }
        };
    }

    /**
     * Check all data sources for updates
     */
    async checkAllSources() {
        const results = {
            timestamp: new Date().toISOString(),
            sources: {},
            alerts: [],
            criticalUpdates: []
        };

        for (const [key, source] of Object.entries(this.dataSources)) {
            try {
                const checkResult = await this.checkSource(key, source);
                results.sources[key] = checkResult;

                if (checkResult.hasUpdate) {
                    results.alerts.push({
                        source: key,
                        severity: source.criticalData ? 'critical' : 'normal',
                        message: `Update detected for ${source.name}`,
                        action: 'Review and update content if necessary'
                    });

                    if (source.criticalData) {
                        results.criticalUpdates.push(key);
                    }
                }
            } catch (error) {
                results.sources[key] = {
                    status: 'error',
                    error: error.message,
                    lastCheck: new Date().toISOString()
                };

                results.alerts.push({
                    source: key,
                    severity: 'error',
                    message: `Failed to check ${source.name}: ${error.message}`,
                    action: 'Manual verification required'
                });
            }
        }

        // Store results
        localStorage.setItem('source-check-results', JSON.stringify(results));
        localStorage.setItem('last-source-check', results.timestamp);

        // Send notifications for critical updates
        if (results.criticalUpdates.length > 0) {
            this.sendCriticalUpdateAlert(results.criticalUpdates);
        }

        return results;
    }

    /**
     * Check individual data source
     */
    async checkSource(key, source) {
        const result = {
            source: key,
            name: source.name,
            lastCheck: new Date().toISOString(),
            status: 'checked',
            hasUpdate: false,
            confidence: 'unknown'
        };

        // Since we can't actually fetch external URLs in this environment,
        // we'll simulate the checking process and provide a framework
        // for real implementation

        // In a real implementation, this would:
        // 1. Fetch the source URL
        // 2. Parse content for relevant data
        // 3. Compare with stored baseline
        // 4. Detect changes in key statistics

        // For now, we'll create a mock check based on time intervals
        const daysSinceLastUpdate = this.getDaysSince(source.lastUpdated);
        const expectedUpdateFrequency = this.getUpdateFrequencyDays(source.checkFrequency);

        if (daysSinceLastUpdate > expectedUpdateFrequency * 1.5) {
            result.hasUpdate = true;
            result.confidence = 'time-based';
            result.message = `Source hasn't been updated in ${daysSinceLastUpdate} days, expected every ${expectedUpdateFrequency} days`;
        }

        // Store individual check result
        localStorage.setItem(`source-${key}-last-check`, JSON.stringify(result));

        return result;
    }

    /**
     * Get days since a date string
     */
    getDaysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Convert frequency string to days
     */
    getUpdateFrequencyDays(frequency) {
        const frequencies = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30,
            'quarterly': 90,
            'yearly': 365
        };
        return frequencies[frequency] || 30;
    }

    /**
     * Send critical update alert
     */
    sendCriticalUpdateAlert(criticalSources) {
        const alert = {
            timestamp: new Date().toISOString(),
            type: 'critical_data_update',
            sources: criticalSources,
            message: `Critical data sources require review: ${criticalSources.join(', ')}`,
            action: 'Immediate content review and update required'
        };

        // Store alert
        const alerts = this.getStoredAlerts();
        alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (alerts.length > 50) {
            alerts.splice(50);
        }

        localStorage.setItem('source-alerts', JSON.stringify(alerts));

        // In a real implementation, this would also:
        // - Send email notifications
        // - Create Slack/Teams messages
        // - Update dashboard indicators
        
        console.warn('CRITICAL DATA UPDATE ALERT:', alert);
        return alert;
    }

    /**
     * Get stored alerts
     */
    getStoredAlerts() {
        const stored = localStorage.getItem('source-alerts');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Mark source as manually verified
     */
    markSourceVerified(sourceKey, verificationNotes) {
        const verification = {
            timestamp: new Date().toISOString(),
            source: sourceKey,
            verifiedBy: 'manual', // In production, this would be the actual user
            notes: verificationNotes,
            status: 'verified'
        };

        // Update source last verified time
        if (this.dataSources[sourceKey]) {
            this.dataSources[sourceKey].lastVerified = verification.timestamp;
            this.dataSources[sourceKey].verificationNotes = verificationNotes;
        }

        // Store verification record
        const verifications = this.getVerificationHistory();
        verifications.unshift(verification);
        
        if (verifications.length > 100) {
            verifications.splice(100);
        }

        localStorage.setItem('source-verifications', JSON.stringify(verifications));
        return verification;
    }

    /**
     * Get verification history
     */
    getVerificationHistory() {
        const stored = localStorage.getItem('source-verifications');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Get monitoring dashboard data
     */
    getDashboardData() {
        const lastResults = localStorage.getItem('source-check-results');
        const alerts = this.getStoredAlerts();
        const verifications = this.getVerificationHistory();

        return {
            lastCheck: this.lastCheck,
            sources: this.dataSources,
            lastResults: lastResults ? JSON.parse(lastResults) : null,
            activeAlerts: alerts.filter(alert => {
                const alertAge = Date.now() - new Date(alert.timestamp).getTime();
                return alertAge < (7 * 24 * 60 * 60 * 1000); // Last 7 days
            }),
            recentVerifications: verifications.slice(0, 10)
        };
    }

    /**
     * Start automatic monitoring
     */
    startMonitoring() {
        // Check immediately
        this.checkAllSources();

        // Set up interval checking
        setInterval(() => {
            this.checkAllSources();
        }, this.checkInterval);

        console.log('Swedish data source monitoring started');
    }

    /**
     * Export monitoring data for backup
     */
    exportMonitoringData() {
        return {
            timestamp: new Date().toISOString(),
            dataSources: this.dataSources,
            alerts: this.getStoredAlerts(),
            verifications: this.getVerificationHistory(),
            lastResults: localStorage.getItem('source-check-results')
        };
    }
}

// Initialize monitor
const swedishDataMonitor = new SwedishDataSourceMonitor();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishDataSourceMonitor;
}