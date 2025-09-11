/**
 * Swedish Market Monitoring Configuration
 * Central configuration for all monitoring systems
 */

const SwedishMonitoringConfig = {
    // Domain and environment settings
    domain: 'verkflode.se',
    environment: 'production', // 'development', 'staging', 'production'
    
    // Monitoring intervals (in milliseconds)
    intervals: {
        uptime: 60000,        // 1 minute
        performance: 30000,   // 30 seconds
        seo: 3600000,        // 1 hour
        errorReporting: 300000, // 5 minutes
        dashboardUpdate: 30000  // 30 seconds
    },
    
    // Alert thresholds
    thresholds: {
        uptime: {
            responseTime: 5000,      // 5 seconds
            consecutiveFailures: 3,   // 3 failed checks
            uptimePercentage: 99.0    // 99% uptime minimum
        },
        performance: {
            lcp: { good: 2500, poor: 4000 },           // Largest Contentful Paint (ms)
            fid: { good: 100, poor: 300 },             // First Input Delay (ms)
            cls: { good: 0.1, poor: 0.25 },           // Cumulative Layout Shift
            pageLoad: { good: 3000, poor: 5000 },     // Page load time (ms)
            memoryUsage: 100                           // MB
        },
        errors: {
            criticalErrorsPerMinute: 5,
            networkFailureRate: 0.1,    // 10%
            jsErrorRate: 0.05           // 5%
        },
        seo: {
            overallScore: 80,           // Minimum SEO score
            technicalScore: 85,         // Technical SEO minimum
            contentScore: 70,           // Content optimization minimum
            localScore: 60              // Local SEO minimum
        }
    },
    
    // Monitoring endpoints
    endpoints: {
        primary: [
            '/',
            '/om-oss.html',
            '/integritetspolicy.html'
        ],
        api: [
            // Add API endpoints if any
        ],
        assets: [
            '/css/main.css',
            '/js/main.js',
            '/images/verkflode-icon.png'
        ]
    },
    
    // SEO monitoring keywords
    keywords: {
        primary: [
            'matsvinn Sverige',
            'CSRD efterlevnad',
            'restaurang lönsamhet',
            'hållbarhetsrapportering'
        ],
        secondary: [
            'matsvinn minskning',
            'verkflöde matsvinn',
            'ESRS E5 rapportering',
            'restaurang matsvinn',
            'svensk matsvinn',
            'CSRD Sverige'
        ],
        branded: [
            'verkflöde',
            'verkflöde sverige',
            'verkflöde matsvinn'
        ]
    },
    
    // Competitor monitoring
    competitors: [
        'winnow.com',
        'leanpath.com',
        'orbisk.com'
    ],
    
    // Alert configuration
    alerts: {
        enabled: true,
        channels: {
            console: true,
            localStorage: true,
            webhook: false,  // Set to webhook URL in production
            email: true      // Email alerts enabled via Mailgun
        },
        email: {
            enabled: true,
            apiEndpoint: 'https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/prod/monitoring-alert',
            fromEmail: 'monitoring@verkflode.se',
            toEmails: ['hej@verkflode.se'],
            cooldownPeriod: 300000, // 5 minutes
            maxAlertsPerHour: 10
        },
        severity: {
            critical: {
                immediate: true,
                channels: ['console', 'localStorage']
            },
            warning: {
                immediate: false,
                channels: ['console', 'localStorage']
            },
            info: {
                immediate: false,
                channels: ['localStorage']
            }
        }
    },
    
    // Data retention
    retention: {
        uptimeHistory: 1000,        // Keep 1000 uptime checks (~16 hours at 1min intervals)
        performanceMetrics: 500,    // Keep 500 performance snapshots
        errorLogs: 200,             // Keep 200 error entries
        seoReports: 24,             // Keep 24 SEO reports (24 hours at 1hr intervals)
        alerts: 100,                // Keep 100 alerts per type
        activityLogs: 1000          // Keep 1000 activity log entries
    },
    
    // Performance monitoring configuration
    performance: {
        enableCoreWebVitals: true,
        enableResourceTiming: true,
        enableUserTiming: true,
        enableNavigationTiming: true,
        enablePaintTiming: true,
        trackUserEngagement: true,
        trackConversions: true
    },
    
    // Error tracking configuration
    errorTracking: {
        captureConsoleErrors: true,
        captureUnhandledPromises: true,
        captureResourceErrors: true,
        captureNetworkErrors: true,
        enableStackTraces: true,
        enableUserContext: true,
        enableBreadcrumbs: true
    },
    
    // SEO monitoring configuration
    seo: {
        checkTechnicalSEO: true,
        checkContentOptimization: true,
        checkLocalSEO: true,
        checkStructuredData: true,
        checkPageSpeed: true,
        checkMobileOptimization: true,
        checkInternationalization: true
    },
    
    // Swedish market specific settings
    swedish: {
        language: 'sv',
        country: 'SE',
        currency: 'SEK',
        timezone: 'Europe/Stockholm',
        localAuthorities: [
            'Naturvårdsverket',
            'Regeringen',
            'SAMS',
            'Livsmedelsverket'
        ],
        regulatoryFrameworks: [
            'CSRD',
            'ESRS E5',
            'EU Taxonomy',
            'Swedish Environmental Code'
        ]
    },
    
    // Dashboard configuration
    dashboard: {
        autoRefresh: true,
        refreshInterval: 30000,     // 30 seconds
        showCharts: true,
        showAlerts: true,
        showActivityLog: true,
        maxLogEntries: 100,
        theme: 'light'              // 'light' or 'dark'
    },
    
    // Development and debugging
    debug: {
        enabled: false,             // Set to true for development
        verboseLogging: false,
        mockData: false,
        skipActualChecks: false
    }
};

