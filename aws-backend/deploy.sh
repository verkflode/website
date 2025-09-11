#!/bin/bash

# Verkflöde AWS Deployment Script
# This script deploys the Lambda function and CloudFormation stack

set -e

echo "🚀 Deploying Verkflöde AWS Infrastructure..."

# Configuration
STACK_NAME="verkflode-infrastructure"
LAMBDA_FUNCTION_NAME="verkflode-contact-form"
REGION="eu-north-1"  # Stockholm region for Swedish company

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if required parameters are set
if [ -z "$MAILGUN_API_KEY" ] || [ -z "$MAILGUN_DOMAIN" ] || [ -z "$TURNSTILE_SECRET_KEY" ]; then
    echo "❌ Required environment variables not set:"
    echo "   MAILGUN_API_KEY"
    echo "   MAILGUN_DOMAIN"
    echo "   TURNSTILE_SECRET_KEY"
    echo ""
    echo "Please set these variables and run again:"
    echo "export MAILGUN_API_KEY='your-mailgun-api-key'"
    echo "export MAILGUN_DOMAIN='mg.verkflode.se'"
    echo "export TURNSTILE_SECRET_KEY='your-turnstile-secret-key'"
    exit 1
fi

# Check if stack exists and delete if in failed state
echo "🔍 Checking existing stack status..."
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [ "$STACK_STATUS" = "ROLLBACK_COMPLETE" ] || [ "$STACK_STATUS" = "CREATE_FAILED" ] || [ "$STACK_STATUS" = "UPDATE_ROLLBACK_COMPLETE" ]; then
    echo "⚠️  Stack is in failed state ($STACK_STATUS). Deleting..."
    aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION
    echo "⏳ Waiting for stack deletion..."
    aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $REGION
    echo "✅ Stack deleted successfully"
fi

# Create deployment packages for Lambda functions
echo "📦 Creating Lambda deployment packages..."

# Contact form Lambda
cd lambda/contact-form
zip -r ../../contact-form-deployment.zip . -x "*.git*" "*.DS_Store*"
cd ../..

# Monitoring alert Lambda
cd lambda/monitoring-alert
zip -r ../../monitoring-alert-deployment.zip . -x "*.git*" "*.DS_Store*"
cd ../..

# Deploy CloudFormation stack
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file cloudformation/infrastructure.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        MailgunApiKey="$MAILGUN_API_KEY" \
        MailgunDomain="$MAILGUN_DOMAIN" \
        TurnstileSecretKey="$TURNSTILE_SECRET_KEY" \
    --capabilities CAPABILITY_IAM \
    --region $REGION

# Update Lambda function code
echo "🔄 Updating Lambda function code..."

# Update contact form Lambda
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://contact-form-deployment.zip \
    --region $REGION

# Update monitoring alert Lambda
aws lambda update-function-code \
    --function-name verkflode-monitoring-alert \
    --zip-file fileb://monitoring-alert-deployment.zip \
    --region $REGION

# Get API endpoints
echo "🔗 Getting API endpoints..."
CONTACT_API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ContactApiEndpoint`].OutputValue' \
    --output text \
    --region $REGION)

MONITORING_API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`MonitoringAlertApiEndpoint`].OutputValue' \
    --output text \
    --region $REGION)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 API Endpoints:"
echo "   Contact Forms: $CONTACT_API_ENDPOINT"
echo "   Monitoring Alerts: $MONITORING_API_ENDPOINT"
echo ""
echo "📋 Next steps:"
echo "1. Update your website forms to use the contact API endpoint"
echo ""
echo "2. Update monitoring configuration with the monitoring API endpoint:"
echo "   Edit: dot-se/admin/monitoring/monitoring-config.js"
echo "   Set: alerts.email.apiEndpoint = '$MONITORING_API_ENDPOINT'"
echo ""
echo "3. Set up Amplify hosting:"
echo "   - Go to AWS Amplify console"
echo "   - Connect your GitHub repository"
echo "   - Set up custom domains for verkflode.com and verkflode.se"
echo ""
echo "4. Test email alerts via the Swedish monitoring dashboard"

# Clean up
rm contact-form-deployment.zip monitoring-alert-deployment.zip

echo ""
echo "🎉 Ready to go live!"