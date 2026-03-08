import { useEffect, useRef } from 'react'
import { Modal, Progress, Space, Typography, message, notification } from 'antd'
import { getAutoCheckUpdate } from '@/services/settings'
import { checkForAppUpdate, getUpdateDescription, installAppUpdate, isInstallingAppUpdate } from '@/services/updater'
import type { Update } from '@tauri-apps/plugin-updater'

const notificationKey = 'app-update-progress'

function UpdateDescription({ update }: { update: Update }) {
  return (
    <Typography.Paragraph className="mb-0 whitespace-pre-line">
      {getUpdateDescription(update)}
    </Typography.Paragraph>
  )
}

async function confirmAndInstallUpdate(update: Update, autoTriggered: boolean) {
  const confirmed = await new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: autoTriggered ? '发现新版本' : '检测到新版本',
      width: 560,
      content: <UpdateDescription update={update} />,
      okText: '立即更新',
      cancelText: autoTriggered ? '稍后再说' : '取消',
      onOk: async () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      },
    })
  })

  if (!confirmed) {
    return
  }

  let totalBytes = 0
  let downloadedBytes = 0

  notification.open({
    key: notificationKey,
    message: '正在下载更新',
    description: (
      <Space direction="vertical" size={8} className="w-full">
        <Typography.Text>准备下载 v{update.version}</Typography.Text>
        <Progress percent={0} size="small" />
      </Space>
    ),
    duration: 0,
    placement: 'bottomRight',
  })

  try {
    await installAppUpdate(update, (event) => {
      if (event.event === 'Started') {
        totalBytes = event.data.contentLength ?? 0
        downloadedBytes = 0
      }

      if (event.event === 'Progress') {
        downloadedBytes += event.data.chunkLength
      }

      const percent = totalBytes > 0 ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)) : undefined

      notification.open({
        key: notificationKey,
        message: '正在下载更新',
        description: (
          <Space direction="vertical" size={8} className="w-full">
            <Typography.Text>
              已下载 {downloadedBytes} / {totalBytes || '未知'} 字节
            </Typography.Text>
            <Progress percent={percent} size="small" status="active" />
          </Space>
        ),
        duration: 0,
        placement: 'bottomRight',
      })
    })
  } catch (error) {
    notification.destroy(notificationKey)
    message.error(error instanceof Error ? error.message : '更新失败，请稍后重试')
    return
  }

  notification.open({
    key: notificationKey,
    message: '更新已安装',
    description: '应用即将重启。如果没有自动重启，请手动重新打开应用。',
    duration: 6,
    placement: 'bottomRight',
  })
}

const UpdateManager = () => {
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) {
      return
    }

    checkedRef.current = true

    void (async () => {
      const autoCheckUpdate = await getAutoCheckUpdate()
      if (!autoCheckUpdate || isInstallingAppUpdate()) {
        return
      }

      try {
        const update = await checkForAppUpdate()
        if (update) {
          await confirmAndInstallUpdate(update, true)
        }
      } catch (error) {
        console.error('Auto update check failed', error)
      }
    })()
  }, [])

  return null
}

export async function runManualUpdateCheck() {
  if (isInstallingAppUpdate()) {
    message.info('更新正在安装中，请稍后再试')
    return
  }

  try {
    const update = await checkForAppUpdate()
    if (!update) {
      message.success('当前已经是最新版本')
      return
    }

    await confirmAndInstallUpdate(update, false)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '检查更新失败，请稍后重试')
  }
}

export default UpdateManager
