import { useState, useEffect } from 'react'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { message } from 'antd'

export interface UpdateStatus {
  checking: boolean
  available: boolean
  downloading: boolean
  error: string | null
  currentVersion: string
  latestVersion: string
}

export const useUpdater = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    checking: false,
    available: false,
    downloading: false,
    error: null,
    currentVersion: '',
    latestVersion: '',
  })

  const checkForUpdates = async (silent = false) => {
    try {
      setUpdateStatus((prev) => ({ ...prev, checking: true, error: null }))

      if (!silent) {
        message.loading({ content: '正在检查更新...', key: 'updater' })
      }

      const update = await check()

      if (update) {
        setUpdateStatus((prev) => ({
          ...prev,
          checking: false,
          available: true,
          currentVersion: update.currentVersion,
          latestVersion: update.version,
        }))

        if (!silent) {
          message.destroy('updater')
        }

        return update
      } else {
        setUpdateStatus((prev) => ({
          ...prev,
          checking: false,
          available: false,
        }))

        if (!silent) {
          message.success({ content: '当前已是最新版本', key: 'updater' })
        }

        return null
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '检查更新失败'
      setUpdateStatus((prev) => ({
        ...prev,
        checking: false,
        error: errorMsg,
      }))

      if (!silent) {
        message.error({ content: errorMsg, key: 'updater' })
      }

      return null
    }
  }

  const downloadAndInstall = async () => {
    try {
      setUpdateStatus((prev) => ({ ...prev, downloading: true, error: null }))
      message.loading({ content: '正在下载更新...', key: 'updater', duration: 0 })

      const update = await check()

      if (!update) {
        message.info({ content: '没有可用更新', key: 'updater' })
        setUpdateStatus((prev) => ({ ...prev, downloading: false }))
        return
      }

      let downloaded = 0
      let contentLength = 0

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0
            message.loading({
              content: `开始下载... (0%)`,
              key: 'updater',
              duration: 0,
            })
            break
          case 'Progress':
            downloaded += event.data.chunkLength
            const percent = contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0
            message.loading({
              content: `正在下载... (${percent}%)`,
              key: 'updater',
              duration: 0,
            })
            break
          case 'Finished':
            message.success({ content: '下载完成，准备安装...', key: 'updater' })
            break
        }
      })

      message.success({ content: '更新安装成功，应用将重启', key: 'updater' })

      // 重启应用以应用更新
      setTimeout(() => {
        relaunch()
      }, 1000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '下载更新失败'
      setUpdateStatus((prev) => ({
        ...prev,
        downloading: false,
        error: errorMsg,
      }))
      message.error({ content: errorMsg, key: 'updater' })
    }
  }

  // 应用启动时自动检查更新（静默）
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return {
    updateStatus,
    checkForUpdates,
    downloadAndInstall,
  }
}
