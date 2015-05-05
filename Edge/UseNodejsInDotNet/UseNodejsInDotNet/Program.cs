using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EdgeJs;
using System.IO;
using System.Net;

namespace UseNodejsInDotNet
{
    class Program
    {

        public static async void Start()
        {
            var func = Edge.Func(@"
                return function (data, callback) {
                    callback(null, 'Node.js welcomes ' + data);
                }
            ");

            var schema = new
            {
                anInteger = 1,
                aNumber = 3.1415,
                aString = "foo",
                aBoolean = true,

                anArray = new object[] { 1, "foo" },
                anObject = new { a = "foo", b = 12 },
            };

            String s = @"{ 	""table"" : ""Employees"",	""q"" : {		""$or"" : [			{				""Budget"" : {					""$gt"" : 3000				}		},{				""Location"" : ""Tel Aviv""			}		]}}";
            
            var func1 = Edge.Func(File.ReadAllText(".\\..\\..\\myfunc.js"));

            Console.WriteLine(await func1("kuku"));

            var increment = Edge.Func(@"
                var current = 0;

                return function (data, callback) {
                    current += data;
                    callback(null, current);
                }
            ");
            Console.WriteLine(await increment(4)); // outputs 4
            Console.WriteLine(await increment(7)); // outputs 11

            var func2 = Edge.Func(File.ReadAllText(".\\..\\..\\myobj.js"));

            var fObj = Edge.Func(@"

                var u = require('underscore');
                console.log(u);
                return function (data, callback) {
                    console.log(u);
                    console.log('f'+ data + 'f');
                    // var k = _.keys(data);
                   // console.log(k);
                 //   callback(null, _.keys(data));
                    callback(null, data);
                }    

            ");

            var o1 = await fObj("xxx");
            Console.WriteLine(o1.ToString());

           // var o = await func2(schema);
            Console.WriteLine("ooooooo");
        //    Console.WriteLine(o.ToString());
          //  await Task.Delay(86400);
        //    Console.WriteLine(o.ToString());

//            var createHttpServer = Edge.Func(@"
//                var http = require('http');
//                console.log('require');
//                return function (port, cb) {
//                    console.log('function');
//                    var server = http.createServer(function (req, res) {
//                        console.log('req');
//                        res.end('Hello, world! ' + new Date());
//                    }).listen(port, cb);
//                };
//            ");

//            await createHttpServer(9000);
//            try
//            {
//                String s = await new WebClient().DownloadStringTaskAsync("http://localhost:9000");
//                Console.WriteLine(s);
//            }
//            catch (Exception e)
//            {

//                Console.WriteLine(e.ToString());
//            }
            
        }

        static void Main(string[] args)
        {
            Task.Run((Action)Start).Wait();
        }
    }
}
