import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login({ setMe }) {
  const [form, setForm] = useState({ username:'', password:'' })
  const nav = useNavigate()

  async function submit() {
    const { data } = await axios.post('/api/auth/login', form)
    if (data?.user) { setMe(data.user); nav('/') }
  }

  return (
    <div className="card">
      <div style={{fontWeight:700, marginBottom:8}}>登录</div>
      <div className="row" style={{gap:8}}>
        <input className="input" placeholder="用户名" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input className="input" placeholder="密码" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="primary" onClick={submit}>登录</button>
      </div>
      <div style={{marginTop:8, color:'#b7bdd6'}}>
        没有账号？<a href="/register">去注册</a>
      </div>
    </div>
  )
}
