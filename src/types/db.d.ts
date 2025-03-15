declare namespace DB {
  interface WeeklyReport {
    id: number
    title: string
    content: string | null
    created_time: string
  }

  interface ProjectConfig {
    id: number
    sort: number
    name: string
    path: string
    create_time: string
    update_time: string
    branches: string | null
  }

  interface Settings {
    authors?: string
    api_key?: string
  }
}
