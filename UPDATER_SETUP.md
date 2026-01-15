# Tauri 自动更新配置说明

## 配置步骤

### 1. 生成签名密钥对

在项目根目录运行以下命令生成签名密钥对：

```bash
pnpm tauri signer generate -w ~/.tauri/myapp.key
```

命令会生成：

- 私钥文件（需要保密）
- 公钥字符串（输出到控制台）

### 2. 配置 GitHub Secrets

在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中添加：

- **TAURI_SIGNING_PRIVATE_KEY**: 将生成的私钥文件内容复制粘贴到这里

### 3. 更新 tauri.conf.json

将 `src-tauri/tauri.conf.json` 中的配置更新为实际值：

```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY_HERE",
      "endpoints": ["https://github.com/YOUR_USERNAME/weekly-report-assistant/releases/latest/download/latest.json"]
    }
  }
}
```

- 将 `YOUR_PUBLIC_KEY_HERE` 替换为步骤1生成的公钥
- 将 `YOUR_USERNAME` 替换为你的 GitHub 用户名

### 4. 发布流程

1. 更新版本号：

   ```bash
   pnpm run update-version
   ```

2. 提交并推送代码到 main 分支

3. GitHub Actions 会自动：

   - 构建应用
   - 生成 `latest.json` 更新清单文件
   - 创建 Draft Release
   - 上传安装包和更新文件

4. 在 GitHub Releases 页面检查并发布 Release

### 5. 自动更新功能

应用会在以下情况检查更新：

- 应用启动后 3 秒（静默检查）
- 用户在设置页面点击"检查更新"按钮

发现更新后：

- 显示更新提示对话框
- 用户确认后下载并安装
- 安装完成后自动重启应用

## 文件说明

- `src/hooks/useUpdater.ts`: 更新逻辑 Hook
- `src/views/settings.tsx`: 设置页面，包含更新检查界面
- `.github/workflows/main.yml`: GitHub Actions 构建配置
- `src-tauri/tauri.conf.json`: Tauri 配置，包含更新器设置

## 注意事项

1. **首次发布**: 第一个版本不会触发自动更新（因为没有旧版本）
2. **版本号格式**: 使用语义化版本号（如 0.2.2）
3. **签名密钥**: 私钥必须严格保密，丢失后无法为旧版本提供更新
4. **测试**: 建议先发布 beta 版本测试更新功能

## 故障排查

如果更新功能不工作，检查：

1. `tauri.conf.json` 中的公钥是否正确
2. GitHub endpoint URL 是否正确（替换了 YOUR_USERNAME）
3. GitHub Secrets 中的 TAURI_SIGNING_PRIVATE_KEY 是否已配置
4. Release 是否已发布（不是 Draft 状态）
5. `latest.json` 文件是否存在于 Release 资源中
