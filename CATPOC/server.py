from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import subprocess
import sys
import os
import json
import cgi
import shutil 
import urllib.request

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        SimpleHTTPRequestHandler.end_headers(self)

    def save_file(self, file, filename):
        outpath = os.path.join(".", "uploaded_corpora", filename)

        with open(outpath, 'wb') as fout:
            #shutil.copyfileobj(file, fout, 100000)
            fout.write(file)
        return outpath
        
            
    def do_upload(self):

        #self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        #self.send_response(200)

                
        form=cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST'})
        
        corpus = form.getvalue('corpus')
        corpusname = form.getvalue('corpusname')        
        srclang = form.getvalue('srclang')
        trglang = form.getvalue('trglang')
        if not trglang:
            trglang=""
            
        format = form.getvalue('corpus-format')
        langformat = form.getvalue('lang-format')
                   
        saved_file_path = self.save_file(corpus, corpusname)
        yaml_file_path = saved_file_path.replace("/uploaded_corpora/", "/yaml_dir/") + ".yaml"
        
        options = []
        options.append("bash")
        options.append("./scripts/runstats.sh")
        options.append(saved_file_path)
        options.append(yaml_file_path)
        options.append(srclang)
        options.append(trglang)
        options.append(format)
        options.append(langformat)
        print(" ".join(options))
        subprocess.Popen(options)


        replyhtml = """
        <html>
        <body>
        <div>
        Processing! This might take some time.
        </div>
        <div>
        <a href="viewer.html">Go to viewer</a>
        </div>
        </body>
        </html>
        """
        #self.wfile.write(bytes(replyhtml, 'utf-8'))
        self.send_response(302)
        #new_path = '%s%s'%('http://newserver.com', self.path)
        self.send_header('Location', self.path.replace("upload", "uploader.html?fromupload=yes"))
        self.send_header("Redirect-From", "upload")
        self.end_headers()
        return 
        

    def do_list(self):
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()
        # Send the html message
        self.wfile.write(bytes(json.dumps(os.listdir("yaml_dir"), ensure_ascii=False), 'utf-8'))
        #str(os.listdir("yaml_dir")))  
        return
    


    def do_POST(self):
        if self.path == '/upload':
            self.do_upload()


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