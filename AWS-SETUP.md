# Verkflöde AWS Hosting Setup Guide

This guide will help you deploy both verkflode.com and verkflode.se to AWS using Amplify for hosting and Lambda for form handling.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Mailgun Account** for email sending
4. **Cloudflare Account** for Turnstile (already set up)

## Step 1: Configure Environment Variables

Set these environment variables in your terminal:

```bash
export MAILGUN_API_KEY="your-mailgun-api-key"
export MAILGUN_DOMAIN="mg.verkflode.se"  # or your Mailgun domain
export TURNSTILE_SECRET_KEY="your-turnstile-secret-key"
```

## Step 2: Deploy Backend Infrastructure

```bash
cd verkflode-new-website/aws-backend
./deploy.sh
```

This script will:
- Create a Lambda function for form handling
- Set up API Gateway with CORS
- Deploy CloudFormation stack
- Return your API endpoint URL

## Step 3: Update Form Endpoints

After deployment, update the form action URLs in both sites:

**For verkflode.com** (`dot-com/index.html`):
```html
<form id="contactForm" action="YOUR_API_ENDPOINT_HERE" method="post">
```

**For verkflode.se** (`dot-se/index.html`):
```html
<form id="contactForm" action="YOUR_API_ENDPOINT_HERE" method="post">
```

Also update the JavaScript fetch URLs in both `main.js` files:
```javascript
fetch('YOUR_API_ENDPOINT_HERE', {
```

## Step 4: Set Up Amplify Hosting

### Option A: Using AWS Console (Recommended)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Choose the branch (main/master)
5. Set build settings:
   - For verkflode.com: Set app root to `dot-com`
   - For verkflode.se: Set app root to `dot-se`
6. Deploy!

### Option B: Using Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
amplify init
amplify add hosting
amplify publish
```

## Step 5: Configure Custom Domains

1. In Amplify Console, go to "Domain management"
2. Add custom domains:
   - `verkflode.com` → points to dot-com app
   - `verkflode.se` → points to dot-se app
3. Update your DNS records as instructed by Amplify

## Step 6: Test Everything

1. **Forms**: Submit test forms on both sites
2. **Mobile**: Test mobile responsiveness
3. **Turnstile**: Verify security challenges work
4. **Email**: Check that emails arrive via Mailgun

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AWS Amplify   │    │   AWS Lambda     │    │    Mailgun      │
│                 │    │                  │    │                 │
│ verkflode.com   │───▶│  Contact Form    │───▶│  Email Sending  │
│ verkflode.se    │    │  Handler         │    │                 │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Cloudflare     │    │   API Gateway    │
│  Turnstile      │    │   (CORS enabled) │
│  (Frontend)     │    │                  │
└─────────────────┘    └──────────────────┘
```

## Cost Estimation

- **Amplify**: ~$1-5/month per site (depending on traffic)
- **Lambda**: ~$0.20/month (1M requests free tier)
- **API Gateway**: ~$3.50/month (1M requests)
- **Total**: ~$5-15/month for both sites

## Troubleshooting

### Form submissions not working
- Check API endpoint URL in forms
- Verify CORS settings in API Gateway
- Check Lambda function logs in CloudWatch

### Turnstile not loading
- Verify site key is correct
- Check browser console for errors
- Ensure domain matches Turnstile configuration

### Emails not sending
- Verify Mailgun API key and domain
- Check Lambda function environment variables
- Review CloudWatch logs for errors

## Security Notes

- All sensitive keys are stored as environment variables
- Turnstile provides bot protection
- API Gateway has CORS properly configured
- Lambda function validates all inputs

## Support

If you encounter issues:
1. Check CloudWatch logs for Lambda function
2. Verify all environment variables are set
3. Test API endpoint directly with curl/Postman
4. Check Amplify build logs

---

🎉 **Congratulations!** Your sites should now be live on AWS with proper form handling and security!