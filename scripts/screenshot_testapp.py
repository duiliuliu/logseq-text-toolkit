from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 900})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/workspace/screenshots/testapp.png', full_page=True)
    browser.close()
