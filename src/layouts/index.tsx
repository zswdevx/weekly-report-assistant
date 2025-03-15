import { HomeOutlined, SettingOutlined } from '@ant-design/icons'
import { Col, Flex, Layout, Menu, MenuProps, Row, Typography } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import logo from '@/assets/logo.svg'
import { Window } from '@tauri-apps/api/window'
import { getVersion } from '@tauri-apps/api/app'
import { useAsyncEffect } from 'ahooks'
import { useState, useEffect } from 'react'

const appWindow = new Window('main')

const { Header, Content, Sider } = Layout

const items: MenuProps['items'] = [
  { key: '/home', icon: <HomeOutlined />, label: <Link to="/home">首页</Link> },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">设置</Link>,
  },
]

const Layouts = () => {
  const location = useLocation()
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['/home'])
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [version, setVersion] = useState('x.x.x')
  useAsyncEffect(async () => {
    setVersion(await getVersion())
  }, [])
  useEffect(() => {
    setSelectedKeys([location.pathname])
  }, [location.pathname])
  const onMinimize = () => {
    appWindow.minimize()
  }
  const onToggleMaximize = () => {
    appWindow.toggleMaximize()
  }
  const onClose = () => {
    appWindow.close()
  }
  return (
    <>
      <Layout className="h-screen">
        <Header className="bg-white px-12 py-8 h-initial select-none drag">
          <Row justify="space-between">
            <Col>
              <Flex gap={8}>
                <img width={32} src={logo} />
                <Typography.Title className="mb-0" level={4}>
                  周报助手 v{version}
                </Typography.Title>
              </Flex>
            </Col>
            <Col>
              <Flex className="h-full" gap={8} align="center">
                <img
                  className="cursor-pointer no-drag"
                  width={24}
                  src="https://api.iconify.design/mdi:window-minimize.svg"
                  alt="minimize"
                  onClick={onMinimize}
                />
                <img
                  className="cursor-pointer no-drag"
                  width={24}
                  src="https://api.iconify.design/mdi:window-maximize.svg"
                  alt="maximize"
                  onClick={onToggleMaximize}
                />
                <img
                  className="cursor-pointer no-drag"
                  width={24}
                  src="https://api.iconify.design/mdi:close.svg"
                  alt="close"
                  onClick={onClose}
                />
              </Flex>
            </Col>
          </Row>
        </Header>
        <Layout>
          <Sider theme="light" width={120}>
            <Menu items={items} openKeys={openKeys} onOpenChange={setOpenKeys} selectedKeys={selectedKeys} />
          </Sider>
          <Content className="p-12 overflow-y-auto">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default Layouts
