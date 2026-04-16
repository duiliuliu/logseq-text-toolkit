from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    # 启动浏览器（无头模式）
    browser = p.chromium.launch(headless=False)  # 暂时使用非无头模式以便查看
    page = browser.new_page()
    
    # 导航到开发服务器
    page.goto('http://localhost:3006')
    
    # 等待页面加载
    page.wait_for_load_state('networkidle', timeout=10000)
    
    # 等待3秒确保所有内容都已加载
    time.sleep(3)
    
    # 捕获控制台日志
    print("=== Console Logs ===")
    def log_console(msg):
        print(f"[Console] {msg.text}")
    
    page.on('console', log_console)
    
    # 捕获错误日志
    print("=== Error Logs ===")
    def log_error(msg):
        if msg.type == 'error':
            print(f"[Error] {msg.text}")
    
    page.on('console', log_error)
    
    # 截图
    screenshot_path = '/workspace/screenshot.png'
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Screenshot saved to: {screenshot_path}")
    
    # 检查页面内容
    print("=== Page Content ===")
    content = page.content()
    print(content[:2000])  # 只打印前2000个字符
    
    # 检查是否有白屏相关的错误
    print("=== Checking for White Screen Issues ===")
    body = page.locator('body')
    body_text = body.inner_text()
    print(f"Body text length: {len(body_text)}")
    if len(body_text) < 100:
        print("WARNING: Body text is very short, likely a white screen issue")
    
    # 检查React错误
    error_elements = page.locator('div[data-testid="error"]').all()
    if error_elements:
        print("Found error elements:")
        for elem in error_elements:
            print(elem.inner_text())
    
    # 关闭浏览器
    browser.close()
    
    print("=== Test Complete ===")
