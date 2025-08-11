# 版本更新脚本

这个脚本用于自动更新项目中所有文件的版本号。

## 使用方法

### 基础用法

```bash
npm run update-version <新版本号>
```

### 快捷脚本

```bash
# 自动更新，不询问是否运行 cargo update
npm run update-version:auto <新版本号>

# 跳过 cargo update
npm run update-version:skip-cargo <新版本号>
```

### 示例

```bash
# 基础更新（会询问是否运行 cargo update）
npm run update-version 0.3.0

# 自动运行 cargo update
npm run update-version:auto 1.0.0

# 跳过 cargo update
npm run update-version:skip-cargo 0.2.5

# 使用参数（等同于上面的快捷脚本）
npm run update-version 0.3.0 --auto
npm run update-version 0.3.0 --skip-cargo
```

## 功能

脚本会自动更新以下文件中的版本号：

- `package.json` - Node.js 项目配置文件
- `src-tauri/Cargo.toml` - Rust 项目配置文件
- `src-tauri/tauri.conf.json` - Tauri 应用配置文件
- `README.md` - 项目说明文件中的版本徽章

## 版本号格式

版本号必须遵循语义化版本规范 (SemVer)，格式为：`主版本号.次版本号.修订号`

例如：`1.2.3`、`0.1.0`、`2.0.0`

## 命令行选项

- `--auto, -a`: 自动运行 cargo update，不询问用户
- `--skip-cargo, -s`: 跳过 cargo update

## 额外功能

- 脚本会提示是否自动运行 `cargo update` 来更新 Rust 依赖锁文件
- 所有更改都会有详细的日志输出
- 如果版本号格式错误或文件不存在，脚本会报错并退出
- 支持命令行参数控制行为

## 注意事项

1. 运行脚本前请确保所有更改都已提交到版本控制系统
2. 脚本执行后建议检查所有更改是否正确
3. 如果选择自动更新 Cargo.lock，请确保本地已安装 Rust 和 Cargo
4. 使用 `--auto` 参数时会自动运行 `cargo update`，可能需要一些时间
