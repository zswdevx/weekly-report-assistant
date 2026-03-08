#!/usr/bin/env node

/**
 * 版本更新脚本
 * 用法: npm run update-version
 * 脚本将通过交互式提问收集参数
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

// 读取当前版本
const packageJsonPath = path.join(projectRoot, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const currentVersion = packageJson.version

console.log(`🚀 当前版本: ${currentVersion}`)
console.log('开始版本更新...\n')

async function main() {
  const [major, minor, patch] = currentVersion.split('.').map(Number)

  // 提问版本类型
  const { versionType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'versionType',
      message: '请选择版本类型:',
      choices: [
        { name: `补丁版本 (patch) - ${currentVersion} -> ${major}.${minor}.${patch + 1}`, value: 'patch' },
        { name: `功能版本 (minor) - ${currentVersion} -> ${major}.${minor + 1}.0`, value: 'minor' },
        { name: `大版本 (major) - ${currentVersion} -> ${major + 1}.0.0`, value: 'major' },
        { name: '自定义版本 (custom)', value: 'custom' },
      ],
    },
  ])

  let newVersion

  switch (versionType) {
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'custom':
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: '请输入新版本号 (格式: x.y.z):',
          validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || '版本号格式错误，请使用 x.y.z 格式',
        },
      ])
      newVersion = customVersion
      break
  }

  console.log(`\n📋 新版本将更新为: ${newVersion}`)

  // 提问是否自动运行 cargo update
  const { autoUpdate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoUpdate',
      message: '是否自动运行 "cargo update" 来更新 Cargo.lock?',
      default: false,
    },
  ])

  let skipCargoUpdate = false
  if (!autoUpdate) {
    const { skip } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'skip',
        message: '是否跳过 Cargo.lock 更新?',
        default: false,
      },
    ])
    skipCargoUpdate = skip
  }

  processUpdate(newVersion, autoUpdate, skipCargoUpdate)
}

function processUpdate(newVersion, autoUpdate, skipCargoUpdate) {
  // 需要更新版本的文件配置
  const filesToUpdate = [
    {
      path: packageJsonPath,
      update: (content) => {
        const pkg = JSON.parse(content)
        pkg.version = newVersion
        return JSON.stringify(pkg, null, 2)
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

  console.log(`\n🚀 开始更新版本到 ${newVersion}...`)

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
    return
  }

  if (autoUpdate) {
    console.log('\n🔄 自动更新 Cargo.lock...')
    try {
      execSync('cargo update', {
        cwd: path.join(projectRoot, 'src-tauri'),
        stdio: 'inherit',
      })
      console.log('✅ Cargo.lock 更新成功')
    } catch (error) {
      console.error('❌ 更新 Cargo.lock 时出错:', error.message)
    }
  } else {
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
}

main().catch((error) => {
  console.error('❌ 脚本执行出错:', error.message)
  process.exit(1)
})
