import { Button, Card, Flex, Form, Input, Space, Tabs, message, Modal } from 'antd'
import { useState, useEffect } from 'react'
import AuthorTag from '@/components/AuthorTag'
import {
  getApiKey,
  setApiKey,
  getReportPrompt,
  setReportPrompt,
  getUserPrompt,
  setUserPrompt,
} from '@/services/settings'
import useAuthor from '@/hooks/useAuthor'
import { useUpdater } from '@/hooks/useUpdater'
import { SyncOutlined, CloudDownloadOutlined } from '@ant-design/icons'

const Settings = () => {
  const { authors, handleAddAuthor, handleDeleteAuthor } = useAuthor()
  const { updateStatus, checkForUpdates, downloadAndInstall } = useUpdater()
  const [apiKey, setApiKeyState] = useState('')
  const [systemPrompt, setSystemPromptState] = useState('')
  const [userPrompt, setUserPromptState] = useState('')

  useEffect(() => {
    getApiKey().then((key) => setApiKeyState(key || ''))
    getReportPrompt().then((prompt) => setSystemPromptState(prompt || ''))
    getUserPrompt().then((prompt) => setUserPromptState(prompt || ''))
  }, [])

  const handleSaveApiKey = async (value: string) => {
    await setApiKey(value)
    message.success('API密钥保存成功')
  }

  const handleSaveSystemPrompt = async (value: string) => {
    await setReportPrompt(value)
    message.success('系统提示词保存成功')
  }

  const handleSaveUserPrompt = async (value: string) => {
    await setUserPrompt(value)
    message.success('用户提示词保存成功')
  }

  const handleCheckUpdate = async () => {
    const update = await checkForUpdates(false)

    if (update) {
      Modal.confirm({
        title: '发现新版本',
        content: `当前版本: ${update.currentVersion}\n最新版本: ${update.version}\n\n是否立即下载并安装？`,
        onOk: async () => {
          await downloadAndInstall()
        },
      })
    }
  }

  return (
    <>
      <Flex vertical gap={12}>
        <Card title="配置设置">
          <Form.Item className="mb-8" label="Authors">
            <AuthorTag value={authors} onAdd={handleAddAuthor} onDel={handleDeleteAuthor} />
          </Form.Item>
          <Form.Item className="mb-8" label="DeepSeek API Key">
            <Space.Compact>
              <Input.Password style={{ width: 300 }} value={apiKey} onChange={(e) => setApiKeyState(e.target.value)} />
              <Button type="primary" onClick={() => handleSaveApiKey(apiKey)}>
                保存
              </Button>
            </Space.Compact>
          </Form.Item>

          <Tabs
            defaultActiveKey="system"
            size="small"
            items={[
              {
                key: 'system',
                label: '系统提示词',
                children: (
                  <>
                    <Input.TextArea
                      rows={4}
                      value={systemPrompt}
                      onChange={(e) => setSystemPromptState(e.target.value)}
                      style={{ marginBottom: 8 }}
                      placeholder="用于设置AI助手角色定位的系统提示词"
                    />
                    <Button type="primary" onClick={() => handleSaveSystemPrompt(systemPrompt)}>
                      保存
                    </Button>
                  </>
                ),
              },
              {
                key: 'user',
                label: '用户提示词',
                children: (
                  <>
                    <Input.TextArea
                      rows={6}
                      value={userPrompt}
                      onChange={(e) => setUserPromptState(e.target.value)}
                      style={{ marginBottom: 8 }}
                      placeholder="用于提供具体任务指令的用户提示词，Git提交记录将自动添加到此提示词之后"
                    />
                    <Button type="primary" onClick={() => handleSaveUserPrompt(userPrompt)}>
                      保存
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </Card>

        <Card title="应用更新">
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined spin={updateStatus.checking} />}
              onClick={handleCheckUpdate}
              loading={updateStatus.checking}
            >
              检查更新
            </Button>
            {updateStatus.available && (
              <Button
                type="default"
                icon={<CloudDownloadOutlined />}
                onClick={downloadAndInstall}
                loading={updateStatus.downloading}
              >
                下载并安装 v{updateStatus.latestVersion}
              </Button>
            )}
          </Space>
          {updateStatus.error && <div style={{ marginTop: 8, color: '#ff4d4f' }}>错误: {updateStatus.error}</div>}
        </Card>
      </Flex>
    </>
  )
}

export default Settings
