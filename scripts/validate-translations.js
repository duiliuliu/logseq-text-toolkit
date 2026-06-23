const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '../src/translations');

const files = [
  { name: 'English', filename: 'en.json' },
  { name: 'Chinese', filename: 'zh-CN.json' },
  { name: 'Japanese', filename: 'ja.json' }
];

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function validateTranslations() {
  let allKeys = {};
  let maxKeyCount = 0;
  let referenceFile = null;

  console.log('📝 Validating translation files...\n');

  for (const file of files) {
    const filePath = path.join(translationsDir, file.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: ${file.name} file not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);
      const keys = getKeys(json);
      allKeys[file.name] = keys;

      console.log(`📄 ${file.name} (${file.filename}): ${keys.length} keys`);

      if (keys.length > maxKeyCount) {
        maxKeyCount = keys.length;
        referenceFile = file.name;
      }
    } catch (error) {
      console.error(`❌ Error parsing ${file.name} file: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`\n🔍 Using ${referenceFile} as reference (${maxKeyCount} keys)`);

  let hasError = false;

  for (const file of files) {
    const keys = allKeys[file.name];
    const referenceKeys = allKeys[referenceFile];

    const missingKeys = referenceKeys.filter(key => !keys.includes(key));
    const extraKeys = keys.filter(key => !referenceKeys.includes(key));

    if (missingKeys.length > 0) {
      console.log(`\n❌ ${file.name} is missing ${missingKeys.length} key(s):`);
      missingKeys.forEach(key => console.log(`   - ${key}`));
      hasError = true;
    }

    if (extraKeys.length > 0) {
      console.log(`\n⚠️ ${file.name} has ${extraKeys.length} extra key(s):`);
      extraKeys.forEach(key => console.log(`   - ${key}`));
    }

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`\n✅ ${file.name} is complete`);
    }
  }

  if (hasError) {
    console.log('\n❌ Translation validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All translation files are consistent!');
    process.exit(0);
  }
}

validateTranslations();