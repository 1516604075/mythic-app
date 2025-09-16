import React, { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Home from './pages/Home'
import Recycle from './pages/Recycle'
import Withdraw from './pages/Withdraw'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'

axios.defaults.withCredentials = true

export const Api = {
  async me() {
    const { data } = await axios.get('/api/auth/me')
    return data.user
  },
  async getHome() {
    const { data } = await axios.get('/api/public/home')
    return data
  },
  async getRecycle() {
    const { data } = await axios.get('/api/public/recycle')
    return data
  },
  async getWithdrawRecords(params) {
    const { data } = await axios.get('/api/public/withdraw-records', { params })
    return data
  },
  async getProfileConfig() {
    const { data } = await axios.get('/api/public/profile')
    return data
  }
}

function Shell({ children }) {
  return (
    <div className="app-shell">
      <div className="header">
        <img alt="logo" src="https://upload.wikimedia.org/wikipedia/commons/5/59/Starsinthesky.svg" width="28" />
        <div className="title">梦幻国风</div>
      </div>
      <div className="content">{children}</div>
      <div className="tabbar">
        <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>首页</NavLink>
        <NavLink to="/recycle" className={({isActive}) => isActive ? 'active' : ''}>回收</NavLink>
        <NavLink to="/withdraw" className={({isActive}) => isActive ? 'active' : ''}>提现</NavLink>
        <NavLink to="/profile" className={({isActive}) => isActive ? 'active' : ''}>我的</NavLink>
      </div>
    </div>
  )
}

export default function App() {
  const [me, setMe] = useState(null);
  useEffect(() => { Api.me().then(setMe) }, [])

  return (
    <Routes>
      <Route element={<Shell><Home me={me} /></Shell>} path="/" />
      <Route element={<Shell><Recycle me={me} /></Shell>} path="/recycle" />
      <Route element={<Shell><Withdraw me={me} /></Shell>} path="/withdraw" />
      <Route element={<Shell><Profile me={me} setMe={setMe} /></Shell>} path="/profile" />
      <Route element={<Shell><Admin me={me} /></Shell>} path="/admin" />
      <Route element={<Shell><Login setMe={setMe} /></Shell>} path="/login" />
      <Route element={<Shell><Register setMe={setMe} /></Shell>} path="/register" />
    </Routes>
  )
}
