declare namespace API {
  interface ProjectConfig extends Omit<DB.ProjectConfig, 'create_time' | 'update_time'> {
    createTime: string
    updateTime: string
    branches: string[]
  }

  interface Settings {
    authors: string[]
    apiKey: string
  }

  type GetProjectConfigsOutput = {
    total: number
    list: ProjectConfig[]
  }

  type GetProjectConfigsInput = {
    name?: string
    page: number
    pageSize: number
    sortField?: string
    sortOrder?: 'ascend' | 'descend' | null
  }

  type ReportData = {
    name: string
    content: string[]
  }

  type GetReportContentOutput = {
    success: boolean
    data: ReportData[]
  }

  type GetReportContentInput = {
    start: string
    end: string
    authors?: string[]
  }

  type GetGitLogsOutput = {
    hash: string
    author: string
    date: string
    message: string
  }

  type GetGitLogInput = {
    projectPath: string
    startDate?: string
    endDate?: string
    authors?: string[]
    branches?: string[]
  }
}
