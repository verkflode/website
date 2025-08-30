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

# Create deployment package for Lambda
echo "📦 Creating Lambda deployment package..."
cd lambda/contact-form
zip -r ../../lambda-deployment.zip . -x "*.git*" "*.DS_Store*"
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
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://lambda-deployment.zip \
    --region $REGION

# Get API endpoint
echo "🔗 Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text \
    --region $REGION)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your website forms to use this API endpoint:"
echo "   $API_ENDPOINT"
echo ""
echo "2. Set up Amplify hosting:"
echo "   - Go to AWS Amplify console"
echo "   - Connect your GitHub repository"
echo "   - Set up custom domains for verkflode.com and verkflode.se"
echo ""
echo "3. Update your DNS records to point to Amplify"

# Clean up
rm lambda-deployment.zip

echo ""
echo "🎉 Ready to go live!"