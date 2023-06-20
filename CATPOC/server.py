from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import subprocess
import sys
import os
import json
import cgi
import shutil 

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
        print ("in post method")
       
        #self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        self.send_response(200)
        self.end_headers()
                
        '''
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        ctype, pdict = cgi.parse_header(self.headers['Content-Type'])
        print(ctype)
        print(pdict)
        if ctype == 'multipart/form-data':
            pdict['boundary'] = bytes(pdict['boundary'], 'utf-8')
            fields = cgi.parse_multipart(self.rfile, pdict)
            messagecontent = fields.get('message')[0].decode('utf-8')
        else:
            print("WHAT")
        output = ''
        output += '<html><body>'
        output += '<h2> Okay, how about this: </h2>'
        output += '<h1> %s </h1>' % messagecontent
        output += "<form method='POST' enctype='multipart/form-data' action='/hello'><h2>What would you like me to say?</h2><input name='message' type='text'><input type='submit' value='Submit'></form>"
        output += '</html></body>'
        self.wfile.write(output.encode('utf-8'))
        print(output)
        '''
        '''
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                'REQUEST_METHOD': 'POST',
                'CONTENT_TYPE': self.headers['Content-Type'],
            })
        '''
        form=cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST'})
        
        corpus = form.getvalue('corpus')
        corpusname = form.getvalue('corpusname')        
        srclang = form.getvalue('srclang')
        trglang = form.getvalue('trglang')
        format = "tmx"
        
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
        self.wfile.write(bytes(replyhtml, 'utf-8'))
        

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
        else:
            return SimpleHTTPRequestHandler.do_GET(self)
        


                    
if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)