/**
 * Integrated Swedish Content Management System
 * Combines workflow, monitoring, version control, and guidelines
 */

class SwedishContentManagementSystem {
    constructor() {
        this.contentManager = new SwedishContentManager();
        this.dataMonitor = new SwedishDataSourceMonitor();
        this.versionControl = new SwedishContentVersionControl();
        this.initializeSystem();
    }

    /**
     * Initialize the complete content management system
     */
    initializeSystem() {
        this.loadConfiguration();
        this.setupEventListeners();
        this.startMonitoring();
    }

    /**
     * Load system configuration
     */
    loadConfiguration() {
        this.config = {
            autoBackup: true,
            monitoringInterval: 24 * 60 * 60 * 1000, // 24 hours
            maxVersions: 50,
            criticalDataSources: ['foodWasteStats', 'sustainabilityTargets', 'csrdRegulation'],
            reviewRequiredSections: ['hero', 'problem', 'mission'],
            approvalWorkflow: true
        };

        // Load saved configuration if exists
        const savedConfig = localStorage.getItem('swedish-cms-config');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
    }

    /**
     * Set up event listeners for system integration
     */
    setupEventListeners() {
        // Listen for content changes
        window.addEventListener('swedish-content-updated', (event) => {
            this.handleContentUpdate(event.detail);
        });

        // Listen for data source alerts
        window.addEventListener('swedish-data-alert', (event) => {
            this.handleDataAlert(event.detail);
        });

        // Listen for version control events
        window.addEventListener('swedish-version-created', (event) => {
            this.handleVersionCreated(event.detail);
        });
    }

    /**
     * Start monitoring systems
     */
    startMonitoring() {
        // Start data source monitoring
        this.dataMonitor.startMonitoring();

        // Set up periodic system health checks
        setInterval(() => {
            this.performSystemHealthCheck();
        }, this.config.monitoringInterval);

        console.log('Swedish Content Management System initialized and monitoring started');
    }

