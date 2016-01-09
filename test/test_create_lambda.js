var createLambda = require('../lambda/create_lambda_function').createLambdaFunctionFromS3;

createLambda('hosting.backand.net', 'lambdas', 'three.zip', 'triple', 'index', 'g', function(err, data){
  console.log(err);
  console.log(data);
  process.exit(1);
});