# NestJS API 服务器

## 生命周期钩子

模块初始化：OnModuleInit
应用启动：OnApplicationBootstrap
模块销毁：OnModuleDestroy
应用关闭前：BeforeApplicationShutdown
应用正式关闭：OnApplicationShutdown

## API 接口文档

### 认证模块 (auth)

#### 注册接口

- **URL**: `/auth/register`
- **方法**: POST
- **描述**: 用户注册
- **请求参数**:

| 参数名   | 类型   | 必填 | 描述    |
| -------- | ------ | ---- | ------- |
| username | string | 是   | 用户名  |
| password | string | 是   | 密码    |
| phone    | number | 否   | 手机号  |
| email    | string | 否   | 邮箱    |
| avatar   | string | 否   | 头像URL |

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

#### 登录接口

- **URL**: `/auth/login`
- **方法**: POST
- **描述**: 用户登录
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
