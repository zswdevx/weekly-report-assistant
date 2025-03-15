import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layouts from '../layouts'

const Home = lazy(() => import('../views/home'))
const Settings = lazy(() => import('../views/settings'))

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layouts />,
    children: [
      {
        path: '',
        element: <Navigate to="home" />,
      },
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
])

export default routes
