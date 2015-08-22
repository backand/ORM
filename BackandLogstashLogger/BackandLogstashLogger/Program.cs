using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using System.Web.Script.Serialization;

namespace BackandLogstashLogger
{
    class Program
    {
        static String logstashServer = "ec2-52-3-33-37.compute-1.amazonaws.com";
        static Int32 logstashPort = 10520;
        static void Main(string[] args)
        {
            Console.WriteLine("hello");
            //LogMessage message = new LogMessage { ID="12300", ApplicationName="yoram", Username="kornatzky@me.com", MachineName="Golem" };
            //var javaScriptSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            //string jsonString = javaScriptSerializer.Serialize(message);
            //Console.WriteLine(jsonString);
            //Connect(logstashServer, logstashPort, jsonString);
            
            //Connect("ec2-52-3-33-37.compute-1.amazonaws.com", 10520, "vvv");

            SendLogMessage(
                "12300", 
                "bilam", 
                "johndoe@hotmail.com", 
                "Weizek", 
                null, 
                null, 
                null, 
                null, 
                null, 
                null,
                null, 
                null,
                null
            );
        }

        static void SendLogMessage(
             string ID,
             string ApplicationName,
             string Username,
             string MachineName,
             string Time,
             string Controller,
             string Action,
             string MethodName,
             string LogType,
             string ExceptionMessage,
             string Trace,
             string FreeText,
             string Guid
        )
        {
            LogMessage message = new LogMessage { 
                ID=ID, 
                ApplicationName=ApplicationName, 
                Username=Username, 
                MachineName=MachineName, 
                Time=Time, 
                Controller=Controller,
                Action=Action,
                MethodName=MethodName,
                LogType=LogType,
                ExceptionMessage=ExceptionMessage,
                Trace=Trace,
                FreeText=FreeText,
                Guid=Guid
            };
            var javaScriptSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string jsonString = javaScriptSerializer.Serialize(message);
            Connect(logstashServer, logstashPort, jsonString);
            Console.WriteLine("\n Press Enter to continue...");
            Console.Read();
        }


        static void Connect(String server, Int32 port, String message)
        {
            try
            {
                // Create a TcpClient. 
                // Note, for this client to work you need to have a TcpServer  
                // connected to the same address as specified by the server, port 
                // combination.
                
                TcpClient client = new TcpClient(server, port);

                // Translate the passed message into ASCII and store it as a Byte array.
                Byte[] data = System.Text.Encoding.ASCII.GetBytes(message);

                NetworkStream stream = client.GetStream();

                // Send the message to the connected TcpServer. 
                stream.Write(data, 0, data.Length);

                Console.WriteLine("Sent: {0}", message);

                // Close everything.
                stream.Close();
                client.Close();
            }
            catch (ArgumentNullException e)
            {
                Console.WriteLine("ArgumentNullException: {0}", e);
            }
            catch (SocketException e)
            {
                Console.WriteLine("SocketException: {0}", e);
            }


        }
    }

    public class LogMessage
    {
        public string ID { get; set; }
        public string ApplicationName { get; set; }
        public string Username { get; set; }
        public string MachineName { get; set; }
        public string Time { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public string MethodName { get; set; }
        public string LogType { get; set; }
        public string ExceptionMessage { get; set; }
        public string Trace { get; set; }
        public string FreeText { get; set; }
        public string Guid { get; set; }
    }

}
