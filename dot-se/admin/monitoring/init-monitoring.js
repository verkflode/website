/**
 * Swedish Market Monitoring Initialization Script
 * Automatically initializes all monitoring systems for verkflode.se
 */

(function() {
    'use strict';
    
    // Check if we're on the Swedish domain
    if (typeof window === 'undefined' || window.location.hostname !== 'verkflode.se') {
        return;
    }
    
    console.log('🇸🇪 Initializing Swedish market monitoring...');
    
    // Global monitoring state
    window.SwedishMonitoring = {
        initialized: false,
        systems: {},
        config: null,
        startTime: Date.now()
    };
    
    /**
     * Load monitoring configuration
     */
    function loadConfiguration() {
        if (typeof window.SwedishMonitoringConfig !== 'undefined') {
            window.SwedishMonitoring.config = window.SwedishMonitoringConfig;
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/monitoring/monitoring-config.js';
            script.onload = () => {
                window.SwedishMonitoring.config = window.SwedishMonitoringConfig;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load monitoring configuration'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load monitoring scripts dynamically
     */
    function loadMonitoringScripts() {
        const scripts = [
            '/admin/monitoring/swedish-uptime-monitor.js',
            '/admin/monitoring/swedish-performance-monitor.js',
            '/admin/monitoring/swedish-error-tracker.js',
            '/admin/monitoring/swedish-seo-monitor.js',
            '/admin/monitoring/email-alerts.js'
        ];
        
        return Promise.all(scripts.map(src => {
            return new Promise((resolve, reject) => {
                // Check if script is already loaded
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        }));
    }
    
    /**
     * Initialize monitoring systems
     */
    function initializeMonitoringSystems() {
        const config = window.SwedishMonitoring.config;
        
        try {
            // Initialize email alerts first
            if (typeof SwedishMonitoringEmailAlerts !== 'undefined' && config.alerts.email.enabled) {
                window.SwedishMonitoring.systems.emailAlerts = new SwedishMonitoringEmailAlerts({
                    enabled: config.alerts.email.enabled,
                    apiEndpoint: config.alerts.email.apiEndpoint,
                    fromEmail: config.alerts.email.fromEmail,
                    toEmails: config.alerts.email.toEmails,
                    cooldownPeriod: config.alerts.email.cooldownPeriod,
                    maxAlertsPerHour: config.alerts.email.maxAlertsPerHour,
                    debug: config.debug.enabled
                });
                console.log('✅ Email alerts initialized');
            }
            
            // Initialize uptime monitoring
            if (typeof SwedishUptimeMonitor !== 'undefined') {
                window.SwedishMonitoring.systems.uptime = new SwedishUptimeMonitor();
                console.log('✅ Uptime monitoring initialized');
            }
            
            // Performance monitoring should already be initialized
            if (window.swedishPerformanceMonitor) {
                window.SwedishMonitoring.systems.performance = window.swedishPerformanceMonitor;
                console.log('✅ Performance monitoring initialized');
            }
            
            // Error tracking should already be initialized
            if (window.swedishErrorTracker) {
                window.SwedishMonitoring.systems.errors = window.swedishErrorTracker;
                console.log('✅ Error tracking initialized');
            }
            
            // SEO monitoring should already be initialized
            if (window.swedishSEOMonitor) {
                window.SwedishMonitoring.systems.seo = window.swedishSEOMonitor;
                console.log('✅ SEO monitoring initialized');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing monitoring systems:', error);
            return false;
        }
    }
    
    /**
     * Start monitoring systems
     */
    function startMonitoring() {
        const systems = window.SwedishMonitoring.systems;
        const config = window.SwedishMonitoring.config;
        
        // Start uptime monitoring
        if (systems.uptime && !systems.uptime.isMonitoring) {
            systems.uptime.startMonitoring();
            console.log('🚀 Uptime monitoring started');
        }
        
        // Performance and error monitoring start automatically
        
        // Log successful initialization
        console.log('🇸🇪 Swedish market monitoring fully operational');
        
        // Send initialization event
        if (systems.performance) {
            systems.performance.recordConversionEvent('monitoring_initialized', {
                systems: Object.keys(systems),
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Setup monitoring health checks
     */
    function setupHealthChecks() {
        // Check monitoring system health every 5 minutes
        setInterval(() => {
            const systems = window.SwedishMonitoring.systems;
            const healthStatus = {
                uptime: systems.uptime?.isMonitoring || false,
                performance: !!systems.performance,
                errors: !!systems.errors,
                seo: !!systems.seo,
                timestamp: new Date().toISOString()
            };
            
            const healthyCount = Object.values(healthStatus).filter(status => 
                typeof status === 'boolean' && status
            ).length;
            
            if (healthyCount < 3) { // Less than 3 systems healthy
                console.warn('⚠️ Swedish monitoring health check failed:', healthStatus);
                
                if (systems.errors) {
                    systems.errors.handleJavaScriptError({
                        type: 'monitoring_health_check_failed',
                        message: `Only ${healthyCount}/4 monitoring systems are healthy`,
                        healthStatus: healthStatus
                    });
                }
            }
        }, 300000); // 5 minutes
    }
    
    /**
     * Setup page lifecycle monitoring
     */
    function setupPageLifecycleMonitoring() {
        // Monitor page visibility changes
        document.addEventListener('visibilitychange', () => {
            const systems = window.SwedishMonitoring.systems;
            
            if (document.hidden) {
                console.log('📱 Page hidden - pausing intensive monitoring');
                // Optionally reduce monitoring frequency
            } else {
                console.log('👁️ Page visible - resuming full monitoring');
                // Resume full monitoring
                if (systems.performance) {
                    systems.performance.recordConversionEvent('page_visibility_change', {
                        visible: true,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
        
        // Monitor page unload
        window.addEventListener('beforeunload', () => {
            const systems = window.SwedishMonitoring.systems;
            
            // Send final metrics before page unload
            if (systems.performance) {
                systems.performance.sendMetricsToStorage();
            }
            
            if (systems.errors) {
                systems.errors.generateErrorReport();
            }
            
            console.log('👋 Swedish monitoring session ending');
        });
        
        // Monitor page load completion
        window.addEventListener('load', () => {
            const systems = window.SwedishMonitoring.systems;
            
            if (systems.performance) {
                systems.performance.recordConversionEvent('page_load_complete', {
                    loadTime: Date.now() - window.SwedishMonitoring.startTime,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('✅ Swedish page load monitoring complete');
        });
    }
    
    /**
     * Setup error recovery mechanisms
     */
    function setupErrorRecovery() {
        // Global error handler for monitoring system failures
        window.addEventListener('error', (event) => {
            // Check if error is from monitoring systems
            if (event.filename && event.filename.includes('/monitoring/')) {
                console.error('💥 Monitoring system error:', event.error);
                
                // Attempt to reinitialize failed system
                setTimeout(() => {
                    console.log('🔄 Attempting to recover monitoring system...');
                    initializeMonitoringSystems();
                }, 5000);
            }
        });
        
        // Check for monitoring system failures periodically
        setInterval(() => {
            const systems = window.SwedishMonitoring.systems;
            
            // Check if critical systems are still functioning
            if (!systems.performance || !systems.errors) {
                console.warn('🚨 Critical monitoring systems missing - attempting recovery');
                
                // Attempt to reinitialize
                loadMonitoringScripts().then(() => {
                    initializeMonitoringSystems();
                }).catch(error => {
                    console.error('❌ Monitoring recovery failed:', error);
                });
            }
        }, 60000); // Check every minute
    }
    
    /**
     * Main initialization function
     */
    async function initialize() {
        try {
            console.log('🔧 Loading Swedish monitoring configuration...');
            await loadConfiguration();
            
            console.log('📦 Loading monitoring scripts...');
            await loadMonitoringScripts();
            
            console.log('⚙️ Initializing monitoring systems...');
            const success = initializeMonitoringSystems();
            
            if (success) {
                console.log('🚀 Starting monitoring...');
                startMonitoring();
                
                console.log('🏥 Setting up health checks...');
                setupHealthChecks();
                
                console.log('🔄 Setting up lifecycle monitoring...');
                setupPageLifecycleMonitoring();
                
                console.log('🛡️ Setting up error recovery...');
                setupErrorRecovery();
                
                window.SwedishMonitoring.initialized = true;
                
                console.log('🎉 Swedish market monitoring initialization complete!');
                
                // Dispatch custom event for other scripts
                window.dispatchEvent(new CustomEvent('swedishMonitoringReady', {
                    detail: {
                        systems: window.SwedishMonitoring.systems,
                        config: window.SwedishMonitoring.config
                    }
                }));
                
            } else {
                throw new Error('Failed to initialize monitoring systems');
            }
            
        } catch (error) {
            console.error('❌ Swedish monitoring initialization failed:', error);
            
            // Fallback: Initialize basic error tracking at minimum
            try {
                if (typeof SwedishErrorTracker !== 'undefined') {
                    window.SwedishMonitoring.systems.errors = new SwedishErrorTracker();
                    console.log('🆘 Fallback error tracking initialized');
                }
            } catch (fallbackError) {
                console.error('💥 Even fallback monitoring failed:', fallbackError);
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        initialize();
    }
    
    // Expose utilities for manual control
    window.SwedishMonitoring.utils = {
        reinitialize: initialize,
        getStatus: () => ({
            initialized: window.SwedishMonitoring.initialized,
            systems: Object.keys(window.SwedishMonitoring.systems),
            uptime: Date.now() - window.SwedishMonitoring.startTime
        }),
        exportData: () => {
            const systems = window.SwedishMonitoring.systems;
            return {
                timestamp: new Date().toISOString(),
                uptime: systems.uptime?.getStatus(),
                performance: systems.performance?.getPerformanceReport(),
                errors: systems.errors?.getErrorSummary(),
                seo: systems.seo?.getSEOStatus()
            };
        }
    };
    
})();