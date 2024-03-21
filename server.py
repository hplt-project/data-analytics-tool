from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import subprocess
import sys
import os
import json
import cgi
import shutil 
import urllib.request
from pathlib import Path

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        SimpleHTTPRequestHandler.end_headers(self)

    def save_file(self, file, filename):
        outpath = os.path.join("/", "work", "uploaded_corpora", filename)

        with open(outpath, 'wb') as fout:
            #shutil.copyfileobj(file, fout, 100000)
            
            fout.write(bytes(file, 'utf8'))
        return outpath
        
    
    def get_command(self, form, saved_file_path, yaml_file_path):

        srclang = form.getvalue('srclang')
        trglang = form.getvalue('trglang')
        if not trglang:
            trglang="None"
        format = form.getvalue('corpus-format')
        langformat = form.getvalue('lang-format')
                
        command = []
        command.append("bash")
        command.append("/work/scripts/runstats.sh")
        command.append(saved_file_path)
        command.append(yaml_file_path)
        command.append(srclang)
        command.append(trglang)
        command.append(format)
        command.append(langformat)
        
        return(command)
    
            
    def do_upload(self):

        form=cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST'})        
                   
        saved_file_path = self.save_file(form.getvalue('corpus'), form.getvalue('corpusname'))
        yaml_file_path = saved_file_path.replace("/uploaded_corpora/", "/yaml_dir/") + ".yaml"
        
        command = self.get_command(form, saved_file_path, yaml_file_path)
        subprocess.Popen(command)

        self.send_response(302)
        self.send_header('Location', self.path.replace("upload", "uploader.html?fromupload=yes"))
        self.send_header("Redirect-From", "upload")
        self.end_headers()
        return 
        

    def do_getcmd(self):

        form=cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST'})
        
        saved_file_path = "LOCAL/PATH/TO/CORPUS"
        yaml_file_path = os.path.join("/", "work",  "yaml_dir", form.getvalue('corpusname')) + ".yaml"
        
        command = self.get_command(form, saved_file_path, yaml_file_path)
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(json.dumps(" ".join(command), ensure_ascii=False), 'utf-8'))
        return
        

    def do_list(self):
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()
        # Send the html message
        files = sorted((file for file in Path("yaml_dir").iterdir() if not file.name.startswith(".")), key=os.path.getmtime, reverse=True)
        str_files = [str(file).replace("yaml_dir/", "") for file in files]
        self.wfile.write(bytes(json.dumps(str_files, ensure_ascii=False), 'utf-8'))
        #str(os.listdir("yaml_dir")))  
        return
    


    def do_POST(self):
        if self.path == '/upload':
            self.do_upload()
        elif self.path == '/getcmd':
            self.do_getcmd()


    def do_GET(self):
        #if self.path == '/uploader.html':
            
        if self.path == '/list':
            self.do_list()
        elif  "/file/" in self.path:
            self.send_response(200)
            self.send_header('Content-type', 'application/text')
            self.end_headers()
            with open("."+self.path.replace("/file/", "/yaml_dir/"), 'rb') as file: 
                self.wfile.write(file.read()) # Read the file and send the contents 
        elif "/download/" in self.path:
            self.send_response(200)
            self.send_header('Content-type', 'application/text')
            self.end_headers()
            with open("."+self.path.replace("/download/", "/yaml_dir/"), 'rb') as file: 
                self.wfile.write(file.read())
        elif "/opus_langs" in self.path:
            self.send_response(200)
            self.send_header('Content-type', 'application/text')
            self.end_headers()
            resp = urllib.request.urlopen("https://opus.nlpl.eu/opusapi/?languages=True")
            content = resp.read()
            content_text = content.decode("utf-8")

            #print(bytes(json.dumps(content_text, ensure_ascii=False), "utf-8"))            
            self.wfile.write(bytes(content_text, 'utf-8'))
            #self.wfile.write(bytes(json.dumps(content_text, ensure_ascii=False), "utf-8"))
        else:
            return SimpleHTTPRequestHandler.do_GET(self)
        


                    
if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)