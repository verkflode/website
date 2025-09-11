/**
 * Swedish Content Management System
 * Handles content updates, versioning, and validation for verkflode.se
 */

class SwedishContentManager {
    constructor() {
        this.contentSections = ['hero', 'problem', 'mission', 'navigation'];
        this.baseUrl = '/content-management/versions/';
        this.currentVersion = this.getCurrentVersion();
    }

    /**
     * Get current content version from localStorage or default
     */
    getCurrentVersion() {
        return localStorage.getItem('swedish-content-version') || 'v1.0.0';
    }

    /**
     * Create new content version with timestamp
     */
    createVersion(changes, reason) {
        const timestamp = new Date().toISOString().split('T')[0];
        const versionName = `${timestamp}-${reason.replace(/\s+/g, '-').toLowerCase()}`;
        
        const versionData = {
            version: versionName,
            timestamp: new Date().toISOString(),
            changes: changes,
            reason: reason,
            reviewer: null,
            approved: false
        };

        // Store version data
        localStorage.setItem(`swedish-version-${versionName}`, JSON.stringify(versionData));
        
        return versionName;
    }

    /**
     * Update specific content section
     */
    updateContent(section, newContent, reason) {
        if (!this.contentSections.includes(section)) {
            throw new Error(`Invalid content section: ${section}`);
        }

        // Validate Swedish content
        this.validateSwedishContent(newContent);

        // Create backup of current content
        const currentContent = this.getContent(section);
        const backupVersion = this.createVersion({
            section: section,
            oldContent: currentContent,
            newContent: newContent
        }, reason);

        // Update content
        localStorage.setItem(`swedish-${section}-content`, JSON.stringify(newContent));
        
        // Log change
        this.logContentChange(section, reason, backupVersion);

        return backupVersion;
    }

    /**
     * Validate Swedish content for language and business requirements
     */
    validateSwedishContent(content) {
        const validationRules = {
            // Crisis messaging keywords that should be preserved
            crisisKeywords: ['missade', 'kris', 'målet', 'Europa', 'CSRD', 'tvingande'],
            
            // Swedish business terminology
            businessTerms: ['lönsamhet', 'avkastning', 'marginaler', 'investering'],
            
            // Required Swedish characters
            swedishChars: /[åäöÅÄÖ]/,
            
            // Formal Swedish (ni-form) indicators
            formalIndicators: ['er', 'ert', 'era', 'ni']
        };

        const contentText = JSON.stringify(content).toLowerCase();

        // Check for crisis messaging preservation
        const hasCrisisTerms = validationRules.crisisKeywords.some(keyword => 
            contentText.includes(keyword.toLowerCase())
        );

        // Check for Swedish characters
        const hasSwedishChars = validationRules.swedishChars.test(contentText);

        // Check for business terminology
        const hasBusinessTerms = validationRules.businessTerms.some(term => 
            contentText.includes(term.toLowerCase())
        );

        if (!hasCrisisTerms && content.type === 'crisis-messaging') {
            console.warn('Warning: Crisis messaging content missing key crisis terms');
        }

        if (!hasSwedishChars) {
            console.warn('Warning: Content may not be properly Swedish - missing Swedish characters');
        }

        if (!hasBusinessTerms && content.type === 'business-content') {
            console.warn('Warning: Business content missing Swedish business terminology');
        }

        return {
            valid: true,
            warnings: [],
            hasCrisisTerms,
            hasSwedishChars,
            hasBusinessTerms
        };
    }

    /**
     * Get content for specific section
     */
    getContent(section) {
        const stored = localStorage.getItem(`swedish-${section}-content`);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Rollback to previous version
     */
    rollback(versionName) {
        const versionData = localStorage.getItem(`swedish-version-${versionName}`);
        if (!versionData) {
            throw new Error(`Version ${versionName} not found`);
        }

        const version = JSON.parse(versionData);
        const { section, oldContent } = version.changes;

        // Restore old content
        localStorage.setItem(`swedish-${section}-content`, JSON.stringify(oldContent));
        
        // Log rollback
        this.logContentChange(section, `Rollback to ${versionName}`, null);

        return true;
    }

    /**
     * Log content changes for audit trail
     */
    logContentChange(section, reason, versionName) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            section: section,
            reason: reason,
            version: versionName,
            user: 'system' // In production, this would be the actual user
        };

        // Get existing log
        const existingLog = localStorage.getItem('swedish-content-log');
        const log = existingLog ? JSON.parse(existingLog) : [];
        
        // Add new entry
        log.unshift(logEntry);
        
        // Keep only last 100 entries
        if (log.length > 100) {
            log.splice(100);
        }

        // Save updated log
        localStorage.setItem('swedish-content-log', JSON.stringify(log));
    }

    /**
     * Get content change history
     */
    getChangeHistory(section = null) {
        const log = localStorage.getItem('swedish-content-log');
        if (!log) return [];

        const history = JSON.parse(log);
        
        if (section) {
            return history.filter(entry => entry.section === section);
        }

        return history;
    }

    /**
     * Export content for backup
     */
    exportContent() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: this.currentVersion,
            content: {}
        };

        // Export all content sections
        this.contentSections.forEach(section => {
            exportData.content[section] = this.getContent(section);
        });

        // Export change log
        exportData.changeLog = this.getChangeHistory();

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import content from backup
     */
    importContent(exportedData) {
        const data = typeof exportedData === 'string' ? JSON.parse(exportedData) : exportedData;

        // Import content sections
        Object.keys(data.content).forEach(section => {
            if (this.contentSections.includes(section)) {
                localStorage.setItem(`swedish-${section}-content`, JSON.stringify(data.content[section]));
            }
        });

        // Import change log
        if (data.changeLog) {
            localStorage.setItem('swedish-content-log', JSON.stringify(data.changeLog));
        }

        // Update version
        localStorage.setItem('swedish-content-version', data.version);
        this.currentVersion = data.version;

        return true;
    }
}

// Initialize content manager
const swedishContentManager = new SwedishContentManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishContentManager;
}