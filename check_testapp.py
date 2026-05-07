from playwright.sync_api import sync_playwright
import sys

def check_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=['--auto-open-devtools-for-tabs'])
        page = browser.new_page()
        
        console_errors = []
        
        def handle_console(msg):
            print(f"[Console {msg.type}]: {msg.text}")
            if msg.type == 'error':
                console_errors.append(msg.text)
        
        page.on('console', handle_console)
        
        def handle_page_error(error):
            print(f"[Page Error]: {error}")
            console_errors.append(str(error))
        
        page.on('pageerror', handle_page_error)
        
        try:
            print("正在访问 http://localhost:3001/ ...")
            page.goto('http://localhost:3001/', wait_until='networkidle', timeout=30000)
            
            print("等待页面加载...")
            page.wait_for_timeout(3000)
            
            print("正在截图...")
            page.screenshot(path='/tmp/testapp.png', full_page=True)
            print("✓ 截图已保存到 /tmp/testapp.png")
            
            title = page.title()
            print(f"页面标题: {title}")
            
            content = page.content()
            print(f"页面 HTML 长度: {len(content)} 字符")
            
            # 检查 #root
            try:
                root = page.locator('#root')
                if root.count() > 0:
                    print("✓ 找到 #root 元素")
                    root_html = root.inner_html()
                    print(f"  #root 内容长度: {len(root_html)} 字符")
                    if len(root_html) > 100:
                        print(f"  #root 前200字符: {root_html[:200]}")
                else:
                    print("✗ 未找到 #root 元素")
            except Exception as e:
                print(f"✗ 查找 #root 时出错: {e}")
            
            # 检查页面是否有明显错误
            if 'error' in page.content().lower() and 'object' in page.content().lower():
                print("⚠ 警告: 页面可能包含 React 错误")
            
            # 输出所有错误
            if console_errors:
                print(f"\n发现 {len(console_errors)} 个控制台错误:")
                for i, err in enumerate(console_errors[:5], 1):
                    print(f"  {i}. {err[:200]}")
                sys.exit(1)
            else:
                print("\n✓ 未发现控制台错误")
            
        except Exception as e:
            print(f"✗ 访问页面时出错: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        
        print("\n按 Enter 键关闭浏览器...")
        input()
        browser.close()

if __name__ == '__main__':
    check_page()
