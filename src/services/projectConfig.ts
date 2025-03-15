import { executeQuery, select } from '../utils/db'

export async function createProjectConfig(
  config: Omit<API.ProjectConfig, 'id' | 'createTime' | 'updateTime'>
): Promise<boolean> {
  try {
    const res = await executeQuery('INSERT INTO project_configs (sort, name, path, branches) VALUES (?, ?, ?, ?)', [
      config.sort,
      config.name,
      config.path,
      config.branches.join(','),
    ])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}

export async function getProjectConfigs(parmas: API.GetProjectConfigsInput): Promise<API.GetProjectConfigsOutput> {
  const { name, page, pageSize } = parmas
  const whereClause = name ? 'WHERE name LIKE ?' : ''
  const params = name ? [`%${name}%`] : []

  const [totalResult] = await select<{ total: number }>(
    `SELECT COUNT(*) as total FROM project_configs ${whereClause}`,
    params
  )

  const offset = (page - 1) * pageSize
  const data = await select<DB.ProjectConfig>(
    `SELECT * FROM project_configs ${whereClause} 
     ORDER BY sort ASC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  )

  return {
    total: totalResult.total,
    list: data.map((item) => ({
      ...item,
      createTime: item.create_time,
      updateTime: item.update_time,
      branches: item.branches ? item.branches.split(',') : [],
    })),
  }
}

export async function getAllProjectConfigs(): Promise<API.ProjectConfig[]> {
  const data = await select<DB.ProjectConfig>('SELECT * FROM project_configs ORDER BY sort ASC')
  return data.map(({ create_time, update_time, ...item }) => ({
    ...item,
    createTime: create_time,
    updateTime: update_time,
    branches: item.branches ? item.branches.split(',') : [],
  }))
}

export async function updateProjectConfig(
  config: Partial<Omit<API.ProjectConfig, 'createTime' | 'updateTime'>>
): Promise<boolean> {
  try {
    const { id, ...resetConfig } = config
    const sets: string[] = []
    const values: any[] = []

    Object.entries(resetConfig).forEach(([key, value]) => {
      sets.push(`${key} = ?`)
      if (key === 'branches') {
        values.push((value as string[]).join(','))
      } else {
        values.push(value)
      }
    })

    values.push(id)
    const res = await executeQuery(
      `UPDATE project_configs SET ${sets.join(', ')}, update_time = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    )
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}

export async function deleteProjectConfig(id: number): Promise<boolean> {
  try {
    const res = await executeQuery('DELETE FROM project_configs WHERE id = ?', [id])
    return res.rowsAffected > 0
  } catch (error) {
    return false
  }
}
