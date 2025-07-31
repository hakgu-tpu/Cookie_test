#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 HTTP 서버가 http://localhost:{PORT} 에서 실행 중입니다.")
        print("📁 cookie_test.html 파일에 접근하려면: http://localhost:3000/cookie_test.html")
        print("🛑 서버를 중지하려면 Ctrl+C를 누르세요.")
        httpd.serve_forever()