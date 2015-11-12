# test script

On MacOSX or Linux:

	./run_sts_gulp.sh

# AWS S3 Redirect Rule

	<RoutingRules>
		<RoutingRule>
		<Condition>
		  <KeyPrefixEquals>docs/</KeyPrefixEquals>
		</Condition>
		<Redirect>
		  <ReplaceKeyPrefixWith>documents/</ReplaceKeyPrefixWith>
		</Redirect>
		</RoutingRule>
	</RoutingRules>