import { isTauri } from '@tauri-apps/api/core'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, type DownloadEvent, type Update } from '@tauri-apps/plugin-updater'

let currentCheck: Promise<Update | null> | null = null
let installing = false

export async function checkForAppUpdate(): Promise<Update | null> {
  if (!isTauri()) {
    return null
  }

  if (currentCheck) {
    return currentCheck
  }

  currentCheck = check().finally(() => {
    currentCheck = null
  })

  return currentCheck
}

export function isInstallingAppUpdate() {
  return installing
}

export async function installAppUpdate(update: Update, onEvent?: (event: DownloadEvent) => void) {
  if (installing) {
    throw new Error('更新正在安装中，请稍后再试')
  }

  installing = true

  try {
    await update.downloadAndInstall(onEvent)
    await relaunch()
  } finally {
    installing = false
  }
}

export function formatUpdateDate(date?: string) {
  if (!date) {
    return '未知'
  }

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleString('zh-CN')
}

export function getUpdateDescription(update: Update) {
  const lines = [
    `当前版本: ${update.currentVersion}`,
    `最新版本: ${update.version}`,
    `发布时间: ${formatUpdateDate(update.date)}`,
  ]

  if (update.body?.trim()) {
    lines.push('', '更新说明：', update.body.trim())
  }

  return lines.join('\n')
}
