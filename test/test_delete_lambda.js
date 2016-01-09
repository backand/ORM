var deleteLambda = require('../lambda/delete_lambda_function').deleteLambdaFunctionFromS3;

deleteLambda('lambdas', 'triple', function(err, data){
  console.log(err);
  console.log(data);
  process.exit(1);
});