// Environment-specific overrides
if (SwedishMonitoringConfig.environment === 'development') {
    SwedishMonitoringConfig.debug.enabled = true;
    SwedishMonitoringConfig.debug.verboseLogging = true;
    SwedishMonitoringConfig.intervals.uptime = 30000;  // 30 seconds for faster testing
    SwedishMonitoringConfig.intervals.seo = 300000;    // 5 minutes for faster testing
}

if (SwedishMonitoringConfig.environment === 'staging') {
    SwedishMonitoringConfig.domain = 'staging.verkflode.se';
    SwedishMonitoringConfig.alerts.channels.webhook = false;
}

// Utility functions for configuration
SwedishMonitoringConfig.utils = {
    /**
     * Get threshold for a specific metric
     */
    getThreshold(category, metric) {
        return this.thresholds[category]?.[metric];
    },
    
    /**
     * Check if alerts are enabled for a severity level
     */
    isAlertEnabled(severity) {
        return this.alerts.enabled && this.alerts.severity[severity];
    },
    
    /**
     * Get monitoring interval for a specific system
     */
    getInterval(system) {
        return this.intervals[system] || 60000; // Default to 1 minute
    },
    
    /**
     * Get retention limit for a data type
     */
    getRetentionLimit(dataType) {
        return this.retention[dataType] || 100; // Default to 100 entries
    },
    
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(category, feature) {
        return this[category]?.[feature] === true;
    },
    
    /**
     * Get Swedish-specific configuration
     */
    getSwedishConfig() {
        return this.swedish;
    },
    
    /**
     * Validate configuration
     */
    validate() {
        const errors = [];
        
        if (!this.domain) {
            errors.push('Domain is required');
        }
        
        if (!this.endpoints.primary.length) {
            errors.push('At least one primary endpoint is required');
        }
        
        if (!this.keywords.primary.length) {
            errors.push('At least one primary keyword is required');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

// Bind utils to config object
Object.keys(SwedishMonitoringConfig.utils).forEach(key => {
    SwedishMonitoringConfig[key] = SwedishMonitoringConfig.utils[key].bind(SwedishMonitoringConfig);
});

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishMonitoringConfig;
} else if (typeof window !== 'undefined') {
    window.SwedishMonitoringConfig = SwedishMonitoringConfig;
}

// Validate configuration on load
const validation = SwedishMonitoringConfig.validate();
if (!validation.valid) {
    console.error('Swedish Monitoring Configuration Errors:', validation.errors);
} else if (SwedishMonitoringConfig.debug.enabled) {
    console.log('Swedish Monitoring Configuration loaded successfully:', SwedishMonitoringConfig);
}