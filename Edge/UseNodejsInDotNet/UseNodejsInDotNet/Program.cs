using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EdgeJs;
using System.IO;
using System.Net;
using System.Web.Script.Serialization;

namespace UseNodejsInDotNet
{
    class Program
    {
        private static async Task firstAsync()
        {
            var func = Edge.Func(@"
                return function (data, callback) {
                    callback(null, 'Node.js welcomes ' + data);
                }
            ");

            Object result = await func("kuku");
            Console.WriteLine(result.ToString());
        }

        private static async Task appendAsync()
        {
            var func = Edge.Func(File.ReadAllText(".\\..\\..\\append.js"));
            Object result = await func("kuku");
            Console.WriteLine(result.ToString());
        }


        private static async Task keepStateAsync()
        {
            var increment = Edge.Func(@"
                var current = 0;

                return function (data, callback) {
                    current += data;
                    callback(null, current);
                } 
            ");

            Console.WriteLine(await increment(4)); // outputs 4
            Console.WriteLine(await increment(7)); // outputs 11

        }


        private static async Task stateAsync()
        {
            var increment = Edge.Func(File.ReadAllText(".\\..\\..\\state.js"));

            Console.WriteLine(await increment(4)); // outputs 4
            Console.WriteLine(await increment(7)); // outputs 11

        }


        private static async Task useBuiltinAsync()
        {
            var createHttpServer = Edge.Func(@"
                var http = require('http');

                return function (port, cb) {
                    var server = http.createServer(function (req, res) {
                        res.end('Hello, world! ' + new Date());
                    }).listen(port, cb);
                };
            ");

            await createHttpServer(8080);
            Console.WriteLine(await new WebClient().DownloadStringTaskAsync("http://localhost:8080"));

        }



        private static async Task useUnderscoreAsync()
        {
            var func = Edge.Func(@"
                var _ = require('underscore');
                return function (data, callback) {
                    
                    var o = JSON.parse(data);
                    console.log(o);
                    var result = _.pluck(o, 'name');
                    console.log(result);
                    var s = JSON.stringify(result);
                    console.log('s', s);
                    callback(null,s);
                }
            ");

            //Object result = await func(@"{ 	""c"" : 4, ""d"": 5 }");
            //Console.WriteLine(result.ToString());
            Object result1 = await func(@" [{
 		""name"": ""user"",
 		""fields"": {
 			""name"": {
 				""type"": ""string""
 			},
 			""age"": {
 				""type"": ""datetime""
 			},
 			""dogs"":{
 				""collection"": ""pet"",
 				""via"": ""owner""
 			}
 		}
 	},

 	{ 

 		""name"": ""pet"",

 		""fields"": {
 			""name"": {
 				""type"": ""string""
 			},
 			""registered"": {
 				""type"": ""boolean""
 			},
 			""owner"":{
 				""object"": ""user""
 			}
 		}
		
 	}]");
            
            Console.WriteLine(result1);
            //JavaScriptSerializer jsonParser = new JavaScriptSerializer();
            //String resultString = jsonParser.Serialize(result1);

            //Console.WriteLine(resultString);

        }


        private static async Task underscoreAsync()
        {
            var func = Edge.Func(File.ReadAllText(".\\..\\..\\genericArrays.js"));

            Object result = await func(@" 
                [
                    {
 		                ""name"": ""user"",
 		                ""fields"": {
 			                ""name"": {
 				                ""type"": ""string""
 			                },
 			                ""age"": {
 				                ""type"": ""datetime""
 			                },
 			                ""dogs"":{
 				                ""collection"": ""pet"",
 				                ""via"": ""owner""
 			                }
 		                }
 	                },

 	                { 

 		                ""name"": ""pet"",

 		                ""fields"": {
 			                ""name"": {
 				                ""type"": ""string""
 			                },
 			                ""registered"": {
 				                ""type"": ""boolean""
 			                },
 			                ""owner"":{
 				                ""object"": ""user""
 			                }
 		                }
		
 	                }
                ]
            ");

            Console.WriteLine(result);
        }

        private static async Task transformAsync()
        {
            var transform = Edge.Func(File.ReadAllText(".\\..\\..\\transform.js"));

            Object result = await transform(@"{ 
                ""oldSchema"" : [], 
                ""newSchema"" : [
                   {
 		                ""name"": ""user"",
 		                ""fields"": {
 			                ""name"": {
 				                ""type"": ""string""
 			                },
 			                ""age"": {
 				                ""type"": ""datetime""
 			                },
 			                ""dogs"":{
 				                ""collection"": ""pet"",
 				                ""via"": ""owner""
 			                }
 		                }
 	                },

 	                { 

 		                ""name"": ""pet"",

 		                ""fields"": {
 			                ""name"": {
 				                ""type"": ""string""
 			                },
 			                ""registered"": {
 				                ""type"": ""boolean""
 			                },
 			                ""owner"":{
 				                ""object"": ""user""
 			                }
 		                }
	                } 

                ], 

                ""severity"": 0

            }");
            Console.WriteLine(result.ToString());

        }
    

        public static async void Start()
        {
            // inline js code
            // await firstAsync();
            // await keepStateAsync();
            // await useBuiltinAsync();
            // await useUnderscoreAsync();

            // js code in files
            //await appendAsync();
            // await stateAsync();
            //await underscoreAsync();
            await transformAsync();
            
        }

        static void Main(string[] args)
        {
            Task.Run((Action)Start).Wait();
        }
    }
}
