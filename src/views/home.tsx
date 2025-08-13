import { useState, useEffect, useRef } from 'react'
import { Button, Card, DatePicker, Flex, Input, message, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { RangePickerProps } from 'antd/es/date-picker'
import { useRequest } from 'ahooks'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { getReportContent, polishReport } from '@/services/report'
import { saveOrUpdateWeeklyReport } from '@/services/weeklyReport'
import useAuthor from '@/hooks/useAuthor'
import { getApiKey } from '@/services/settings'

type DateRange = RangePickerProps['value']

const startOfWeek = dayjs().subtract(1, 'week').startOf('week')
const endOfWeek = dayjs().subtract(1, 'week').endOf('week')

const useDebounce = (fn: Function, delay: number) => {
  const timerRef = useRef<number | null>(null)

  return (...args: any[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      fn(...args)
      timerRef.current = null
    }, delay)
  }
}

const Home = () => {
  const [dateRange, setDateRange] = useState<DateRange>([startOfWeek, endOfWeek])
  const [report, setReport] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  const { authors } = useAuthor()

  const debouncedSave = useRef(
    useDebounce((title: string, content: string) => {
      if (title && content && content.trim() !== '') {
        saveReportToDb(title, content)
      }
    }, 1500)
  ).current

  useEffect(() => {
    const newTitle = `周报 ${dateStrings ? dateStrings[0] : ''} - ${dateStrings ? dateStrings[1] : ''}`
    setCurrentTitle(newTitle)
  }, [dateRange])

  useEffect(() => {
    if (report && report.trim() !== '' && currentTitle) {
      debouncedSave(currentTitle, report)
    }
  }, [report, debouncedSave])
  const { data: apiKey } = useRequest(getApiKey)
  const { run: runGetReport, loading: getReportLoading } = useRequest(getReportContent, {
    manual: true,
    onSuccess(res) {
      if (res.success) {
        const str = res.data.map((v) => `【${v.name}】\n${v.content.join('\n')}\n`).join('\n')
        setReport(str)

        if (str && str.trim() !== '') {
          saveReportToDb(currentTitle, str)
        }
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

        if (res.data && res.data.trim() !== '') {
          saveReportToDb(currentTitle, res.data)
        }
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

  const saveReportToDb = async (title: string, content: string) => {
    try {
      if (!content || content.trim() === '') {
        return
      }

      await saveOrUpdateWeeklyReport(title, content)
      message.success('周报已自动保存')
    } catch (error) {
      message.error('自动保存失败')
      console.error(error)
    }
  }

  const aiPolishAction = (
    <Button type="primary" danger onClick={handlePolish} loading={polishLoading} disabled={!report || !apiKey}>
      AI 润色
    </Button>
  )
  return (
    <>
      <Flex vertical gap={12}>
        <Card>
          <Flex gap={12} wrap="wrap" align="center">
            <DatePicker.RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
            <Button type="primary" onClick={handleGenerate} loading={getReportLoading}>
              生成周报
            </Button>
            {apiKey ? aiPolishAction : <Tooltip title="请先配置API密钥">{aiPolishAction}</Tooltip>}
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
