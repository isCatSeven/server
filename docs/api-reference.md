# API 参考文档

## 错误处理规范

```json
{
  "statusCode": 400,
  "message": [
    {
      "property": "username",
      "constraints": {
        "isNotEmpty": "用户名不能为空",
        "maxLength": "用户名最长50个字符"
      }
    }
  ],
  "error": "Bad Request",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 接口详细说明

### 认证模块

#### 注册接口

**请求体校验规则**:
- username: 必填，4-50个字符
- password: 必填，6-20个字符，需包含字母和数字
- email: 可选，需符合RFC 5322标准
- phone: 可选，需符合E.164格式

#### 登录接口

**限流规则**:
- 同一IP 5分钟内最多尝试10次
- 失败5次后锁定账户30分钟

#### 手机验证码登录

**流程说明**:
1. 调用 `/auth/send-sms` 接口发送验证码（60秒内不可重复发送）
2. 验证码有效期为5分钟
3. 每日同一手机号最多接收10次验证码
4. 错误3次后需等待10分钟重试

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

### 帖子模块

#### 帖子排序规则
| 参数 | 说明 |
|------|------|
| create_time | 按创建时间排序（默认） |
| update_time | 按最后更新时间排序 |
| hot | 按热度排序（浏览量+评论数） |

#### 富文本字段参数
| 参数名     | 类型   | 必填 | 描述                     |
|------------|--------|------|--------------------------|
| content    | string | 是   | Markdown格式内容(支持GFM语法和数学公式) |
| html_content | string | 否   | 自动生成的HTML内容(经过XSS过滤) |
| toc        | array  | 否   | 自动生成的目录结构       |

## 文件上传接口

### 图片上传
- **请求头**:
  - Content-Type: multipart/form-data
  - Authorization: Bearer <token>

- **错误响应**:
```json
{
  "code": 413,
  "message": "文件大小超过5MB限制"
}
```
- **请求参数**:
| 参数名 | 类型   | 必填 | 描述         |
|--------|--------|------|--------------|
| file   | binary | 是   | 图片文件(PNG/JPEG) |
| type   | string | 是   | 图片类型（avatar/post） |

- **返回示例**:
```json
{
  "url": "https://cdn.example.com/upload/123.jpg",
  "size": 102400,
  "width": 800,
  "height": 600,
  "format": "JPEG",
  "hash": "a1b2c3d4e5"
}
```

**文件限制**:
- 最大尺寸: 5MB
- 支持格式: PNG/JPEG/WEBP
## 数据库迁移指南

1. 创建迁移文件：
```bash
npm run migration:generate src/migrations/InitSchema
```

2. 检查迁移状态：
```bash
npm run migration:show
```

3. 回滚最近迁移：
```bash
npm run migration:revert
```