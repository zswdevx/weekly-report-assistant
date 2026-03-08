# 周报助手 (Weekly Report Assistant)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.3.0-green.svg)

一款基于 Tauri + React 开发的桌面应用程序，帮助开发团队自动生成高质量周报。通过解析 Git 提交记录，快速生成个人或团队周报内容。

![应用预览](public/logo.svg)

## 功能特点

- ✨ 自动提取 Git 提交记录并生成周报
- 📅 按日期范围和作者筛选提交记录
- 📝 支持周报内容美化和优化
- 💾 本地存储周报历史记录
- 🔍 多项目管理，统一生成周报
- 📋 一键复制功能，轻松分享

## 技术栈

- 前端: React + TypeScript + Ant Design + TailwindCSS
- 后端: Rust + Tauri
- 数据存储: SQLite

## 安装与使用

### 下载

从 [Releases](https://github.com/zswdevx/weekly-report-assistant/releases) 页面下载最新版本的安装包。

### 本地开发

1. 克隆仓库

```bash
git clone https://github.com/zswdevx/weekly-report-assistant.git
cd weekly-report-assistant
```

2. 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装 Rust 依赖 (自动完成)
```

3. 启动开发环境

```bash
# 启动开发服务器
pnpm tarui:dev
```

4. 构建应用

```bash
# 构建生产版本
pnpm tarui:build
```

## 使用说明

1. **项目配置**：添加需要监控的 Git 项目路径
2. **设置作者**：配置团队成员信息，用于过滤提交记录
3. **生成周报**：选择日期范围，点击生成按钮获取周报内容
4. **自动保存/复制**：系统自动保存周报到本地，可直接复制到剪贴板

## 配置项

- **作者配置**：添加团队成员姓名，用于过滤 Git 提交记录
- **API 密钥**：可选配置，用于使用 AI 服务优化周报内容
- **项目管理**：添加或移除需要监控的 Git 项目

## 发布与自动更新

### 触发发布

工作流定义在 [.github/workflows/release.yml](.github/workflows/release.yml)，仅在推送版本标签时触发：

1. 更新版本号，保持 `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 一致。
2. 提交代码后创建并推送标签，例如 `v0.3.1`：

```bash
git tag v0.3.1
git push origin main --follow-tags
```

3. GitHub Actions 会执行以下流程：
   - 校验 tag 与项目版本是否一致
   - 构建 Windows 安装包和 updater artifacts
   - 自动创建 GitHub Release
   - 上传安装包、签名文件以及 `latest.json`
4. 客户端会从 `https://github.com/zswdevx/weekly-report-assistant/releases/latest/download/latest.json` 检查更新。

### 自动更新密钥与配置

1. 生成更新签名密钥（会输出公钥，并在本地生成私钥文件）：

```bash
pnpm tauri signer generate --password <你的密码> --write-keys weekly-report-assistant.key
```

2. 将生成的 **公钥内容** 填入 [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) 的 `plugins.updater.pubkey`。
3. 将 **私钥文件内容** 和密码写入 GitHub Secrets：
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
4. 不要提交私钥文件；当前 `.gitignore` 已忽略默认私钥文件名。
5. 发布后，客户端会从 GitHub Release 的 `latest.json` 自动检查更新。

### 版本发布建议

- 本地改版本可继续使用 `pnpm version`
- 发布前先执行 `pnpm test` 和 `pnpm tarui:build`
- 只有当 tag 名与三个版本文件完全一致时，GitHub Actions 才会继续发布

## 数据库结构

应用使用 SQLite 数据库存储以下信息：

- 周报历史记录
- 项目配置
- 用户设置

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 来改进项目。

## 许可证

本项目使用 [MIT 许可证](LICENSE)。
