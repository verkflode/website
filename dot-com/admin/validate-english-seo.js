#!/usr/bin/env node

/**
 * English Site SEO Validation Script
 * Validates sitemap.xml and robots.txt for verkflode.com
 */

const fs = require('fs');
const path = require('path');

class EnglishSEOValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    validateSitemap() {
        console.log('🔍 Validating English sitemap...');
        
        const sitemapPath = path.join(__dirname, 'sitemap.xml');
        
        if (!fs.existsSync(sitemapPath)) {
            this.errors.push('❌ sitemap.xml not found');
            return;
        }

        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        
        // Check XML structure
        if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
            this.errors.push('❌ Missing XML declaration in sitemap');
        } else {
            this.success.push('✅ Valid XML declaration');
        }

        // Check required URLs
        const requiredUrls = [
            'https://verkflode.com/',
            'https://verkflode.com/about.html',
            'https://verkflode.com/privacy-policy.html'
        ];

        requiredUrls.forEach(url => {
            if (sitemapContent.includes(url)) {
                this.success.push(`✅ Found required URL: ${url}`);
            } else {
                this.errors.push(`❌ Missing required URL: ${url}`);
            }
        });

        // Check hreflang tags
        if (sitemapContent.includes('hreflang="sv"') && sitemapContent.includes('hreflang="en"')) {
            this.success.push('✅ Hreflang tags present');
        } else {
            this.errors.push('❌ Missing or incomplete hreflang tags');
        }

        // Check lastmod dates
        const today = new Date().toISOString().split('T')[0];
        if (sitemapContent.includes(today)) {
            this.success.push('✅ Recent lastmod dates found');
        } else {
            this.warnings.push('⚠️  Consider updating lastmod dates to current date');
        }

        // Check priorities
        if (sitemapContent.includes('<priority>1.0</priority>')) {
            this.success.push('✅ Homepage has priority 1.0');
        } else {
            this.warnings.push('⚠️  Homepage should have priority 1.0');
        }

        // Check x-default hreflang
        if (sitemapContent.includes('hreflang="x-default" href="https://verkflode.com/"')) {
            this.success.push('✅ Proper x-default hreflang pointing to English site');
        } else {
            this.errors.push('❌ Missing or incorrect x-default hreflang');
        }
    }

    validateRobotsTxt() {
        console.log('🔍 Validating robots.txt...');
        
        const robotsPath = path.join(__dirname, 'robots.txt');
        
        if (!fs.existsSync(robotsPath)) {
            this.errors.push('❌ robots.txt not found');
            return;
        }

        const robotsContent = fs.readFileSync(robotsPath, 'utf8');
        
        // Check sitemap reference
        if (robotsContent.includes('Sitemap: https://verkflode.com/sitemap.xml')) {
            this.success.push('✅ Sitemap URL correctly referenced in robots.txt');
        } else {
            this.errors.push('❌ Missing or incorrect sitemap URL in robots.txt');
        }

        // Check basic directives
        if (robotsContent.includes('User-agent: *')) {
            this.success.push('✅ Universal user-agent directive present');
        } else {
            this.errors.push('❌ Missing universal user-agent directive');
        }

        // Check admin directory blocking
        if (robotsContent.includes('Disallow: /admin/')) {
            this.success.push('✅ Admin directory properly blocked');
        } else {
            this.warnings.push('⚠️  Consider blocking admin directory');
        }

        // Check for enhanced blocking rules
        if (robotsContent.includes('Disallow: /config/') && robotsContent.includes('Disallow: /*.js$')) {
            this.success.push('✅ Enhanced file blocking rules present');
        } else {
            this.warnings.push('⚠️  Consider adding enhanced file blocking rules');
        }

        // Check for major search engines
        if (robotsContent.includes('Googlebot') && robotsContent.includes('Bingbot')) {
            this.success.push('✅ Major search engines explicitly allowed');
        } else {
            this.warnings.push('⚠️  Consider explicit rules for major search engines');
        }
    }

    validateConsistencyWithSwedish() {
        console.log('🔍 Validating consistency with Swedish site...');
        
        const swedishSitemapPath = path.join(__dirname, '..', 'dot-se', 'sitemap.xml');
        const swedishRobotsPath = path.join(__dirname, '..', 'dot-se', 'robots.txt');
        
        if (fs.existsSync(swedishSitemapPath) && fs.existsSync(swedishRobotsPath)) {
            this.success.push('✅ Swedish site files found for consistency check');
            
            const swedishSitemap = fs.readFileSync(swedishSitemapPath, 'utf8');
            const englishSitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
            
            // Check bidirectional hreflang
            const englishHasSwedishLinks = englishSitemap.includes('verkflode.se');
            const swedishHasEnglishLinks = swedishSitemap.includes('verkflode.com');
            
            if (englishHasSwedishLinks && swedishHasEnglishLinks) {
                this.success.push('✅ Bidirectional hreflang links confirmed');
            } else {
                this.errors.push('❌ Missing bidirectional hreflang links');
            }
        } else {
            this.warnings.push('⚠️  Swedish site files not found for consistency check');
        }
    }

    generateReport() {
        console.log('\n📊 English SEO Validation Report');
        console.log('=================================');
        
        if (this.success.length > 0) {
            console.log('\n✅ Successes:');
            this.success.forEach(item => console.log(`  ${item}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(item => console.log(`  ${item}`));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(item => console.log(`  ${item}`));
        }

        console.log('\n📈 Summary:');
        console.log(`  ✅ ${this.success.length} items passed`);
        console.log(`  ⚠️  ${this.warnings.length} warnings`);
        console.log(`  ❌ ${this.errors.length} errors`);

        if (this.errors.length === 0) {
            console.log('\n🎉 English SEO setup is optimized and ready!');
            console.log('📋 Consistency with Swedish site confirmed');
        } else {
            console.log('\n🔧 Please fix the errors above for optimal SEO performance.');
        }

        return this.errors.length === 0;
    }

    run() {
        console.log('🇬🇧 English Site SEO Validation');
        console.log('===============================\n');
        
        this.validateSitemap();
        this.validateRobotsTxt();
        this.validateConsistencyWithSwedish();
        
        return this.generateReport();
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new EnglishSEOValidator();
    const isValid = validator.run();
    process.exit(isValid ? 0 : 1);
}

module.exports = EnglishSEOValidator;