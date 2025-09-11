# Turnstile Keys Update Guide

## Updated Keys
- **Site Key**: `0x4AAAAAABvQQQ8dZiQYK5sR`
- **Secret Key**: `0x4AAAAAABvQQdOf84R3qkkQUnJlv5ni1Uc`

## Changes Made
✅ Updated HTML files with new site key:
- `verkflode-new-website/dot-com/index.html`
- `verkflode-new-website/dot-se/index.html`

## Next Steps - Update Backend Lambda Function

To update the backend with the new secret key, run these commands:

```bash
cd verkflode-new-website/aws-backend

# Set the new Turnstile secret key
export TURNSTILE_SECRET_KEY="0x4AAAAAABvQQdOf84R3qkkQUnJlv5ni1Uc"

# Set your existing Mailgun credentials (if not already set)
export MAILGUN_API_KEY="your-mailgun-api-key"
export MAILGUN_DOMAIN="mg.verkflode.se"

# Deploy the updated configuration
./deploy.sh
```

## Alternative: Update via AWS Console

If you prefer to update via the AWS Console:

1. Go to AWS Lambda console
2. Find the `verkflode-contact-form` function
3. Go to Configuration → Environment variables
4. Update `TURNSTILE_SECRET_KEY` to: `0x4AAAAAABvQQdOf84R3qkkQUnJlv5ni1Uc`
5. Save the changes

## Testing

After updating the backend, test the contact forms on both:
- https://verkflode.com
- https://verkflode.se

The forms should now work with the new Turnstile configuration.