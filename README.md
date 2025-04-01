# NestJS API 服务器

## 项目概述

这是一个基于NestJS构建的RESTful API服务，提供用户认证和帖子管理功能。

## 技术栈

- 框架: NestJS
- 数据库: TypeORM + MySQL/PostgreSQL
- 认证: JWT
- 缓存: Redis
- 邮件服务: Nodemailer

## 环境变量配置

创建.env文件并配置以下参数：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nest_demo

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 邮件服务配置
SMTP_HOST=smtp.example.com
SMTP_PORT=465
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password
```

## 部署指南

1. 安装依赖：
```bash
npm install
```

2. 数据库迁移：
```bash
npm run migration:run
```

3. 启动服务：
```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 开发环境搭建

1. 安装 Node.js v16+ 和 PostgreSQL
2. 克隆仓库：
```bash
git clone https://github.com/your-repo.git
```
3. 安装依赖：
```bash
npm install
```
4. 配置环境变量（参考上方环境变量配置）
5. 启动开发服务器：
```bash
npm run start:dev
```

## 生命周期钩子

| 钩子名称                 | 描述                          |
|--------------------------|-------------------------------|
| OnModuleInit             | 模块初始化时调用              |
| OnApplicationBootstrap   | 应用启动时调用                |
| OnModuleDestroy          | 模块销毁时调用                |
| BeforeApplicationShutdown | 应用关闭前调用                |
| OnApplicationShutdown    | 应用正式关闭时调用            |

## 文件上传示例

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg" \
  -F "type=post" \
  http://localhost:3000/api/upload/image
```

## 测试指南

运行单元测试：
```bash
npm run test
```

运行e2e测试：
```bash
npm run test:e2e
```

## API 接口文档

### 通用说明

- 所有API请求都需要在Header中添加`Content-Type: application/json`
- 认证接口返回的token需要在后续请求的Header中添加`Authorization: Bearer <token>`
- 错误码说明:
  - 200: 请求成功
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 禁止访问
  - 404: 资源不存在
  - 500: 服务器内部错误

### 认证模块 (auth)

#### 注册接口

- **URL**: `/auth/register`
- **方法**: POST
- **描述**: 用户注册（邮箱验证码）
- **请求参数**:

| 参数名   | 类型   | 必填 | 描述                      |
| -------- | ------ | ---- | ------------------------- |
| username | string | 是   | 用户名                    |
| password | string | 是   | 密码                      |
| phone    | string | 否   | 手机号                    |
| email    | string | 是   | 邮箱                      |
| avatar   | string | 否   | 头像URL                   |
| code     | string | 是   | 验证码                    |
| codeType | string | 否   | 验证码类型，默认为"email" |

- **返回示例**:

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱",
      "phone": "手机号",
      "avatar": "头像URL"
    }
  },
  "message": "注册成功"
}
```

#### 手机号注册接口

- **URL**: `/auth/register-by-phone`
- **方法**: POST
- **描述**: 用户通过手机号验证码注册
- **请求参数**:

| 参数名   | 类型   | 必填 | 描述    |
| -------- | ------ | ---- | ------- |
| username | string | 是   | 用户名  |
| password | string | 是   | 密码    |
| phone    | string | 是   | 手机号  |
| code     | string | 是   | 验证码  |
| email    | string | 否   | 邮箱    |
| avatar   | string | 否   | 头像URL |

- **返回示例**:

```json
{
  "message": "注册成功"
}
```

#### 登录接口

- **URL**: `/auth/login`

#### 手机验证码登录

- **URL**: `/auth/sms-login`
- **方法**: POST
- **请求参数**:

| 参数名 | 类型   | 必填 | 描述         |
|--------|--------|------|--------------|
| phone  | string | 是   | 注册手机号码 |
| code   | string | 是   | 6位验证码    |

- **返回示例**:
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "用户名"
    }
  },
  "message": "登录成功"
}
```
- **方法**: POST
- **描述**: 用户名密码登录
- **请求参数**:

| 参数名   | 类型   | 必填 | 描述   |
| -------- | ------ | ---- | ------ |
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

- **返回示例**:

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "用户名",
      "email": "邮箱",
      "phone": "手机号",
      "avatar": "头像URL"
    }
  },
  "message": "登录成功"
}
```

#### 邮箱验证码登录接口

- **URL**: `/auth/email-login`
- **方法**: POST
- **描述**: 邮箱验证码登录
- **请求参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| email  | string | 是   | 邮箱   |
| code   | string | 是   | 验证码 |

- **返回示例**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "登录成功"
}
```

#### 手机验证码登录接口

- **URL**: `/auth/phone-login`
- **方法**: POST
- **描述**: 手机验证码登录
- **请求参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| phone  | string | 是   | 手机号 |
| code   | string | 是   | 验证码 |

- **返回示例**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "登录成功"
}
```

#### 发送邮箱验证码

- **URL**: `/auth/send-email-code`
- **方法**: POST
- **描述**: 发送邮箱验证码
- **请求参数**:

