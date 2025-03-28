import * as fs from 'fs';
import * as path from 'path';

// 根据环境变量选择配置文件
function parseEnv() {
  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  // const isProd = process.env.NODE_ENV === 'production';
  // const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;
  // return { path: filePath };

  console.log(localEnv);

  return {
    path: localEnv,
  };
}
export default parseEnv();
