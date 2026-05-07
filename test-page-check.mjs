import { chromium } from 'playwright';

(async () => {
  console.log('正在启动浏览器...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--auto-open-devtools-for-tabs']
  });
  const page = await browser.newPage();
  
  console.log('正在访问 http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('等待页面加载...');
  await page.waitForTimeout(3000);
  
  console.log('正在截图...');
  await page.screenshot({ 
    path: '/tmp/testapp-check.png', 
    fullPage: true 
  });
  console.log('✓ 截图已保存到 /tmp/testapp-check.png');
  
  const title = await page.title();
  console.log(`页面标题: ${title}`);
  
  // 检查 #root
  const rootCount = await page.locator('#root').count();
  if (rootCount > 0) {
    const rootHTML = await page.locator('#root').innerHTML();
    console.log(`✓ 找到 #root 元素，内容长度: ${rootHTML.length} 字符`);
    
    if (rootHTML.length > 200) {
      console.log(`#root 前200字符: ${rootHTML.substring(0, 200)}`);
    } else if (rootHTML.length === 0) {
      console.log('⚠ #root 元素存在但内容为空 - 白屏!');
    } else {
      console.log(`#root 完整内容: ${rootHTML}`);
    }
  } else {
    console.log('✗ 未找到 #root 元素');
  }
  
  // 检查控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // 获取页面内容
  const content = await page.content();
  console.log(`页面 HTML 长度: ${content.length} 字符`);
  
  if (content.includes('Error') && content.includes('object')) {
    console.log('⚠ 警告: 页面可能包含 React 错误');
  }
  
  if (consoleErrors.length > 0) {
    console.log(`\n发现 ${consoleErrors.length} 个控制台错误:`);
    consoleErrors.slice(0, 5).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.substring(0, 200)}`);
    });
  } else {
    console.log('\n✓ 未发现控制台错误');
  }
  
  await browser.close();
  console.log('浏览器已关闭');
  
  process.exit(consoleErrors.length > 0 ? 1 : 0);
})();
