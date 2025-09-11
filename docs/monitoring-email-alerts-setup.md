# Swedish Site Monitoring Email Alerts Setup

This guide explains how to set up email alerts for the Swedish site monitoring system using Mailgun.

## Overview

The monitoring system can send email alerts for critical events like:
- Website downtime
- Performance issues
- Error spikes
- SEO problems

## Prerequisites

- Existing Verkflöde infrastructure deployed (contact forms already use Mailgun)
- AWS CLI access
- Swedish site monitoring system installed

## Setup Steps

### Option A: Full Deployment (Recommended for New Setups)

If you haven't deployed the infrastructure yet, use the main deployment script:

```bash
cd aws-backend
# Set your existing Mailgun credentials
export MAILGUN_API_KEY="your-existing-key"
export MAILGUN_DOMAIN="mg.verkflode.se"
export TURNSTILE_SECRET_KEY="your-turnstile-key"

./deploy.sh
```

This deploys both contact forms AND monitoring alerts with Mailgun.

### Option B: Update Existing Deployment

If you already have the infrastructure deployed, just update the monitoring function:

```bash
cd aws-backend
./deploy-monitoring.sh
```

This updates only the monitoring alert Lambda function.

### 2. Update Monitoring Configuration

Edit `dot-se/admin/monitoring/monitoring-config.js`:

```javascript
alerts: {
    enabled: true,
    channels: {
        console: true,
        localStorage: true,
        email: true  // Enable email alerts
    },
    email: {
        enabled: true,
        apiEndpoint: 'https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/prod/monitoring-alert',
        fromEmail: 'monitoring@verkflode.se',
        toEmails: ['hej@verkflode.se'],
        cooldownPeriod: 300000, // 5 minutes between same alerts
        maxAlertsPerHour: 10
    }
}
```

Replace `YOUR_API_ID` with the actual API Gateway ID from the deployment output.

### 3. Test Email Alerts

1. Access the Swedish monitoring dashboard: `/admin/swedish-monitoring-dashboard.html`
2. Click "📧 Test Email Alert" button
3. Check your email inbox for the test alert

## Alert Types

### Critical Alerts (Immediate Email)
- `uptime_failure` - Website is down
- `performance_critical` - Severe performance issues
- `error_spike` - High error rates

### Warning Alerts (Rate Limited)
- `uptime_performance` - Slow response times
- `seo_critical` - SEO score drops significantly

## Email Alert Features

### Rate Limiting
- Maximum 10 alerts per hour
- 5-minute cooldown between same alert types
- Prevents email spam during incidents

### Rich Content
- HTML formatted emails with metrics
- Plain text fallback
- Direct links to monitoring dashboard
- Recommended actions for each alert type

### Alert Management
- Enable/disable via dashboard
- Test email functionality
- View alert statistics
- Configure alert recipients

## Configuration Options

### Email Recipients
```javascript
toEmails: [
    'hej@verkflode.se',
    'admin@verkflode.se',
    'alerts@verkflode.se'
]
```

### Alert Types to Email
```javascript
emailAlertTypes: [
    'uptime_failure',
    'performance_critical',
    'error_spike',
    'seo_critical'
]
```

### Cooldown Settings
```javascript
cooldownPeriod: 300000,    // 5 minutes
maxAlertsPerHour: 10       // Maximum alerts per hour
```

## Troubleshooting

### Email Not Sending
1. Check Mailgun API credentials
2. Verify API endpoint URL
3. Check Lambda function logs in AWS CloudWatch
4. Test Mailgun domain configuration

### Too Many Alerts
1. Adjust `maxAlertsPerHour` setting
2. Increase `cooldownPeriod`
3. Review alert thresholds in monitoring config

### Missing Alerts
1. Check if email alerts are enabled
2. Verify alert types configuration
3. Check monitoring system health
4. Review alert history in dashboard

## Security Considerations

### API Endpoint Security
- CORS restricted to verkflode.se domains
- Request validation and sanitization
- Rate limiting at Lambda level

### Email Content
- No sensitive data in email content
- Generic error messages
- Links to secure admin dashboard

### Access Control
- Admin dashboard protected by .htaccess
- Email alert controls require admin access
- API endpoint validates request origin

## Monitoring Dashboard Controls

### Email Alert Controls
- **📧 Test Email Alert** - Send test email
- **📧 Email: ON/OFF** - Toggle email alerts
- **Alert Statistics** - View email alert stats

### Alert History
- Recent alerts displayed in dashboard
- Email delivery status tracking
- Alert frequency monitoring

## Maintenance

### Regular Tasks
1. Monitor email delivery rates
2. Review alert thresholds quarterly
3. Update recipient lists as needed
4. Test email functionality monthly

### Updates
- Lambda function updates via deployment script
- Configuration changes via monitoring config
- Mailgun settings via Mailgun dashboard

## Support

For issues with email alerts:
1. Check AWS CloudWatch logs for Lambda errors
2. Verify Mailgun delivery logs
3. Test with simple alert types first
4. Review monitoring system health

The email alert system provides reliable notification of critical issues while preventing alert fatigue through intelligent rate limiting and cooldown periods.