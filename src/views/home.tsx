import { useState } from 'react'
import { Button, Card, DatePicker, Flex, Input, message } from 'antd'
import dayjs from 'dayjs'
import { RangePickerProps } from 'antd/es/date-picker'
import { useRequest } from 'ahooks'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { getReportContent, polishReport } from '@/services/report'
import useAuthor from '@/hooks/useAuthor'

type DateRange = RangePickerProps['value']

const startOfWeek = dayjs().subtract(1, 'week').startOf('week')
const endOfWeek = dayjs().subtract(1, 'week').endOf('week')

const Home = () => {
  const [dateRange, setDateRange] = useState<DateRange>([startOfWeek, endOfWeek])
  const [report, setReport] = useState('')
  const { authors } = useAuthor()

  const { run: runGetReport, loading: getReportLoading } = useRequest(getReportContent, {
    manual: true,
    onSuccess(res) {
      if (res.success) {
        const str = res.data.map((v) => `【${v.name}】\n${v.content.join('\n')}\n`).join('\n')
        setReport(str)
      } else {
        message.error('获取周报内容失败')
      }
    },
  })

  const { run: runPolishReport, loading: polishLoading } = useRequest(polishReport, {
    manual: true,
    onSuccess(res) {
      if (res.success) {
        setReport(res.data)
      } else {
        message.error(res.message || '润色失败')
      }
    },
  })

  const dateStrings = dateRange?.map((date) => dayjs(date).format('YYYY-MM-DD'))

  const handleGenerate = async () => {
    if (!dateRange?.length) {
      message.error('日期必选')
      return
    }

    runGetReport({
      start: dateStrings![0],
      end: dateStrings![1],
      authors,
    })
  }

  const handlePolish = async () => {
    if (!report) {
      message.error('请先生成周报')
      return
    }

    runPolishReport(report)
  }

  const onCopy = async () => {
    try {
      await writeText(report)
      message.success('复制成功')
    } catch (error) {
      message.error('复制失败，请重试')
    }
  }

  return (
    <>
      <Flex vertical gap={12}>
        <Card>
          <Flex gap={12} wrap="wrap" align="center">
            <DatePicker.RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
            <Button type="primary" onClick={handleGenerate} loading={getReportLoading}>
              生成周报
            </Button>
            <Button type="primary" danger onClick={handlePolish} loading={polishLoading} disabled={!report}>
              AI 润色
            </Button>
            <Button onClick={onCopy} disabled={!report}>
              复制
            </Button>
          </Flex>
        </Card>
        <Card>
          <Input.TextArea value={report} allowClear onChange={(e) => setReport(e.target.value)} rows={16} />
        </Card>
      </Flex>
    </>
  )
}

export default Home