| 参数名 | 类型   | 必填 | 描述 |
| ------ | ------ | ---- | ---- |
| email  | string | 是   | 邮箱 |

- **返回示例**:

```json
{
  "message": "验证码已发送，请查收邮件"
}
```

#### 发送短信验证码

- **URL**: `/auth/send-sms-code`
- **方法**: POST
- **描述**: 发送短信验证码
- **请求参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| phone  | string | 是   | 手机号 |

- **返回示例**:

```json
{
  "message": "验证码已发送，请注意查收短信"
}
```

### 帖子模块 (posts)

#### 获取帖子列表

- **URL**: `/posts`
- **方法**: GET
- **描述**: 获取帖子列表，支持分页和关键词搜索
- **请求参数**:

| 参数名  | 类型   | 必填 | 描述                       |
| ------- | ------ | ---- | -------------------------- |
| page    | number | 否   | 页码，默认为1              |
| limit   | number | 否   | 每页条数，默认为10         |
| keyword | string | 否   | 搜索关键词，匹配标题和内容 |

- **返回示例**:

```json
{
  "items": [
    {
      "id": 1,
      "title": "帖子标题",
      "content": "帖子内容",
      "author": "作者名称",
      "thumb_url": "封面图片URL",
      "create_time": "2023-01-01T00:00:00.000Z",
      "update_time": "2023-01-01T00:00:00.000Z",
      "user_id": 1,
      "user": {
        "id": 1,
        "username": "用户名",
        "avatar": "头像URL"
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### 获取帖子详情

- **URL**: `/posts/:id`
- **方法**: GET
- **描述**: 获取单个帖子详情
- **路径参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| id     | number | 是   | 帖子ID |

- **返回示例**:

```json
{
  "id": 1,
  "title": "帖子标题",
  "content": "帖子内容",
  "author": "作者名称",
  "thumb_url": "封面图片URL",
  "create_time": "2023-01-01T00:00:00.000Z",
  "update_time": "2023-01-01T00:00:00.000Z",
  "user_id": 1,
  "user": {
    "id": 1,
    "username": "用户名",
    "desc": "用户描述",
    "email": "邮箱",
    "phone": "手机号",
    "avatar": "头像URL"
  }
}
```

#### 添加帖子

- **请求参数**:

| 参数名     | 类型   | 必填 | 描述                     |
|------------|--------|------|--------------------------|
| title      | string | 是   | 帖子标题                 |
| content    | string | 是   | Markdown格式内容         |
| html_content | string | 否   | 自动生成的HTML内容       |

- **URL**: `/posts/add`
- **方法**: POST
- **描述**: 添加新帖子
- **请求头**:

| 参数名        | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| authorization | string | 是   | Bearer token认证 |

- **请求参数**:

| 参数名    | 类型   | 必填 | 描述        |
| --------- | ------ | ---- | ----------- |
| title     | string | 是   | 帖子标题    |
| content   | string | 是   | 帖子内容    |
| author    | string | 是   | 作者名称    |
| cover_url | string | 否   | 封面图片URL |

- **返回示例**:

```json
{
  "id": 1,
  "title": "帖子标题",
  "content": "帖子内容",
  "author": "作者名称",
  "thumb_url": "封面图片URL",
  "create_time": "2023-01-01T00:00:00.000Z",
  "update_time": "2023-01-01T00:00:00.000Z",
  "user_id": 1
}
```

#### 更新帖子

- **URL**: `/posts/:id`
- **方法**: PATCH
- **描述**: 更新帖子信息（仅帖子作者可操作）
- **请求头**:

| 参数名        | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| authorization | string | 是   | Bearer token认证 |

- **路径参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| id     | number | 是   | 帖子ID |

- **请求参数**:

| 参数名    | 类型   | 必填 | 描述        |
| --------- | ------ | ---- | ----------- |
| title     | string | 否   | 帖子标题    |
| content   | string | 否   | 帖子内容    |
| cover_url | string | 否   | 封面图片URL |

- **返回示例**:

```json
{
  "id": 1,
  "title": "更新后的标题",
  "content": "更新后的内容",
  "author": "作者名称",
  "thumb_url": "更新后的封面URL",
  "create_time": "2023-01-01T00:00:00.000Z",
  "update_time": "2023-01-02T00:00:00.000Z",
  "user_id": 1
}
```

#### 删除帖子

- **URL**: `/posts/:id`
- **方法**: DELETE
- **描述**: 删除帖子（仅帖子作者可操作）
- **请求头**:

| 参数名        | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| authorization | string | 是   | Bearer token认证 |

- **路径参数**:

| 参数名 | 类型   | 必填 | 描述   |
| ------ | ------ | ---- | ------ |
| id     | number | 是   | 帖子ID |

- **返回示例**:

```json
{
  "message": "删除成功"
}
```

## 手机验证码登录示例

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone": "+8613912345678", "code": "123456"}' \
  http://localhost:3000/api/auth/sms-login
```

## 富文本内容创建示例

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "## 标题\n**加粗文字**", "html_content": "<h2>标题</h2><strong>加粗文字</strong>"}' \
  http://localhost:3000/api/posts
```
