import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layouts from '../layouts'

const Home = lazy(() => import('../views/home'))
const Settings = lazy(() => import('../views/settings'))
const Projects = lazy(() => import('../views/projects'))
const History = lazy(() => import('../views/history'))

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
        path: '/projects',
        element: <Projects />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/history',
        element: <History />,
      },
    ],
  },
])

export default routes
