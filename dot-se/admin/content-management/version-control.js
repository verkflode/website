/**
 * Swedish Content Version Control System
 * Manages versioning, branching, and rollback for Swedish content changes
 */

class SwedishContentVersionControl {
    constructor() {
        this.currentBranch = 'main';
        this.versionPrefix = 'sv-content';
        this.maxVersionHistory = 50;
        this.initializeVersionControl();
    }

    /**
     * Initialize version control system
     */
    initializeVersionControl() {
        // Create initial version if none exists
        if (!this.getVersionHistory().length) {
            this.createInitialVersion();
        }
    }

    /**
     * Create initial version with current content
     */
    createInitialVersion() {
        const initialContent = this.getCurrentContent();
        const version = {
            id: this.generateVersionId(),
            branch: 'main',
            timestamp: new Date().toISOString(),
            author: 'system',
            message: 'Initial Swedish content version',
            content: initialContent,
            parent: null,
            tags: ['initial', 'stable']
        };

        this.saveVersion(version);
        this.setCurrentVersion(version.id);
    }

    /**
     * Generate unique version ID
     */
    generateVersionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${this.versionPrefix}-${timestamp}-${random}`;
    }

    /**
     * Get current content from all sections
     */
    getCurrentContent() {
        const sections = ['hero', 'problem', 'mission', 'navigation'];
        const content = {};

        sections.forEach(section => {
            const stored = localStorage.getItem(`swedish-${section}-content`);
            content[section] = stored ? JSON.parse(stored) : null;
        });

        return content;
    }

    /**
     * Create new version (commit)
     */
    commit(message, author = 'system', tags = []) {
        const currentContent = this.getCurrentContent();
        const parentVersion = this.getCurrentVersionId();
        
        const version = {
            id: this.generateVersionId(),
            branch: this.currentBranch,
            timestamp: new Date().toISOString(),
            author: author,
            message: message,
            content: currentContent,
            parent: parentVersion,
            tags: tags,
            changes: this.calculateChanges(parentVersion, currentContent)
        };

        this.saveVersion(version);
        this.setCurrentVersion(version.id);
        
        // Clean up old versions if needed
        this.cleanupOldVersions();

        return version;
    }

    /**
     * Calculate changes between versions
     */
    calculateChanges(parentVersionId, newContent) {
        if (!parentVersionId) {
            return { type: 'initial', sections: Object.keys(newContent) };
        }

        const parentVersion = this.getVersion(parentVersionId);
        if (!parentVersion) {
            return { type: 'unknown', sections: [] };
        }

        const changes = {
            type: 'update',
            sections: [],
            details: {}
        };

        Object.keys(newContent).forEach(section => {
            const oldContent = parentVersion.content[section];
            const newSectionContent = newContent[section];

            if (JSON.stringify(oldContent) !== JSON.stringify(newSectionContent)) {
                changes.sections.push(section);
                changes.details[section] = {
                    hasChanges: true,
                    oldSize: JSON.stringify(oldContent || {}).length,
                    newSize: JSON.stringify(newSectionContent || {}).length
                };
            }
        });

        return changes;
    }

    /**
     * Create new branch
     */
    createBranch(branchName, fromVersion = null) {
        const sourceVersionId = fromVersion || this.getCurrentVersionId();
        const sourceVersion = this.getVersion(sourceVersionId);
        
        if (!sourceVersion) {
            throw new Error(`Source version ${sourceVersionId} not found`);
        }

        // Create branch metadata
        const branch = {
            name: branchName,
            created: new Date().toISOString(),
            parent: sourceVersionId,
            description: `Branch created from ${sourceVersionId}`
        };

        // Save branch info
        const branches = this.getBranches();
        branches[branchName] = branch;
        localStorage.setItem('swedish-content-branches', JSON.stringify(branches));

        return branch;
    }

    /**
     * Switch to different branch
     */
    switchBranch(branchName) {
        const branches = this.getBranches();
        if (!branches[branchName]) {
            throw new Error(`Branch ${branchName} does not exist`);
        }

        this.currentBranch = branchName;
        localStorage.setItem('swedish-content-current-branch', branchName);

        // Load latest version from this branch
        const branchVersions = this.getVersionHistory().filter(v => v.branch === branchName);
        if (branchVersions.length > 0) {
            const latestVersion = branchVersions[0];
            this.loadVersion(latestVersion.id);
        }

        return branchName;
    }

    /**
     * Merge branch into current branch
     */
    mergeBranch(sourceBranch, message = null) {
        const sourceVersions = this.getVersionHistory().filter(v => v.branch === sourceBranch);
        if (sourceVersions.length === 0) {
            throw new Error(`No versions found in branch ${sourceBranch}`);
        }

        const latestSourceVersion = sourceVersions[0];
        const mergeMessage = message || `Merge branch '${sourceBranch}' into '${this.currentBranch}'`;

        // Create merge commit
        const mergeVersion = {
            id: this.generateVersionId(),
            branch: this.currentBranch,
            timestamp: new Date().toISOString(),
            author: 'system',
            message: mergeMessage,
            content: latestSourceVersion.content,
            parent: this.getCurrentVersionId(),
            mergeParent: latestSourceVersion.id,
            tags: ['merge'],
            changes: this.calculateChanges(this.getCurrentVersionId(), latestSourceVersion.content)
        };

        this.saveVersion(mergeVersion);
        this.setCurrentVersion(mergeVersion.id);
        this.loadVersion(mergeVersion.id);

        return mergeVersion;
    }

    /**
     * Rollback to specific version
     */
    rollback(versionId, createBackup = true) {
        const targetVersion = this.getVersion(versionId);
        if (!targetVersion) {
            throw new Error(`Version ${versionId} not found`);
        }

        // Create backup of current state if requested
        if (createBackup) {
            this.commit(`Backup before rollback to ${versionId}`, 'system', ['backup', 'pre-rollback']);
        }

        // Load target version content
        this.loadVersion(versionId);

        // Create rollback commit
        const rollbackVersion = {
            id: this.generateVersionId(),
            branch: this.currentBranch,
            timestamp: new Date().toISOString(),
            author: 'system',
            message: `Rollback to version ${versionId}`,
            content: targetVersion.content,
            parent: this.getCurrentVersionId(),
            rollbackTo: versionId,
            tags: ['rollback'],
            changes: this.calculateChanges(this.getCurrentVersionId(), targetVersion.content)
        };

        this.saveVersion(rollbackVersion);
        this.setCurrentVersion(rollbackVersion.id);

        return rollbackVersion;
    }

    /**
     * Load version content into current state
     */
    loadVersion(versionId) {
        const version = this.getVersion(versionId);
        if (!version) {
            throw new Error(`Version ${versionId} not found`);
        }

        // Load content into localStorage
        Object.entries(version.content).forEach(([section, content]) => {
            if (content !== null) {
                localStorage.setItem(`swedish-${section}-content`, JSON.stringify(content));
            }
        });

        this.setCurrentVersion(versionId);
        return version;
    }

    /**
     * Tag a version
     */
    tagVersion(versionId, tag, description = '') {
        const version = this.getVersion(versionId);
        if (!version) {
            throw new Error(`Version ${versionId} not found`);
        }

        if (!version.tags) {
            version.tags = [];
        }

        if (!version.tags.includes(tag)) {
            version.tags.push(tag);
        }

        // Save tag metadata
        const tags = this.getTags();
        tags[tag] = {
            versionId: versionId,
            created: new Date().toISOString(),
            description: description
        };

        localStorage.setItem('swedish-content-tags', JSON.stringify(tags));
        this.saveVersion(version);

        return version;
    }

    /**
     * Get version by ID
     */
    getVersion(versionId) {
        const stored = localStorage.getItem(`swedish-version-${versionId}`);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Save version to storage
     */
    saveVersion(version) {
        localStorage.setItem(`swedish-version-${version.id}`, JSON.stringify(version));
        
        // Update version history index
        const history = this.getVersionHistory();
        const existingIndex = history.findIndex(v => v.id === version.id);
        
        if (existingIndex >= 0) {
            history[existingIndex] = { id: version.id, timestamp: version.timestamp, branch: version.branch, message: version.message };
        } else {
            history.unshift({ id: version.id, timestamp: version.timestamp, branch: version.branch, message: version.message });
        }

        localStorage.setItem('swedish-version-history', JSON.stringify(history));
    }

    /**
     * Get version history
     */
    getVersionHistory(branch = null) {
        const stored = localStorage.getItem('swedish-version-history');
        const history = stored ? JSON.parse(stored) : [];
        
        if (branch) {
            return history.filter(v => v.branch === branch);
        }
        
        return history;
    }

    /**
     * Get current version ID
     */
    getCurrentVersionId() {
        return localStorage.getItem('swedish-current-version');
    }

    /**
     * Set current version ID
     */
    setCurrentVersion(versionId) {
        localStorage.setItem('swedish-current-version', versionId);
    }

    /**
     * Get branches
     */
    getBranches() {
        const stored = localStorage.getItem('swedish-content-branches');
        return stored ? JSON.parse(stored) : { main: { name: 'main', created: new Date().toISOString(), parent: null, description: 'Main branch' } };
    }

    /**
     * Get tags
     */
    getTags() {
        const stored = localStorage.getItem('swedish-content-tags');
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Clean up old versions
     */
    cleanupOldVersions() {
        const history = this.getVersionHistory();
        
        if (history.length > this.maxVersionHistory) {
            const toRemove = history.slice(this.maxVersionHistory);
            
            toRemove.forEach(version => {
                localStorage.removeItem(`swedish-version-${version.id}`);
            });

            const newHistory = history.slice(0, this.maxVersionHistory);
            localStorage.setItem('swedish-version-history', JSON.stringify(newHistory));
        }
    }

    /**
     * Export version control data
     */
    exportVersionControl() {
        const history = this.getVersionHistory();
        const versions = {};
        
        history.forEach(versionInfo => {
            const version = this.getVersion(versionInfo.id);
            if (version) {
                versions[versionInfo.id] = version;
            }
        });

        return {
            timestamp: new Date().toISOString(),
            currentBranch: this.currentBranch,
            currentVersion: this.getCurrentVersionId(),
            branches: this.getBranches(),
            tags: this.getTags(),
            versions: versions,
            history: history
        };
    }

    /**
     * Import version control data
     */
    importVersionControl(data) {
        // Import branches
        localStorage.setItem('swedish-content-branches', JSON.stringify(data.branches));
        
        // Import tags
        localStorage.setItem('swedish-content-tags', JSON.stringify(data.tags));
        
        // Import versions
        Object.entries(data.versions).forEach(([versionId, version]) => {
            localStorage.setItem(`swedish-version-${versionId}`, JSON.stringify(version));
        });
        
        // Import history
        localStorage.setItem('swedish-version-history', JSON.stringify(data.history));
        
        // Set current state
        this.currentBranch = data.currentBranch;
        localStorage.setItem('swedish-content-current-branch', data.currentBranch);
        
        if (data.currentVersion) {
            this.setCurrentVersion(data.currentVersion);
        }

        return true;
    }

    /**
     * Get diff between two versions
     */
    getDiff(versionId1, versionId2) {
        const version1 = this.getVersion(versionId1);
        const version2 = this.getVersion(versionId2);
        
        if (!version1 || !version2) {
            throw new Error('One or both versions not found');
        }

        const diff = {
            from: versionId1,
            to: versionId2,
            sections: {}
        };

        const allSections = new Set([
            ...Object.keys(version1.content),
            ...Object.keys(version2.content)
        ]);

        allSections.forEach(section => {
            const content1 = version1.content[section];
            const content2 = version2.content[section];
            
            diff.sections[section] = {
                changed: JSON.stringify(content1) !== JSON.stringify(content2),
                added: !content1 && content2,
                removed: content1 && !content2,
                modified: content1 && content2 && JSON.stringify(content1) !== JSON.stringify(content2)
            };
        });

        return diff;
    }
}

// Initialize version control
const swedishVersionControl = new SwedishContentVersionControl();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishContentVersionControl;
}