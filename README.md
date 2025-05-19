# 🚀 Hexo 博客使用与部署说明（适用于本博客项目）

本指南适用于你的 Hexo 博客（如 `chong-zzxy.github.io`），用于快速掌握：

- 如何本地修改博客内容
- 如何部署更新到 GitHub Pages
- 如何在新设备上克隆并使用博客项目

---

## 📁 本地项目结构

```bash
📂 chongblog/              # Hexo 源项目目录
├── _config.yml            # Hexo 全局配置文件
├── themes/                # 博客主题（如 trm）
├── source/                # 页面、文章、简历等内容
├── public/                # Hexo 生成的静态文件（部署前自动生成）
└── ...
```

---

## ✍️ 如何更新博客内容

1. 进入 Hexo 项目目录：
```bash
cd C:/DATA/Chongblog
```

2. 编辑内容：
   - 修改文章：`source/_posts/*.md`
   - 修改页面：`source/resume/index.html` 等

3. 生成静态页面：
```bash
hexo clean    # 清理旧文件（建议）
hexo g        # 重新生成静态页面
```

4. 部署到 GitHub Pages：
```bash
hexo d        # 将 public 文件夹推送到 GitHub 仓库
```

部署成功后，可通过如下链接访问：
```
https://chong-zzxy.github.io/
```

---

## 💡 如何在新电脑或重装系统后使用博客

### ① 克隆仓库（Hexo 源码）
```bash
git clone git@github.com:chong-zzxy/chong-zzxy.github.io.git chongblog
cd chongblog
```

### ② 安装依赖
```bash
npm install
```

### ③ 开始使用
```bash
hexo clean
hexo g
hexo s    # 启动本地预览：http://localhost:4000
```

> 🔐 如果使用 SSH 方式部署，请确保 `.ssh/id_rsa` 存在，并已绑定 GitHub。

---

## ⚙️ GitHub Pages 配置（在 `_config.yml`）

确保 `deploy` 段配置如下：

```yaml
deploy:
  type: git
  repo: git@github.com:chong-zzxy/chong-zzxy.github.io.git
  branch: main
```

安装部署插件（首次部署时）：
```bash
npm install hexo-deployer-git --save
```

---

## ✅ 常用命令速查表

| 功能       | 命令                       |
|------------|----------------------------|
| 本地预览   | `hexo s`                   |
| 清理缓存   | `hexo clean`               |
| 生成静态页 | `hexo g`                   |
| 发布博客   | `hexo d`                   |
| 初始化博客 | `hexo init blog && cd blog && npm install` |

---

## 🧙‍♂️ 友情提醒

- `source/` 是你写内容的地方（不要动 `public/`）
- `public/` 是自动生成的静态文件（用于部署）
- 所有页面编辑完后必须重新执行 `hexo g && hexo d`

如需部署失败排查，使用：
```bash
hexo d --debug
```

---

📝 本说明文件适用于 Hexo v7 + GitHub Pages + SSH 部署。
