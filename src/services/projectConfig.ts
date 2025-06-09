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
  const { name, page, pageSize, sortField, sortOrder } = parmas
  const whereClause = name ? 'WHERE name LIKE ?' : ''
  const params = name ? [`%${name}%`] : []

  const [totalResult] = await select<{ total: number }>(
    `SELECT COUNT(*) as total FROM project_configs ${whereClause}`,
    params
  )

  // 构建排序子句
  let orderClause = 'ORDER BY sort DESC' // 默认按 sort 字段降序
  if (sortField && sortOrder) {
    const direction = sortOrder === 'ascend' ? 'ASC' : 'DESC'
    orderClause = `ORDER BY ${sortField} ${direction}`
  }

  const offset = (page - 1) * pageSize
  const data = await select<DB.ProjectConfig>(
    `SELECT * FROM project_configs ${whereClause} 
     ${orderClause} LIMIT ? OFFSET ?`,
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
  const data = await select<DB.ProjectConfig>('SELECT * FROM project_configs ORDER BY sort DESC')
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

export async function batchCreateProjectConfigs(
  configs: Array<Omit<API.ProjectConfig, 'id' | 'createTime' | 'updateTime'>>
): Promise<boolean> {
  try {
    let success = true
    for (const config of configs) {
      const res = await executeQuery('INSERT INTO project_configs (sort, name, path, branches) VALUES (?, ?, ?, ?)', [
        config.sort || 0,
        config.name,
        config.path,
        (config.branches || ['master']).join(','),
      ])
      if (res.rowsAffected <= 0) {
        success = false
      }
    }
    return success
  } catch (error) {
    console.error('批量创建项目配置失败:', error)
    return false
  }
}

export async function batchUpdateProjectConfigs(
  configs: Array<Partial<Omit<API.ProjectConfig, 'createTime' | 'updateTime'>>>
): Promise<boolean> {
  try {
    let success = true
    for (const config of configs) {
      if (!config.id) {
        console.error('更新项目配置缺少ID:', config)
        success = false
        continue
      }

      const { id, ...resetConfig } = config
      const sets: string[] = []
      const values: any[] = []

      Object.entries(resetConfig).forEach(([key, value]) => {
        if (value !== undefined) {
          sets.push(`${key} = ?`)
          if (key === 'branches') {
            values.push((value as string[]).join(','))
          } else {
            values.push(value)
          }
        }
      })

      if (sets.length === 0) {
        continue
      }

      values.push(id)
      const res = await executeQuery(
        `UPDATE project_configs SET ${sets.join(', ')}, update_time = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      )

      if (res.rowsAffected <= 0) {
        success = false
      }
    }
    return success
  } catch (error) {
    console.error('批量更新项目配置失败:', error)
    return false
  }
}
