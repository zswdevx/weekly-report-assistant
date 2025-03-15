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

export const getApiKey = async (): Promise<string> => {
  try {
    const result = await select<DB.Settings>('SELECT api_key FROM settings LIMIT 1')
    return result[0]?.api_key || ''
  } catch (error) {
    return ''
  }
}

export const setApiKey = async (value: string): Promise<boolean> => {
  try {
    const res = await executeQuery('UPDATE settings SET api_key = ?', [value])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}

export const getAuthors = async (): Promise<string[]> => {
  try {
    const result = await select<DB.Settings>('SELECT authors FROM settings LIMIT 1')
    return result[0]?.authors ? result[0].authors.split(',') : []
  } catch (error) {
    return []
  }
}

export const setAuthors = async (authors: string[]): Promise<boolean> => {
  try {
    const res = await executeQuery('UPDATE settings SET authors = ?', [authors.join(',')])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}
