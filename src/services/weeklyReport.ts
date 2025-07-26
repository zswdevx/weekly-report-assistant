import { executeQuery, select } from '../utils/db'

export async function createWeeklyReport(title: string, content: string): Promise<void> {
  await executeQuery('INSERT INTO weekly_reports (title, content) VALUES (?, ?)', [title, content])
}

export async function getWeeklyReportById(id: number): Promise<DB.WeeklyReport | null> {
  const reports = await select<DB.WeeklyReport>('SELECT * FROM weekly_reports WHERE id = ?', [id])
  return reports[0] || null
}

export async function getAllWeeklyReports(): Promise<DB.WeeklyReport[]> {
  return await select<DB.WeeklyReport>('SELECT * FROM weekly_reports ORDER BY created_time DESC')
}

export async function updateWeeklyReport(id: number, title: string, content: string): Promise<void> {
  await executeQuery('UPDATE weekly_reports SET title = ?, content = ? WHERE id = ?', [title, content, id])
}

export async function deleteWeeklyReport(id: number): Promise<void> {
  await executeQuery('DELETE FROM weekly_reports WHERE id = ?', [id])
}

export async function getWeeklyReportByTitle(title: string): Promise<DB.WeeklyReport | null> {
  const reports = await select<DB.WeeklyReport>('SELECT * FROM weekly_reports WHERE title = ?', [title])
  return reports[0] || null
}

export async function saveOrUpdateWeeklyReport(title: string, content: string): Promise<void> {
  // 查询是否已存在相同标题的周报
  const existingReport = await getWeeklyReportByTitle(title)

  if (existingReport) {
    // 如果存在，则更新内容
    await executeQuery('UPDATE weekly_reports SET content = ? WHERE title = ?', [content, title])
  } else {
    // 不存在则创建新的
    await executeQuery('INSERT INTO weekly_reports (title, content) VALUES (?, ?)', [title, content])
  }
}
