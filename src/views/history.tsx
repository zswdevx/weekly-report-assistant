import { useEffect, useState } from 'react'
import { Button, Card, Empty, List, Modal, Typography, message } from 'antd'
import { useRequest } from 'ahooks'
import { deleteWeeklyReport, getAllWeeklyReports } from '@/services/weeklyReport'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

const { Text } = Typography

const History = () => {
  const [reports, setReports] = useState<DB.WeeklyReport[]>([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentReport, setCurrentReport] = useState<DB.WeeklyReport | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const {
    data,
    loading,
    run: fetchReports,
  } = useRequest(getAllWeeklyReports, {
    onSuccess(data) {
      setReports(data)
    },
  })

  useEffect(() => {
    if (data) {
      setReports(data)
    }
  }, [data])

  const handleViewDetail = (report: DB.WeeklyReport) => {
    setCurrentReport(report)
    setDetailModalVisible(true)
  }

  const handleDeleteClick = (report: DB.WeeklyReport) => {
    setCurrentReport(report)
    setDeleteModalVisible(true)
  }

  const handleDelete = async () => {
    if (!currentReport) return

    try {
      setDeleteLoading(true)
      await deleteWeeklyReport(currentReport.id)
      message.success('删除成功')
      setDeleteModalVisible(false)
      fetchReports()
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCopyContent = async () => {
    if (currentReport?.content) {
      await writeText(currentReport.content)
      message.success('复制成功')
    }
  }

  return (
    <>
      <Card title="周报历史记录" loading={loading}>
        {reports.length === 0 ? (
          <Empty description="暂无周报记录" />
        ) : (
          <List
            dataSource={reports}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button key="view" type="link" onClick={() => handleViewDetail(item)}>
                    查看
                  </Button>,
                  <Button key="delete" type="link" danger onClick={() => handleDeleteClick(item)}>
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text>{item.title || '未命名周报'}</Text>}
                  description={<Text type="secondary">{item.created_time}</Text>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={currentReport?.title || '周报详情'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        centered
        width={700}
        footer={[
          <Button key="copy" type="primary" onClick={handleCopyContent}>
            复制内容
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div className="whitespace-pre-wrap overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {currentReport?.content}
        </div>
      </Modal>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleteLoading}
        onOk={handleDelete}
      >
        确定要删除"{currentReport?.title}"这条记录吗？
      </Modal>
    </>
  )
}

export default History
