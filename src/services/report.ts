import { getAllProjectConfigs } from './projectConfig'
import { Command } from '@tauri-apps/plugin-shell'
import { notification } from 'antd'
import { getApiKey, getReportPrompt, getUserPrompt } from './settings'

async function getGitLogs(options: API.GetGitLogInput): Promise<API.GetGitLogsOutput[]> {
  const { projectPath, startDate, endDate, authors } = options

  try {
    // 构建基本命令
    const args = ['-C', projectPath, 'log', '--pretty=format:%H|%an|%ad|%s', '--date=iso']

    // 添加日期范围参数
    if (startDate || endDate) {
      args.push('--date-order')
      if (startDate) args.push(`--after=${startDate}`)
      if (endDate) args.push(`--before=${endDate}`)
    }

    // 添加作者过滤参数
    if (authors?.length) {
      authors.forEach((author) => {
        args.push(`--author=${author}`)
      })
    }

    // 执行命令
    const output = await Command.create('git', args).execute()

    if (output.stderr) {
      notification.error({
        message: '获取 Git 日志失败',
        description: output.stderr,
        duration: 5,
        key: output.code?.toString(),
        placement: 'top',
      })
      return []
    }

    // 解析输出
    const commits = output.stdout
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [hash, author, date, ...messageParts] = line.split('|')
        return {
          hash,
          author,
          message: messageParts.join('|'), // 处理提交信息中可能包含的 | 符号
          date,
        }
      })

    return commits
  } catch (error) {
    console.error(`Failed to get git logs: ${error}`)
    return []
  }
}

export async function getReportContent(params: API.GetReportContentInput): Promise<API.GetReportContentOutput> {
  try {
    const projects = await getAllProjectConfigs()

    const reportData: API.ReportData[] = []

    for (const project of projects) {
      const commits = await getGitLogs({
        projectPath: project.path,
        startDate: params.start,
        endDate: params.end,
        authors: params.authors,
      })

      if (commits.length > 0) {
        reportData.push({
          name: project.name,
          content: commits.map((commit) => `- ${commit.message}`),
        })
      }
    }

    return {
      success: true,
      data: reportData,
    }
  } catch (error) {
    console.error('获取周报内容失败:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const polishReport = async (content: string) => {
  try {
    const apiKey = await getApiKey()
    if (!apiKey) {
      return {
        success: false,
        message: '请先设置 API 密钥',
      }
    }

    const systemPrompt = await getReportPrompt()
    const userPromptTemplate = await getUserPrompt()

    // 将用户提示词模板与内容拼接
    const userPrompt = `${userPromptTemplate}

原始提交记录：
${content}`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        stream: false,
      }),
    })

    const data = await response.json()
    return {
      success: true,
      data: data.choices[0].message.content,
    }
  } catch (error) {
    return {
      success: false,
      message: '润色失败',
    }
  }
}
