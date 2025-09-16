# 神话风格移动质感网站（React + Express + PostgreSQL）

一个可在 Render 部署的全栈示例，包含：
- 后端：Node.js + Express.js + PostgreSQL
- 前端：React + Vite（移动端 App 质感，四大页面：**首页 / 回收 / 提现 / 我的**）
- 简单后台（/admin）可上传图片、配置首页六个按钮、回收页长图、头像库、四个“我的”页按钮、提现设置与记录生成等。

> ⚠️ Render 的无状态文件系统会在重启后清空，如需长期保存上传图片，请为服务挂载 **Persistent Disk**，或把图片传第三方对象存储（本项目也支持直接填图片 URL）。

## 本地运行

1. 安装 Node 18+ 与 PostgreSQL（创建数据库）。
2. 复制 `.env.example` 为 `.env` 并填写：

```
# 例子（请按需修改）
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mythic_app
JWT_SECRET=super_secret_jwt
ADMIN_ELEVATE_SECRET=make_me_admin_123
PORT=8080
ALLOWED_ORIGIN=http://localhost:5173
```

3. 初始化数据库：

```bash
cd server
npm install
npm run init-db
```

4. 构建前端并启动服务（Express 会托管打包后的前端）：

```bash
npm run build-client
npm start
```

5. 访问：`http://localhost:8080`（前端）  
   后台入口：`/admin`（需先注册账号，然后用后台“管理员提权”输入 `ADMIN_ELEVATE_SECRET` 一次性把自己设为管理员）

> 若想前后端分开开发：`cd client && npm install && npm run dev`（Vite 5173 端口），同时 `cd server && npm run dev`。dev 环境下已配置代理 `/api`。

## Render 部署要点

- 部署一个 **Web Service**（Node），Build Command：`cd server && npm install && npm run build-client`；Start Command：`node src/index.js`
- 环境变量：`DATABASE_URL`（Render PG 连接串）、`JWT_SECRET`、`ADMIN_ELEVATE_SECRET`、`PORT`（可不填，Render 会注入 `PORT`）、`ALLOWED_ORIGIN`（你的前端域名或 `*`）
- 如需文件持久化：给服务挂 **Persistent Disk** 并把 `server/uploads` 映射到磁盘。

## 默认功能概览

- **登录/注册**：仅用户名+ 密码（bcrypt 哈希），Cookie 中存 JWT（HttpOnly）。
- **首页**：六个可配置按钮（名称/图标/内容），背景与点绘图片可替换；点击按钮弹出小页面/文案。
- **回收页**：后台上传**长图**（宽度固定为 577px，高度自适应），前端可滑动查看。
- **提现页**：显示后台生成的提现记录（时间/金额/用户）；支持简单筛选；下方可绑定用户支付宝信息。
- **我的页**：四个自定义按钮（可配置文案/链接/弹窗）；头像由后台上传图库并供用户选择；未绑定支付宝则显示提示；展示随机生成的用户编号。
- **后台**：上传图片（返回 URL），维护首页、回收图、提现设置、头像库、记录生成等。

---

**重要提示**：该项目作为“可运行/可部署”的基础骨枷，已覆盖 API、数据库模型、图片上传、本地静态存储、基础 UI 与交互。你可直接二次开发以适配业务。
