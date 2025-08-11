#!/usr/bin/env node

/**
 * 版本更新脚本
 * 用法: npm run update-version <new-version>
 * 示例: npm run update-version 0.2.2
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
const flags = args.filter((arg) => arg.startsWith('-'))
const nonFlags = args.filter((arg) => !arg.startsWith('-'))
const newVersion = nonFlags[0]
const autoUpdate = flags.includes('--auto') || flags.includes('-a')
const skipCargoUpdate = flags.includes('--skip-cargo') || flags.includes('-s')

const versionRegex = /^\d+\.\d+\.\d+$/

if (!newVersion) {
  console.error('❌ 请提供新版本号')
  console.log('用法: npm run update-version <new-version> [options]')
  console.log('示例: npm run update-version 0.2.2')
  console.log('')
  console.log('选项:')
  console.log('  --auto, -a        自动运行 cargo update，不询问')
  console.log('  --skip-cargo, -s  跳过 cargo update')
  process.exit(1)
}

if (!versionRegex.test(newVersion)) {
  console.error('❌ 版本号格式错误，请使用 x.y.z 格式')
  process.exit(1)
}

const projectRoot = path.resolve(__dirname, '..')

// 需要更新版本的文件配置
const filesToUpdate = [
  {
    path: path.join(projectRoot, 'package.json'),
    update: (content) => {
      const packageJson = JSON.parse(content)
      packageJson.version = newVersion
      return JSON.stringify(packageJson, null, 2)
    },
    description: 'package.json',
  },
  {
    path: path.join(projectRoot, 'src-tauri', 'Cargo.toml'),
    update: (content) => {
      return content.replace(/(version\s*=\s*")([^"]+)(")/, `$1${newVersion}$3`)
    },
    description: 'Cargo.toml',
  },
  {
    path: path.join(projectRoot, 'src-tauri', 'tauri.conf.json'),
    update: (content) => {
      const config = JSON.parse(content)
      config.version = newVersion
      return JSON.stringify(config, null, 2)
    },
    description: 'tauri.conf.json',
  },
  {
    path: path.join(projectRoot, 'README.md'),
    update: (content) => {
      return content.replace(/(https:\/\/img\.shields\.io\/badge\/version-)([^-]+)(-green\.svg)/, `$1${newVersion}$3`)
    },
    description: 'README.md',
  },
]

console.log(`🚀 开始更新版本到 ${newVersion}...`)

for (const file of filesToUpdate) {
  if (!fs.existsSync(file.path)) {
    console.error(`❌ 文件不存在: ${file.path}`)
    process.exit(1)
  }
}

let updatedFiles = 0
for (const file of filesToUpdate) {
  try {
    console.log(`📝 更新 ${file.description}...`)

    const originalContent = fs.readFileSync(file.path, 'utf8')
    const updatedContent = file.update(originalContent)

    if (originalContent === updatedContent) {
      console.warn(`⚠️  ${file.description} 中未找到需要更新的版本号`)
    } else {
      fs.writeFileSync(file.path, updatedContent, 'utf8')
      console.log(`✅ ${file.description} 更新成功`)
      updatedFiles++
    }
  } catch (error) {
    console.error(`❌ 更新 ${file.description} 时出错:`, error.message)
    process.exit(1)
  }
}

console.log(`\n🎉 版本更新完成! 共更新了 ${updatedFiles} 个文件`)

if (skipCargoUpdate) {
  console.log('\n⏭️  跳过 Cargo.lock 更新')
  console.log(`\n🚀 版本 ${newVersion} 更新完成!`)
  console.log('💡 提示: 请检查更改并提交代码')
  process.exit(0)
}

console.log('\n📋 接下来的步骤:')
console.log('1. 运行以下命令更新 Cargo.lock:')
console.log('   cd src-tauri && cargo update')

if (autoUpdate) {
  console.log('\n🔄 自动更新 Cargo.lock...')
  try {
    execSync('cargo update', {
      cwd: path.join(projectRoot, 'src-tauri'),
      stdio: 'inherit',
    })
    console.log('✅ Cargo.lock 更新成功')
    console.log(`\n🚀 版本 ${newVersion} 更新完成!`)
    console.log('💡 提示: 请检查更改并提交代码')
  } catch (error) {
    console.error('❌ 更新 Cargo.lock 时出错:', error.message)
  }
  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('\n❓ 是否自动运行 "cargo update" 来更新 Cargo.lock? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🔄 正在更新 Cargo.lock...')
    try {
      execSync('cargo update', {
        cwd: path.join(projectRoot, 'src-tauri'),
        stdio: 'inherit',
      })
      console.log('✅ Cargo.lock 更新成功')
    } catch (error) {
      console.error('❌ 更新 Cargo.lock 时出错:', error.message)
    }
  }

  console.log(`\n🚀 版本 ${newVersion} 更新完成!`)
  console.log('💡 提示: 请检查更改并提交代码')

  rl.close()
})
