// Swedish Market Analytics Dashboard Configuration
// Privacy-focused configuration for Swedish market performance monitoring

const SwedishMarketConfig = {
    market: 'swedish',
    region: 'SE',
    language: 'sv-SE',

    // Goal tracking configuration (respects privacy principles)
    goals: {
        demo_requests: {
            name: 'Swedish Demo Requests',
            selector: 'a[href="#contact"], .cta-demo-button',
            value: 1,
            description: 'Demo requests from Swedish crisis messaging'
        },
        contact_forms: {
            name: 'Swedish Contact Forms',
            selector: '#contactForm',
            event: 'submit',
            value: 1,
            description: 'Contact form submissions'
        }
    },

    // Content engagement tracking (minimal, privacy-focused)
    content_sections: {
        crisis_hero: {
            name: 'Crisis Messaging Hero',
            selector: '.hero-section',
            description: 'Main crisis messaging section'
        },
        missed_goals: {
            name: 'Missed 2025 Goals',
            selector: '[aria-labelledby="problem-heading"]',
            description: 'Problem statement section'
        },
        solution: {
            name: 'Collective Intelligence Solution',
            selector: '#solution',
            description: 'Solution presentation'
        },
        mission: {
            name: 'Three-Goal Mission',
            selector: '#mission',
            description: 'Mission statement'
        }
    },

    // Swedish market specific metrics
    swedish_metrics: {
        target_conversion_rate: 3.5, // %
        monthly_demo_target: 50,
        crisis_messaging_effectiveness: true,
        compare_to_english: true
    },

    // Dashboard display configuration
    dashboard: {
        title: 'Swedish Market Performance',
        subtitle: 'Crisis Messaging Effectiveness & Conversion Tracking',
        refresh_interval: 30000, // 30 seconds
        data_retention_days: 90,

        metrics_cards: [
            {
                id: 'swedish_page_views',
                title: 'Swedish Page Views',
                description: 'Total page views on Swedish site'
            },
            {
                id: 'demo_requests',
                title: 'Demo Requests',
                description: 'Demo requests from Swedish market'
            },
            {
                id: 'conversion_rate',
                title: 'Conversion Rate',
                description: 'Demo request conversion rate',
                target: 3.5,
                format: 'percentage'
            },
            {
                id: 'crisis_engagement',
                title: 'Crisis Message Engagement',
                description: 'Engagement with crisis messaging content'
            }
        ]
    },

    // Privacy compliance
    privacy: {
        data_sovereignty: true,
        local_storage_only: true,
        no_third_party_tracking: true,
        gdpr_compliant: true,
        user_consent_required: false, // Only essential business metrics
        data_retention_policy: '90 days maximum'
    }
};

// Export configuration for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwedishMarketConfig;
} else if (typeof window !== 'undefined') {
    window.SwedishMarketConfig = SwedishMarketConfig;
}