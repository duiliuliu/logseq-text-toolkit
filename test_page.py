from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/test-page.png', full_page=True)
    content = page.content()
    
    # Check for task progress demo section
    has_task_progress = 'task-progress-demo' in content
    has_block_renderer = 'block-renderer' in content
    has_block_list = 'task-child' in content
    
    print(f"Page loaded successfully!")
    print(f"Has task progress demo: {has_task_progress}")
    print(f"Has block renderer: {has_block_renderer}")
    print(f"Has block list: {has_block_list}")
    
    # Get visible text to verify content
    print("\n--- Page Content Preview ---")
    print(page.inner_text('body')[:500])
    
    browser.close()
