import { Button, Card, Flex, Form, Input, Space, Tabs, message } from 'antd'
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

const Settings = () => {
  const { authors, handleAddAuthor, handleDeleteAuthor } = useAuthor()
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

  return (
    <>
      <Flex vertical gap={12}>
        <Card>
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
      </Flex>
    </>
  )
}

export default Settings
