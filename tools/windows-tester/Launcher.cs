using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal static class Launcher {
    const string Url="http://127.0.0.1:4188/starflight-junior-crew/";
    const string StatusUrl="http://127.0.0.1:4188/__junior_tester__/status";
    const string ServerId="starflight-junior-crew-windows-tester-v1";
    const string LockName="Local\\StarflightJuniorCrewTester4188";
    const string StopName=LockName+".Stop";
    static readonly JavaScriptSerializer Json=new JavaScriptSerializer();
    static bool Silent;

    static string Argument(string[] args,string key) {for(int i=0;i+1<args.Length;i++)if(args[i]==key)return args[i+1];return null;}
    static string Quote(string s) {return "\""+s.Replace("\"","\\\"")+"\"";}
    static Dictionary<string,object> Status() {
        try {
            var request=(HttpWebRequest)WebRequest.Create(StatusUrl);request.Timeout=1500;request.ReadWriteTimeout=1500;request.Proxy=null;request.AllowAutoRedirect=false;
            using(var response=request.GetResponse())using(var reader=new StreamReader(response.GetResponseStream())) {
                var buffer=new char[4096];int length=reader.ReadBlock(buffer,0,buffer.Length);
                if(reader.Peek()!=-1)return null;
                return Json.Deserialize<Dictionary<string,object>>(new string(buffer,0,length));
            }
        }catch{return null;}
    }
    static bool Matches(Dictionary<string,object> status,string build) {
        return status!=null&&status.ContainsKey("server")&&Equals(status["server"],ServerId)&&status.ContainsKey("build")&&Equals(status["build"],build);
    }
    static void OpenGame(string[] args) {
        // Diagnostic mode opens only a fresh physically muted headless profile.
        // Normal double-click uses the player's existing default browser.
        var browser=Argument(args,"--test-browser");var profile=Argument(args,"--test-profile");
        if(browser!=null&&profile!=null) {
            Process.Start(new ProcessStartInfo(browser,"--headless=new --mute-audio --no-first-run --no-default-browser-check --disable-extensions --remote-debugging-port=0 --user-data-dir="+Quote(profile)+" "+Url){UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden});
        }else Process.Start(new ProcessStartInfo(Url){UseShellExecute=true});
    }
    static void Error(string text) {if(!Silent)MessageBox.Show(text,"Starflight: Junior Crew",MessageBoxButtons.OK,MessageBoxIcon.Information);}

    [STAThread]
    static int Main(string[] args) {
        Silent=Array.IndexOf(args,"--no-browser")>=0||Argument(args,"--test-browser")!=null;
        if(Array.IndexOf(args,"--stop")>=0) {
            try {using(var stop=EventWaitHandle.OpenExisting(StopName))stop.Set();return 0;}catch(WaitHandleCannotBeOpenedException){return 0;}
        }
        bool created;using(var mutex=new Mutex(true,LockName,out created)) {
            Process child=null;NotifyIcon tray=null;EventWaitHandle stop=null;
            try {
                var root=AppDomain.CurrentDomain.BaseDirectory;
                var info=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(Path.Combine(root,"BUILD-INFO.json")));
                var build=(string)info["buildSHA256"];
                if(!created) {
                    for(int i=0;i<40;i++){if(Matches(Status(),build)){if(!Silent)OpenGame(args);return 0;}Thread.Sleep(200);}
                    Error("Another tester copy is still running. Exit it using its Starflight tray icon, then launch this copy. Your browser saves will remain available.");return 2;
                }
                if(Status()!=null) {Error("Port 4188 is already in use. Close the other local tester copy, then try again. No settings or saves were changed.");return 3;}
                var runtime=Path.Combine(root,"runtime","node.exe");var server=Path.Combine(root,"runtime","server.mjs");
                if(!File.Exists(runtime)||!File.Exists(server)||!File.Exists(Path.Combine(root,"game","index.html"))) {
                    Error("Extract the entire ZIP first, then launch the EXE inside the extracted folder. Keep the game and runtime folders beside the launcher.");return 4;
                }
                var childInfo=new ProcessStartInfo(runtime,Quote(server)+" --managed"){
                    WorkingDirectory=root,UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden,
                    RedirectStandardInput=true,RedirectStandardOutput=true,RedirectStandardError=true
                };
                // Exclude machine-wide Node preload/inspection settings from this
                // portable server; the runtime is only used for our static files.
                var remove=new List<string>();
                foreach(string key in childInfo.EnvironmentVariables.Keys)if(key.StartsWith("NODE_",StringComparison.OrdinalIgnoreCase))remove.Add(key);
                foreach(string key in remove)childInfo.EnvironmentVariables.Remove(key);
                child=Process.Start(childInfo);
                var readyTask=Task.Factory.StartNew(()=>child.StandardOutput.ReadLine());
                if(!readyTask.Wait(10000)||readyTask.Result==null||!Matches(Json.Deserialize<Dictionary<string,object>>(readyTask.Result),build)||!Matches(Status(),build)) {
                    Error("The local game server could not start. Port 4188 may already be in use, or Windows may have blocked a file. Keep the extracted files together and try again.");return 5;
                }
                bool ignored;stop=new EventWaitHandle(false,EventResetMode.AutoReset,StopName,out ignored);
                Application.EnableVisualStyles();
                var menu=new ContextMenuStrip();
                menu.Items.Add("Open Starflight: Junior Crew",null,delegate {try{OpenGame(args);}catch(Exception e){Error(e.Message);}});
                menu.Items.Add("Read tester instructions",null,delegate {try{Process.Start(new ProcessStartInfo(Path.Combine(root,"READ ME FIRST.txt")){UseShellExecute=true});}catch(Exception e){Error(e.Message);}});
                menu.Items.Add("Exit tester server",null,delegate {Application.Exit();});
                tray=new NotifyIcon {Icon=SystemIcons.Application,Text="Starflight: Junior Crew tester",ContextMenuStrip=menu,Visible=true};
                tray.DoubleClick+=delegate {try{OpenGame(args);}catch(Exception e){Error(e.Message);}};
                var timer=new System.Windows.Forms.Timer {Interval=250};
                timer.Tick+=delegate {if(stop.WaitOne(0)||child.HasExited)Application.Exit();};timer.Start();
                if(Array.IndexOf(args,"--no-browser")<0)OpenGame(args);
                Application.Run();timer.Stop();timer.Dispose();menu.Dispose();return 0;
            }catch(Exception e) {Error("Unable to launch the game: "+e.Message+"\n\nExtract the entire ZIP into a normal folder and try again. No administrator access or installation is required.");return 6;}
            finally {
                if(tray!=null){tray.Visible=false;tray.Dispose();}
                if(stop!=null)stop.Dispose();
                if(child!=null){try{if(!child.HasExited){child.StandardInput.Close();if(!child.WaitForExit(3000)){child.Kill();child.WaitForExit();}}}catch{}child.Dispose();}
                if(created)mutex.ReleaseMutex();
            }
        }
    }
}
