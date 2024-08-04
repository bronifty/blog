

aws lambda add-permission \
--statement-id "AllowCloudFrontServicePrincipal" \
--action "lambda:InvokeFunctionUrl" \
--principal "cloudfront.amazonaws.com" \
--source-arn "arn:aws:cloudfront::851725517932:distribution/ESIRP741RQG6" \
--region "us-east-1" \
--function-name remix-ssr


.