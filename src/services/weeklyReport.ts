import { executeQuery, select } from '../utils/db'

export async function createWeeklyReport(title: string, content: string): Promise<void> {
  await executeQuery('INSERT INTO weekly_reports (title, content) VALUES (?, ?)', [title, content])
}

export async function getWeeklyReportById(id: number): Promise<DB.WeeklyReport | null> {
  const reports = await select<DB.WeeklyReport>('SELECT * FROM weekly_reports WHERE id = ?', [id])
  return reports[0] || null
}

export async function getAllWeeklyReports(): Promise<DB.WeeklyReport[]> {
  return await select<DB.WeeklyReport>('SELECT * FROM weekly_reports ORDER BY created_at DESC')
}

export async function updateWeeklyReport(id: number, title: string, content: string): Promise<void> {
  await executeQuery('UPDATE weekly_reports SET title = ?, content = ? WHERE id = ?', [title, content, id])
}

export async function deleteWeeklyReport(id: number): Promise<void> {
  await executeQuery('DELETE FROM weekly_reports WHERE id = ?', [id])
}