    /**
     * Handle content update workflow
     */
    async handleContentUpdate(updateDetails) {
        const { section, content, reason, author } = updateDetails;

        try {
            // 1. Validate content against guidelines
            const validation = this.validateContentAgainstGuidelines(section, content);
            if (!validation.valid) {
                throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
            }

            // 2. Create backup version if auto-backup enabled
            if (this.config.autoBackup) {
                const backupMessage = `Auto-backup before ${reason}`;
                this.versionControl.commit(backupMessage, 'system', ['auto-backup']);
            }

            // 3. Update content through content manager
            const versionName = this.contentManager.updateContent(section, content, reason);

            // 4. Create new version in version control
            const version = this.versionControl.commit(reason, author || 'system');

            // 5. Check if approval workflow is required
            if (this.config.approvalWorkflow && this.config.reviewRequiredSections.includes(section)) {
                await this.initiateApprovalWorkflow(version, section, content);
            }

            // 6. Trigger post-update tasks
            this.triggerPostUpdateTasks(section, version);

            return {
                success: true,
                version: version.id,
                message: 'Content updated successfully'
            };

        } catch (error) {
            console.error('Content update failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate content against Swedish guidelines
     */
    validateContentAgainstGuidelines(section, content) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Basic Swedish content validation
        const contentText = JSON.stringify(content).toLowerCase();

        // Check for Swedish characters
        if (!/[åäöÅÄÖ]/.test(contentText)) {
            validation.warnings.push('Content may not be properly Swedish - missing Swedish characters');
        }

        // Check for crisis messaging keywords (for relevant sections)
        if (['hero', 'problem'].includes(section)) {
            const crisisKeywords = ['missade', 'kris', 'målet', 'europa', 'csrd'];
            const hasCrisisTerms = crisisKeywords.some(keyword => contentText.includes(keyword));
            
            if (!hasCrisisTerms) {
                validation.errors.push('Crisis messaging section missing required crisis terminology');
                validation.valid = false;
            }
        }

        // Check for business terminology
        if (section === 'mission') {
            const businessTerms = ['lönsamhet', 'avkastning', 'marginaler'];
            const hasBusinessTerms = businessTerms.some(term => contentText.includes(term));
            
            if (!hasBusinessTerms) {
                validation.warnings.push('Mission section missing Swedish business terminology');
            }
        }

        // Check for formal Swedish indicators
        const formalIndicators = ['er', 'ert', 'era', 'ni'];
        const hasFormalSwedish = formalIndicators.some(indicator => contentText.includes(indicator));
        
        if (!hasFormalSwedish && content.type !== 'navigation') {
            validation.warnings.push('Content may not use proper formal Swedish (ni-form)');
        }

        return validation;
    }

    /**
     * Handle data source alerts
     */
    async handleDataAlert(alertDetails) {
        const { source, severity, message } = alertDetails;

        // Log alert
        console.warn(`Data Alert [${severity}]: ${source} - ${message}`);

        // For critical data sources, create immediate notification
        if (this.config.criticalDataSources.includes(source) && severity === 'critical') {
            await this.createCriticalDataNotification(alertDetails);
        }

        // Check if content needs updating based on data changes
        const affectedSections = this.getAffectedContentSections(source);
        if (affectedSections.length > 0) {
            await this.flagContentForReview(affectedSections, alertDetails);
        }
    }

    /**
     * Get content sections affected by data source changes
     */
    getAffectedContentSections(dataSource) {
        const sourceToSectionMap = {
            'foodWasteStats': ['hero', 'problem'],
            'sustainabilityTargets': ['hero', 'problem'],
            'csrdRegulation': ['problem', 'mission'],
            'restaurantMargins': ['mission'],
            'samsInitiative': ['mission']
        };

        return sourceToSectionMap[dataSource] || [];
    }

    /**
     * Flag content sections for review
     */
    async flagContentForReview(sections, alertDetails) {
        const reviewFlag = {
            timestamp: new Date().toISOString(),
            reason: 'data_source_update',
            alert: alertDetails,
            sections: sections,
            status: 'pending_review',
            priority: alertDetails.severity === 'critical' ? 'high' : 'normal'
        };

        // Store review flag
        const reviewFlags = this.getReviewFlags();
        reviewFlags.unshift(reviewFlag);
        localStorage.setItem('swedish-content-review-flags', JSON.stringify(reviewFlags));

        // Create notification
        this.createReviewNotification(reviewFlag);
    }

    /**
     * Get pending review flags
     */
    getReviewFlags() {
        const stored = localStorage.getItem('swedish-content-review-flags');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Initiate approval workflow
     */
    async initiateApprovalWorkflow(version, section, content) {
        const workflow = {
            versionId: version.id,
            section: section,
            content: content,
            initiated: new Date().toISOString(),
            status: 'pending_approval',
            approvers: this.getRequiredApprovers(section),
            approvals: []
        };

        // Store workflow
        const workflows = this.getApprovalWorkflows();
        workflows.unshift(workflow);
        localStorage.setItem('swedish-approval-workflows', JSON.stringify(workflows));

        // Send approval notifications
        await this.sendApprovalNotifications(workflow);

        return workflow;
    }

    /**
     * Get required approvers for content section
     */
    getRequiredApprovers(section) {
        const approverMap = {
            'hero': ['content_manager', 'swedish_reviewer', 'marketing'],
            'problem': ['content_manager', 'data_specialist', 'swedish_reviewer'],
            'mission': ['content_manager', 'business_reviewer', 'swedish_reviewer'],
            'navigation': ['swedish_reviewer', 'technical_reviewer']
        };

        return approverMap[section] || ['content_manager', 'swedish_reviewer'];
    }

    /**
     * Get approval workflows
     */
    getApprovalWorkflows() {
        const stored = localStorage.getItem('swedish-approval-workflows');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Perform system health check
     */
    performSystemHealthCheck() {
        const healthCheck = {
            timestamp: new Date().toISOString(),
            components: {},
            overall: 'healthy'
        };

        // Check content manager
        try {
            const contentHistory = this.contentManager.getChangeHistory();
            healthCheck.components.contentManager = {
                status: 'healthy',
                lastActivity: contentHistory.length > 0 ? contentHistory[0].timestamp : null
            };
        } catch (error) {
            healthCheck.components.contentManager = {
                status: 'error',
                error: error.message
            };
            healthCheck.overall = 'degraded';
        }

        // Check data monitoring
        try {
            const monitoringData = this.dataMonitor.getDashboardData();
            healthCheck.components.dataMonitor = {
                status: 'healthy',
                lastCheck: monitoringData.lastCheck,
                activeAlerts: monitoringData.activeAlerts.length
            };
        } catch (error) {
            healthCheck.components.dataMonitor = {
                status: 'error',
                error: error.message
            };
            healthCheck.overall = 'degraded';
        }

        // Check version control
        try {
            const versionHistory = this.versionControl.getVersionHistory();
            healthCheck.components.versionControl = {
                status: 'healthy',
                totalVersions: versionHistory.length,
                currentVersion: this.versionControl.getCurrentVersionId()
            };
        } catch (error) {
            healthCheck.components.versionControl = {
                status: 'error',
                error: error.message
            };
            healthCheck.overall = 'degraded';
        }

        // Store health check results
        localStorage.setItem('swedish-cms-health', JSON.stringify(healthCheck));

        // Log if system is degraded
        if (healthCheck.overall !== 'healthy') {
            console.warn('Swedish CMS Health Check: System degraded', healthCheck);
        }

        return healthCheck;
    }

    /**
     * Create critical data notification
     */
    async createCriticalDataNotification(alertDetails) {
        const notification = {
            type: 'critical_data_update',
            timestamp: new Date().toISOString(),
            source: alertDetails.source,
            message: alertDetails.message,
            action: 'immediate_review_required',
            priority: 'critical'
        };

        // Store notification
        const notifications = this.getNotifications();
        notifications.unshift(notification);
        localStorage.setItem('swedish-cms-notifications', JSON.stringify(notifications));

        // In a real implementation, this would also:
        // - Send email alerts
        // - Create Slack/Teams notifications
        // - Update dashboard indicators
        // - Trigger automated workflows

        console.error('CRITICAL DATA NOTIFICATION:', notification);
    }

    /**
     * Create review notification
     */
    createReviewNotification(reviewFlag) {
        const notification = {
            type: 'content_review_required',
            timestamp: new Date().toISOString(),
            sections: reviewFlag.sections,
            reason: reviewFlag.reason,
            priority: reviewFlag.priority,
            message: `Content review required for sections: ${reviewFlag.sections.join(', ')}`
        };

        // Store notification
        const notifications = this.getNotifications();
        notifications.unshift(notification);
        localStorage.setItem('swedish-cms-notifications', JSON.stringify(notifications));
    }

    /**
     * Get system notifications
     */
    getNotifications() {
        const stored = localStorage.getItem('swedish-cms-notifications');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Trigger post-update tasks
     */
    triggerPostUpdateTasks(section, version) {
        // Clear related review flags
        this.clearReviewFlags(section);

        // Update content freshness tracking
        this.updateContentFreshness(section);

        // Trigger SEO revalidation if needed
        if (['hero', 'problem'].includes(section)) {
            this.triggerSEORevalidation();
        }

        // Log successful update
        console.log(`Content update completed: ${section} (version: ${version.id})`);
    }

    /**
     * Clear review flags for section
     */
    clearReviewFlags(section) {
        const reviewFlags = this.getReviewFlags();
        const updatedFlags = reviewFlags.filter(flag => 
            !flag.sections.includes(section) || flag.status !== 'pending_review'
        );
        localStorage.setItem('swedish-content-review-flags', JSON.stringify(updatedFlags));
    }

    /**
     * Update content freshness tracking
     */
    updateContentFreshness(section) {
        const freshness = this.getContentFreshness();
        freshness[section] = {
            lastUpdated: new Date().toISOString(),
            status: 'fresh'
        };
        localStorage.setItem('swedish-content-freshness', JSON.stringify(freshness));
    }

    /**
     * Get content freshness data
     */
    getContentFreshness() {
        const stored = localStorage.getItem('swedish-content-freshness');
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Trigger SEO revalidation
     */
    triggerSEORevalidation() {
        // In a real implementation, this would trigger:
        // - Sitemap regeneration
        // - Search console ping
        // - CDN cache invalidation
        // - SEO monitoring update
        
        console.log('SEO revalidation triggered for Swedish content');
    }

    /**
     * Export complete system data
     */
    exportSystemData() {
        return {
            timestamp: new Date().toISOString(),
            config: this.config,
            contentManager: this.contentManager.exportContent(),
            dataMonitor: this.dataMonitor.exportMonitoringData(),
            versionControl: this.versionControl.exportVersionControl(),
            reviewFlags: this.getReviewFlags(),
            approvalWorkflows: this.getApprovalWorkflows(),
            notifications: this.getNotifications(),
            healthCheck: localStorage.getItem('swedish-cms-health')
        };
    }

    /**
     * Import system data
     */
    importSystemData(data) {
        try {
            // Import configuration
            this.config = data.config;
            localStorage.setItem('swedish-cms-config', JSON.stringify(this.config));

            // Import component data
            if (data.contentManager) {
                this.contentManager.importContent(data.contentManager);
            }

            if (data.dataMonitor) {
                // Import monitoring data (implementation depends on monitor structure)
            }

            if (data.versionControl) {
                this.versionControl.importVersionControl(data.versionControl);
            }

            // Import workflow data
            if (data.reviewFlags) {
                localStorage.setItem('swedish-content-review-flags', JSON.stringify(data.reviewFlags));
            }

            if (data.approvalWorkflows) {
                localStorage.setItem('swedish-approval-workflows', JSON.stringify(data.approvalWorkflows));
            }

            if (data.notifications) {
                localStorage.setItem('swedish-cms-notifications', JSON.stringify(data.notifications));
            }

            return { success: true, message: 'System data imported successfully' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get system dashboard data
     */
    getDashboardData() {
        return {
            systemHealth: this.performSystemHealthCheck(),
            contentFreshness: this.getContentFreshness(),
            pendingReviews: this.getReviewFlags().filter(flag => flag.status === 'pending_review'),
            activeWorkflows: this.getApprovalWorkflows().filter(wf => wf.status === 'pending_approval'),
            recentNotifications: this.getNotifications().slice(0, 10),
            dataMonitoring: this.dataMonitor.getDashboardData(),
            versionControl: {
                currentVersion: this.versionControl.getCurrentVersionId(),
                recentVersions: this.versionControl.getVersionHistory().slice(0, 5)
            }
        };
    }
}

// Initialize the integrated content management system
const swedishCMS = new SwedishContentManagementSystem();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishContentManagementSystem;
}