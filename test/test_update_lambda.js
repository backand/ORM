var updateLambda = require('../lambda/update_lambda_function').updateLambdaFunctionFromS3;

updateLambda('hosting.backand.net', 'lambdas', 'three.zip', 'triple', function(err, data){
  console.log(err);
  console.log(data);
  process.exit(1);
});