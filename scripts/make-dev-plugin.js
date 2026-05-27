/**
 * 创��开发版本插件，避免与线上版本冲突
 * 
 * 工作原理：
 * 1. 修改 dist/package.json 中的 id 添加 "-dev" 后缀
 * 2. 修改 title 添加 "(Dev)" 前缀
 * 3. 创建 dev/ 目录并复制修改后的 package.json
 * 4. 符号链接 dist/ 和 icon.png
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const DEV_DIR = path.join(__dirname, '..', 'dev');
const PACKAGE_JSON_PATH = path.join(DIST_DIR, 'package.json');

function makeDevPlugin() {
  console.log('🔧 创建开发版本插件...\n');

  // 1. 检查 dist 目录是否存在
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist 目录不存在，请先运行 npm run build');
    process.exit(1);
  }

  // 2. 检查 package.json 是否存在
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error('❌ dist/package.json 不存在，请先运行 npm run build');
    process.exit(1);
  }

  // 3. 读取原始 package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  console.log(`📦 原始插件 ID: ${packageJson.logseq.id}`);
  console.log(`📝 原始插件标题: ${packageJson.logseq.title}`);

  // 4. 创建开发版本配置
  const devPackageJson = {
    ...packageJson,
    logseq: {
      ...packageJson.logseq,
      id: `${packageJson.logseq.id}-dev`,
      title: `(Dev) ${packageJson.logseq.title}`
    }
  };

  console.log(`\n✨ 开发版本插件 ID: ${devPackageJson.logseq.id}`);
  console.log(`✨ 开发版本插件标题: ${devPackageJson.logseq.title}`);

  // 5. 创建 dev 目录
  if (!fs.existsSync(DEV_DIR)) {
    fs.mkdirSync(DEV_DIR, { recursive: true });
    console.log('\n📁 创建 dev/ 目录');
  }

  // 6. 写入开发版本的 package.json
  fs.writeFileSync(
    path.join(DEV_DIR, 'package.json'),
    JSON.stringify(devPackageJson, null, 2)
  );
  console.log('✅ 写入 dev/package.json');

  // 7. 创建符号链接
  const distLink = path.join(DEV_DIR, 'dist');
  const iconLink = path.join(DEV_DIR, 'icon.png');

  // 删除已存在的符号链接（如果是目录或文件）
  if (fs.existsSync(distLink)) {
    fs.rmSync(distLink, { recursive: true });
  }
  if (fs.existsSync(iconLink)) {
    fs.unlinkSync(iconLink);
  }

  // 创建符号链接
  try {
    fs.symlinkSync(path.join(__dirname, '..', 'dist'), distLink, 'junction');
    console.log('🔗 创建符号链接: dev/dist -> dist');
  } catch (err) {
    console.warn('⚠️ 创建 dist 符号链接失败:', err.message);
  }

  try {
    fs.symlinkSync(path.join(__dirname, '..', 'icon.png'), iconLink, 'file');
    console.log('🔗 创建符号链接: dev/icon.png -> icon.png');
  } catch (err) {
    console.warn('⚠️ 创建 icon.png 符号链接失败:', err.message);
  }

  console.log('\n🎉 开发版本插件创建成功！');
  console.log('\n📋 使用方法:');
  console.log('1. 在 Logseq 中打开: 设置 -> 插件 -> 加载本地插件');
  console.log('2. 选择项目根目录下的 dev/ 文件夹');
  console.log('3. 开发版本和线上版本可以同时运行！');
}

makeDevPlugin();
