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
  batchCreateProjectConfigs,
  batchUpdateProjectConfigs,
} from '@/services/projectConfig'
import { getApiKey, setApiKey } from '@/services/settings'
import useAuthor from '@/hooks/useAuthor'
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'

type FormValues = Omit<API.ProjectConfig, 'createTime' | 'updateTime'>
const Settings = () => {
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const isEdit = !!Form.useWatch('id', form)
  const [modalOpen, setModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [batchMode, setBatchMode] = useState<'add' | 'update'>('add')
  const [recordToEdit, setRecordToEdit] = useState<API.ProjectConfig>()
  const [batchData, setBatchData] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<API.ProjectConfig[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
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

  const onBatchCancel = () => {
    setBatchModalOpen(false)
    setBatchData([])
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

  const onBatchFinish = async () => {
    try {
      const requiredFields = batchMode === 'update' ? ['id', 'name', 'path'] : ['name', 'path']
      const invalidRows = batchData.filter((row) => requiredFields.some((field) => !row[field]))

      if (invalidRows.length > 0) {
        message.error(`第 ${batchData.indexOf(invalidRows[0]) + 1} 行数据不完整，请检查必填项`)
        return
      }

      if (batchMode === 'add') {
        await batchCreateProjectConfigs(batchData)
        message.success('批量添加成功')
      } else {
        await batchUpdateProjectConfigs(batchData)
        message.success('批量更新成功')
      }

      refreshList()
      onBatchCancel()
    } catch (error) {
      message.error('处理失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  const addBatchRow = () => {
    setBatchData([...batchData, { branches: ['master'], sort: 0 }])
  }

  const deleteBatchRow = (index: number) => {
    const newData = [...batchData]
    newData.splice(index, 1)
    setBatchData(newData)
  }

  const updateBatchRow = (index: number, field: string, value: any) => {
    const newData = [...batchData]
    newData[index] = { ...newData[index], [field]: value }
    setBatchData(newData)
  }

  const openBatchModal = (mode: 'add' | 'update') => {
    setBatchMode(mode)

    if (mode === 'add') {
      setBatchData([{ branches: ['master'], sort: 0 }])
    }

    setBatchModalOpen(true)
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

  const selectFolderForBatch = async (index: number) => {
    try {
      const folderPath = await open({
        directory: true,
        multiple: false,
      })
      if (folderPath) {
        const projectName = folderPath.split('\\').at(-1) || ''
        const newData = [...batchData]
        newData[index] = {
          ...newData[index],
          name: projectName,
          path: folderPath,
        }
        setBatchData(newData)
      }
    } catch (error) {
      message.error('Error selecting folder')
      console.error('Error selecting folder:', error)
    }
  }

  const handleBatchEdit = () => {
    const editData = selectedRows.map((row) => ({
      id: row.id,
      name: row.name,
      path: row.path,
      sort: row.sort,
      branches: row.branches,
    }))

    setBatchData(editData)
    setBatchMode('update')
    setBatchModalOpen(true)
  }

  const columns: ColumnsType<API.ProjectConfig> = [
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      width: 60,
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

  const branchColumns: ColumnsType<any> = [
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <InputNumber
          min={0}
          controls={false}
          value={batchData[index]?.sort}
          onChange={(value) => updateBatchRow(index, 'sort', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_, __, index) => (
        <Input value={batchData[index]?.name} onChange={(e) => updateBatchRow(index, 'name', e.target.value)} />
      ),
    },
    {
      title: '项目路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (_, __, index) => (
        <Input.Search
          value={batchData[index]?.path}
          onChange={(e) => updateBatchRow(index, 'path', e.target.value)}
          enterButton="选择"
          onSearch={() => selectFolderForBatch(index)}
        />
      ),
    },
    {
      title: '分支',
      dataIndex: 'branches',
      key: 'branches',
      render: (_, __, index) => (
        <DynamicTag
          value={batchData[index]?.branches || ['master']}
          onChange={(value) => updateBatchRow(index, 'branches', value)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 20,
      render: (_, __, index) => (
        <Button
          danger
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => deleteBatchRow(index)}
          disabled={batchData.length <= 1}
        />
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[], selectedItems: API.ProjectConfig[]) => {
      setSelectedRowKeys(selectedKeys)
      setSelectedRows(selectedItems)
    },
  }

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
              <Flex gap={8}>
                <Button icon={<EditOutlined />} disabled={selectedRows.length === 0} onClick={handleBatchEdit}>
                  批量编辑
                </Button>
                <Button onClick={() => openBatchModal('add')}>批量添加</Button>
                <Button type="primary" onClick={() => setModalOpen(true)}>
                  添加项目
                </Button>
              </Flex>
            </Flex>
            <Table
              rowKey="id"
              columns={columns}
              rowSelection={rowSelection}
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

      <Modal
        title={batchMode === 'add' ? '批量添加项目' : '批量编辑项目'}
        open={batchModalOpen}
        onCancel={onBatchCancel}
        onOk={onBatchFinish}
        destroyOnClose
        width={900}
      >
        <Flex vertical gap={16}>
          <div>
            <p>{batchMode === 'add' ? '批量添加项目配置' : '批量编辑项目配置'}</p>
          </div>

          <Table
            dataSource={batchData}
            columns={branchColumns}
            pagination={false}
            size="small"
            bordered
            rowKey={(record, index) => (record?.id ? record.id.toString() : index?.toString())}
            scroll={{ x: 'max-content' }}
            footer={() => (
              <Button
                type="dashed"
                onClick={addBatchRow}
                block
                icon={<PlusOutlined />}
                disabled={batchMode === 'update'}
              >
                新增一行
              </Button>
            )}
          />
        </Flex>
      </Modal>
    </>
  )
}

export default Settings
