import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import 'dayjs/locale/zh-cn'
import './index.css'
import { ConfigProvider, ThemeConfig } from 'antd'
import { initDatabase } from './utils/db'
;(async () => {
  await initDatabase()
})()

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.locale('zh-cn')

const theme: ThemeConfig = { components: { Card: { bodyPadding: 12 } } }

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
