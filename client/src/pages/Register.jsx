import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register({ setMe }) {
  const [form, setForm] = useState({ username:'', password:'' })
  const nav = useNavigate()

  async function submit() {
    const { data } = await axios.post('/api/auth/register', form)
    if (data?.user) { setMe(data.user); nav('/') }
  }

  return (
    <div className="card">
      <div style={{fontWeight:700, marginBottom:8}}>注册</div>
      <div className="row" style={{gap:8}}>
        <input className="input" placeholder="用户名（≥3个字符）" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input className="input" placeholder="密码（≥6位）" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="primary" onClick={submit}>注册并登录</button>
      </div>
      <div style={{marginTop:8, color:'#b7bdd6'}}>
        已有账号？<a href="/login">去登录</a>
      </div>
    </div>
  )
}
