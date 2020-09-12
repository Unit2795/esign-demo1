using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using dotenv.net;
using dotenv.net.Utilities;
using Flurl;
using Flurl.Http;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.Hosting.Self;
using Nancy.TinyIoc;
using Newtonsoft.Json;

namespace csharp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            using (var host = new NancyHost(new Uri("http://localhost:4567")))
            {
                host.Start();
                Console.WriteLine("Running on http://localhost:4567");
                Console.ReadLine();
            }
        }
    }
}