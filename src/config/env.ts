import * as fs from 'fs';
import * as path from 'path';

// 根据环境变量选择配置文件
function parseEnv() {
  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');
  const testEnv = path.resolve('.env.test');

  // 检查环境变量
  const nodeEnv = process.env.NODE_ENV;

  // 根据环境选择配置文件
  let filePath;
  if (nodeEnv === 'production' && fs.existsSync(prodEnv)) {
    filePath = prodEnv;
  } else if (nodeEnv === 'test' && fs.existsSync(testEnv)) {
    filePath = testEnv;
  } else if (fs.existsSync(localEnv)) {
    filePath = localEnv;
  } else {
    throw new Error('缺少环境配置文件');
  }

  console.log(`使用配置文件: ${filePath}`);

  return {
    path: filePath,
  };
}
export default parseEnv();
