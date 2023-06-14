from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import sys
import os
import json

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_list(self):
        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.end_headers()
        # Send the html message
        self.wfile.write(bytes(json.dumps(os.listdir("yaml_dir"), ensure_ascii=False), 'utf-8'))
        #str(os.listdir("yaml_dir")))  
        return

    def do_GET(self):
        if self.path == '/list':
            self.do_list()
        else:
            self.send_response(200)
            self.send_header('Content-type', 'application/text')
            self.end_headers()
            with open("."+self.path, 'rb') as file: 
                self.wfile.write(file.read()) # Read the file and send the contents 


                    
if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)