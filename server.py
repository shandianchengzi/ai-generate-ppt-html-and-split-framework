import http.server
import socketserver
import os

# === 修改这里：将 8000 改为 8080 或 8888 ===
PORT = 8080 

class PPTRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # 简单的路由：处理 /pages/x.html 的保存请求
        if self.path.startswith('/pages/'):
            try:
                # 获取文件路径
                file_path = self.path.strip('/') # 去掉开头的 /
                
                # 获取数据长度
                content_length = int(self.headers['Content-Length'])
                # 读取 POST 数据 (HTML 内容)
                post_data = self.rfile.read(content_length)
                
                # 写入文件 (覆盖模式)
                # 确保目录存在
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, 'wb') as f:
                    f.write(post_data)
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"Saved Successfully")
                print(f"File saved: {file_path}")
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
                print(f"Error saving file: {e}")
        else:
            self.send_error(404, "Endpoint not found")

# 启动服务器
# 允许地址重用，减少报错概率
socketserver.TCPServer.allow_reuse_address = True

try:
    with socketserver.TCPServer(("", PORT), PPTRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"请在浏览器访问: http://localhost:{PORT}/main.html")
        httpd.serve_forever()
except OSError as e:
    print(f"错误: 端口 {PORT} 被占用。请修改 server.py 中的 PORT 变量为其他数字。")