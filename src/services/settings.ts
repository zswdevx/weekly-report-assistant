import { defaultReportPrompt, weeklyReportTemplate } from '@/utils/constants'
import { executeQuery, select } from '@/utils/db'

export const getSettings = async (): Promise<API.Settings> => {
  try {
    const result = await select<DB.Settings>('SELECT * FROM settings')
    const settings = result[0] || {}
    return {
      authors: settings.authors?.split(',').filter(Boolean) || [],
      apiKey: settings.api_key || '',
    }
  } catch (error) {
    return { authors: [], apiKey: '' }
  }
}

export const setSettings = async (settings: API.Settings): Promise<boolean> => {
  try {
    const res = await executeQuery('UPDATE settings SET authors = ?, api_key = ?', [
      settings.authors.join(','),
      settings.apiKey,
    ])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}

export async function getApiKey(): Promise<string> {
  const result = await select<{ api_key: string }>('SELECT api_key FROM settings LIMIT 1')
  return result[0]?.api_key || ''
}

export async function setApiKey(apiKey: string): Promise<void> {
  await executeQuery('UPDATE settings SET api_key = ?', [apiKey])
}

export async function getReportPrompt(): Promise<string> {
  const result = await select<{ report_prompt: string }>('SELECT report_prompt FROM settings LIMIT 1')
  return result[0]?.report_prompt || defaultReportPrompt
}

export async function setReportPrompt(prompt: string): Promise<void> {
  await executeQuery('UPDATE settings SET report_prompt = ?', [prompt])
}

export async function getUserPrompt(): Promise<string> {
  const result = await select<{ user_prompt: string }>('SELECT user_prompt FROM settings LIMIT 1')
  return result[0]?.user_prompt || weeklyReportTemplate
}

export async function setUserPrompt(prompt: string): Promise<void> {
  await executeQuery('UPDATE settings SET user_prompt = ?', [prompt])
}

export async function getAuthors(): Promise<string[]> {
  const result = await select<{ authors: string }>('SELECT authors FROM settings LIMIT 1')
  return result[0]?.authors ? result[0].authors.split(',') : []
}

export const setAuthors = async (authors: string[]): Promise<boolean> => {
  try {
    const res = await executeQuery('UPDATE settings SET authors = ?', [authors.join(',')])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}
