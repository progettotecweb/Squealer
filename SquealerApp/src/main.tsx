import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import {RouterProvider, createBrowserRouter} from 'react-router-dom'

// Squealer App routes (base is /Home)
const router = createBrowserRouter([
  {path: '/', element: <App />},

], {basename: '/Home'})



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
