using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using dotenv.net;
using dotenv.net.Utilities;
using Flurl;
using Flurl.Http;
using Nancy;
using Nancy.Hosting.Self;
using Newtonsoft.Json;

namespace csharp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            using (var host = new NancyHost(new Uri("http://127.0.0.1:4567")))
            {
                host.Start();
                Console.WriteLine("Running on http://127.0.0.1:4567");
                Console.ReadLine();
            }
        }
    }
}