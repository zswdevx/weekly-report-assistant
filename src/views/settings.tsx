import { Button, Card, Flex, Form, Input, InputNumber, message, Modal, Popconfirm, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import AuthorTag from '@/components/AuthorTag'
import { useAntdTable } from 'ahooks'
import DynamicTag from '@/components/DynamicTag'
import { open } from '@tauri-apps/plugin-dialog'
import {
  createProjectConfig,
  deleteProjectConfig,
  getProjectConfigs,
  updateProjectConfig,
} from '@/services/projectConfig'
import { getApiKey, setApiKey } from '@/services/settings'
import useAuthor from '@/hooks/useAuthor'

type FormValues = Omit<API.ProjectConfig, 'createTime' | 'updateTime'>
const Settings = () => {
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const isEdit = !!Form.useWatch('id', form)
  const [modalOpen, setModalOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<API.ProjectConfig>()
  const { authors, handleAddAuthor, handleDeleteAuthor } = useAuthor()
  const {
    refresh: refreshList,
    tableProps,
    search: { submit },
  } = useAntdTable(
    ({ current, pageSize }, formData) => getProjectConfigs({ page: current, pageSize, name: formData.keyword }),
    {
      form: searchForm,
      defaultPageSize: 5,
    }
  )

  const [apiKey, setApiKeyState] = useState('')

  useEffect(() => {
    getApiKey().then((key) => setApiKeyState(key || ''))
  }, [])

  const handleSaveApiKey = async (value: string) => {
    await setApiKey(value)
    message.success('API密钥保存成功')
  }

  const onDelete = async (id: number) => {
    await deleteProjectConfig(id)
    refreshList()
  }

  const onCancel = () => {
    setModalOpen(false)
    setRecordToEdit(undefined)
  }

  const onFinish = async (values: FormValues) => {
    if (values.id) {
      await updateProjectConfig(values)
    } else {
      await createProjectConfig(values)
    }
    refreshList()
    onCancel()
  }

  const selectFolder = async () => {
    try {
      const folderPath = await open({
        directory: true,
        multiple: false,
      })
      form.setFieldValue('name', folderPath?.split('\\').at(-1))
      form.setFieldValue('path', folderPath)
    } catch (error) {
      message.error('Error selecting folder')
      console.error('Error selecting folder:', error)
    }
  }
  const columns: ColumnsType<API.ProjectConfig> = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 40,
    },
    {
      title: '项目',
      dataIndex: 'name',
      width: 120,
      render: (name, record) => (
        <span className="text-black font-semibold" title={record.path}>
          {name}
        </span>
      ),
    },
    {
      title: '分支',
      dataIndex: 'branches',
      width: 240,
      render: (v: string[]) => (
        <Flex gap={8} wrap>
          {v?.map((v) => (
            <Tag className="mr-0" color="blue" key={v}>
              {v}
            </Tag>
          ))}
        </Flex>
      ),
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (id: number, record) => (
        <Flex>
          <Button
            type="link"
            onClick={() => {
              setRecordToEdit(record)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => onDelete(id)}>
            <Button type="link">删除</Button>
          </Popconfirm>
        </Flex>
      ),
    },
  ]
  return (
    <>
      <Flex vertical gap={12}>
        <Card>
          <Form.Item className="mb-8" label="Authors">
            <AuthorTag value={authors} onAdd={handleAddAuthor} onDel={handleDeleteAuthor} />
          </Form.Item>
          <Form.Item className="mb-0" label="ApiKey">
            <Space.Compact>
              <Input.Password style={{ width: 300 }} value={apiKey} onChange={(e) => setApiKeyState(e.target.value)} />
              <Button type="primary" onClick={() => handleSaveApiKey(apiKey)}>
                保存
              </Button>
            </Space.Compact>
          </Form.Item>
        </Card>
        <Card>
          <Flex vertical gap={12}>
            <Flex justify="space-between">
              <Form form={searchForm} layout="inline" autoComplete="off">
                <Form.Item name="keyword">
                  <Input.Search allowClear onSearch={submit} placeholder="按项目名模糊搜索" />
                </Form.Item>
              </Form>
              <Button type="primary" onClick={() => setModalOpen(true)}>
                添加项目
              </Button>
            </Flex>
            <Table
              rowKey="id"
              columns={columns}
              {...tableProps}
              size="small"
              pagination={{
                ...tableProps.pagination,
                showTotal: (total) => `共 ${total} 条`,
                showSizeChanger: true,
              }}
            />
          </Flex>
        </Card>
      </Flex>

      <Modal title={isEdit ? '编辑' : '添加'} open={modalOpen} onCancel={onCancel} onOk={form.submit} destroyOnClose>
        <Form
          form={form}
          labelCol={{ span: 4 }}
          onFinish={onFinish}
          preserve={false}
          initialValues={{ sort: 0, branches: ['master'], ...recordToEdit }}
        >
          <Form.Item name="id" hidden>
            <Input disabled />
          </Form.Item>
          <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="项目路径" name="path" rules={[{ required: true }]}>
            <Input.Search enterButton="选择项目" onSearch={selectFolder} />
          </Form.Item>
          <Form.Item label="排序" name="sort" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label="分支" name="branches" extra="默认包含 origin/[branch]">
            <DynamicTag name="branches" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Settings
