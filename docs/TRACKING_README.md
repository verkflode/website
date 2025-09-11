# Verkflöde Demo Conversion Tracking

Privacy-focused tracking system that measures demo request effectiveness while respecting Verkflöde's data sovereignty principles.

## What's Tracked (Minimal & Privacy-First)

### 1. Demo Request Events Only
- **demo_request_click**: When users click "Request a Demo" buttons
- **demo_form_submit**: When users submit the contact form
- **page_view**: Basic page views for conversion rate calculation

### 2. What We DON'T Track
- ❌ Scroll depth or time spent on sections
- ❌ Mouse movements or hover behavior  
- ❌ Detailed user behavior patterns
- ❌ Any personally identifiable information

This approach aligns with Verkflöde's core message about data sovereignty and privacy.

## How to Use

### 1. View Analytics Data
**For Local Analysis:**
- Open `local-analytics.html` directly in your browser (file://) to view metrics
- This file is safe to keep locally and won't be accessible on the web

**For Server Access (if needed):**
- `admin/analytics-dashboard.html` is protected by .htaccess
- Only accessible to authorized personnel with proper server access

### 2. Access Data Programmatically
In the browser console on the website:
```javascript
// Get current session metrics
getTrackingMetrics()

// Export all tracking data
exportTrackingData()
```

### 3. Data Storage
- Events are stored in localStorage under `verkflode_tracking_events`
- Data persists across browser sessions
- Automatically limited to last 1000 events to prevent storage overflow

## Key Metrics to Monitor

### Essential Business Metrics Only
- **Demo Request Rate**: % of visitors who request demos
- **Conversion Rate**: Simple page views to demo requests ratio
- **Request Sources**: Which buttons/sections generate demo requests

### Why This Approach?
- **Brand Alignment**: Matches Verkflöde's data sovereignty message
- **Privacy First**: No behavioral surveillance or personal data collection
- **GDPR Simple**: Minimal data collection reduces compliance complexity
- **Trust Building**: Visitors see we practice what we preach about data privacy

## Baseline Metrics

The system automatically establishes baseline metrics from the first visit. Key benchmarks to track:

1. **Pre-Implementation Baseline**: Measure current performance
2. **Post-Implementation Comparison**: Track improvements after messaging changes
3. **A/B Testing**: Compare different messaging variations

## Implementation Details

### Files Added
- `dot-com/js/tracking.js`: Main tracking script for English site
- `dot-se/js/tracking.js`: Tracking script for Swedish site
- `analytics-dashboard.html`: Real-time analytics dashboard
- Updated both `index.html` files to include tracking scripts

### Privacy & GDPR Compliance
- **Consent-based tracking**: Users can accept or decline analytics tracking
- **Business-critical events**: Demo requests are always tracked (legitimate business interest)
- **Local storage only**: All data stored locally in browser, never transmitted externally
- **Transparent disclosure**: Updated privacy policies on both sites
- **User control**: Users can clear data anytime through browser settings
- **Minimal performance impact**: Uses requestAnimationFrame for optimal performance

### Future Enhancements
The tracking system is designed to be easily extended with:
- Server-side analytics endpoint integration
- A/B testing framework
- Conversion funnel analysis
- Heat mapping integration

## Requirements Satisfied

✅ **Event tracking for demo requests from new messaging**
- Tracks all demo button clicks and form submissions
- Includes context about which messaging elements led to conversion

✅ **Monitoring for time spent on updated sections**
- Intersection Observer tracks time in each section
- Measures engagement with new business-focused content

✅ **Scroll depth tracking for engagement measurement**
- Milestone tracking shows how compelling the content is
- Identifies where users drop off in the new messaging

✅ **Baseline metrics establishment before deployment**
- Dashboard provides baseline metrics from first use
- Enables before/after comparison of messaging effectiveness
#
# Privacy Compliance & GDPR

### Consent Management
The tracking system now includes a GDPR-compliant consent mechanism:

1. **First Visit**: Users see a non-intrusive consent notice at bottom of page
2. **Accept**: Full analytics tracking enabled (scroll depth, time spent, etc.)
3. **Decline**: Only business-critical demo tracking (legitimate business interest)
4. **Persistent**: User choice remembered across sessions in localStorage

### Data Categories
- **Always Tracked**: Demo requests and form submissions (business necessity under legitimate interest)
- **Consent Required**: Behavioral data (scroll depth, time spent, section engagement)
- **Local Only**: All data stored in browser localStorage, never transmitted externally

### Privacy Policy Updates
Both privacy policies have been updated to properly disclose:
- Types of data collected (behavioral analytics vs. necessary cookies)
- Legal basis for processing (legitimate interest)
- User rights and data retention
- Local storage approach (no external transmission)

### Files Updated for Privacy Compliance
- `dot-com/privacy-policy.html`: Updated to reflect minimal tracking approach
- `dot-se/integritetspolicy.html`: Updated Swedish privacy policy
- `dot-com/js/tracking.js`: Simplified to demo requests only
- `dot-se/js/tracking.js`: Simplified to demo requests only
- `local-analytics.html`: Local-only dashboard (excluded from git)
- `admin/analytics-dashboard.html`: Protected server-side dashboard (excluded from git)
## Secu
rity & Git Management

### Files Excluded from Git
The following analytics files are automatically excluded from git commits via `.gitignore`:
- `local-analytics.html` - Local-only dashboard
- `admin/analytics-dashboard.html` - Protected server dashboard  
- `admin/.htaccess` - Server protection rules

### Why Exclude Analytics Files?
1. **Security**: Prevents accidental public exposure of analytics tools
2. **Privacy**: Keeps internal business metrics private
3. **Deployment Control**: You choose what gets deployed where
4. **Clean Repository**: Keeps the public repo focused on the actual website

### Deployment Recommendations
- **Deploy to production**: Only the main website files (dot-com/, dot-se/)
- **Keep local**: `local-analytics.html` for personal use
- **Server admin only**: `admin/` directory if you need server-side access