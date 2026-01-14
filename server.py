import http.server
import socketserver
import os
import mimetypes

PORT = 8080 # 如果冲突请改端口

class PPTRequestHandler(http.server.SimpleHTTPRequestHandler):
    # 自动识别 .js, .css, .svg 等类型
    def guess_type(self, path):
        return mimetypes.guess_type(path)[0] or 'application/octet-stream'

    def do_POST(self):
        # 处理保存请求
        if self.path.startswith('/pages/'):
            try:
                # 获取相对路径
                file_path = self.path.strip('/')
                
                # 简单安全检查，防止目录遍历
                if '..' in file_path:
                    raise ValueError("Invalid path")

                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # 写入文件
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

# 允许地址重用
socketserver.TCPServer.allow_reuse_address = True

print(f"Server running at http://localhost:{PORT}/main.html")
print(f"Ensure 'mothers' folder and 'pages' folder exist.")

try:
    with socketserver.TCPServer(("", PORT), PPTRequestHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")