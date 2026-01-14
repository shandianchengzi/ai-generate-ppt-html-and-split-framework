import http.server
import socketserver
import os
import mimetypes
import json # 新增

PORT = 8080

class PPTRequestHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        return mimetypes.guess_type(path)[0] or 'application/octet-stream'

    def do_GET(self):
        # 新增：资源列表 API
        if self.path == '/api/resources':
            try:
                # 获取 mothers 列表
                mothers = []
                if os.path.exists('mothers'):
                    mothers = [f for f in os.listdir('mothers') if f.endswith('.html')]
                
                # 获取 assets 列表 (支持常见图片格式)
                assets = []
                if os.path.exists('assets'):
                    extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')
                    assets = [f for f in os.listdir('assets') if f.lower().endswith(extensions)]

                response_data = {
                    "mothers": mothers,
                    "assets": assets
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            # 默认处理静态文件
            super().do_GET()

    def do_POST(self):
        # 处理保存请求
        if self.path.startswith('/pages/'):
            try:
                file_path = self.path.strip('/')
                if '..' in file_path: raise ValueError("Invalid path")

                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(post_data)
                
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Saved")
                print(f"Saved: {file_path}")
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
                print(f"Error: {e}")
        else:
            self.send_error(404)

socketserver.TCPServer.allow_reuse_address = True
print(f"Server running at http://localhost:{PORT}/main.html")

try:
    with socketserver.TCPServer(("", PORT), PPTRequestHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")