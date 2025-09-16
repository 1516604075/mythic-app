import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Admin({ me }) {
  const [settings, setSettings] = useState({})
  const [homeButtons, setHomeButtons] = useState([])
  const [profileButtons, setProfileButtons] = useState([])
  const [recycle, setRecycle] = useState({})
  const [avatars, setAvatars] = useState([])
  const [elevateSecret, setElevateSecret] = useState('')

  async function needAdmin() {
    const { data: meData } = await axios.get('/api/auth/me')
    if (!meData.user) return false
    return meData.user.is_admin
  }

  async function loadAll() {
    if (!(await needAdmin())) return
    setSettings((await axios.get('/api/admin/settings')).data)
    setHomeButtons((await axios.get('/api/admin/home-buttons')).data)
    setProfileButtons((await axios.get('/api/admin/profile-buttons')).data)
    setRecycle((await axios.get('/api/admin/recycle')).data)
    setAvatars((await axios.get('/api/admin/avatars')).data)
  }

  useEffect(()=>{ loadAll() }, [])

  async function onUpload(file, cb) {
    const fd = new FormData(); fd.append('file', file)
    const { data } = await axios.post('/api/admin/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    cb(data.url)
  }
  async function saveSettings() {
    const { data } = await axios.put('/api/admin/settings', settings)
    setSettings(data)
  }
  async function saveHomeButtons() {
    await axios.post('/api/admin/home-buttons', { buttons: homeButtons })
    loadAll()
  }
  async function saveProfileButtons() {
    await axios.post('/api/admin/profile-buttons', { items: profileButtons })
    loadAll()
  }
  async function saveRecycle() {
    await axios.put('/api/admin/recycle', { image_url: recycle.image_url })
    loadAll()
  }
  async function addAvatar(url) {
    const fd = new FormData(); fd.append('file', url)
  }
  async function uploadAvatar(file) {
    onUpload(file, async (url) => {
      await axios.post('/api/admin/avatars', new FormData().append('file', file))
    })
  }
  async function uploadAvatar2(file) {
    const fd = new FormData(); fd.append('file', file)
    const { data } = await axios.post('/api/admin/avatars', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setAvatars([data, ...avatars])
  }

  async function elevate() {
    await axios.post('/api/admin/elevate', { secret: elevateSecret })
    alert('已尝试提权，请刷新页面')
  }

  async function generate() {
    const amountMin = Number(prompt('最小金额(默认50):', '50') || '50')
    const amountMax = Number(prompt('最大金额(默认300):', '300') || '300')
    const count = Number(prompt('生成条数(默认50):', '50') || '50')
    await axios.post('/api/admin/generate-withdrawals', { amountMin, amountMax, count })
    alert('已生成')
  }

  const notAdmin = !me?.is_admin

  if (notAdmin) {
    return (
      <div className="card">
        <div style={{marginBottom:8}}>管理员入口</div>
        <input className="input" placeholder="管理员密钥（一次性提权）" value={elevateSecret} onChange={e=>setElevateSecret(e.target.value)} />
        <div style={{marginTop:8}}><button className="primary" onClick={elevate}>提权为管理员</button></div>
        <div style={{marginTop:8, color:'#b7bdd6'}}>提权后请刷新本页进入后台。</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{fontWeight:700, marginBottom:8}}>后台配置</div>

      <div style={{marginBottom:12}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>首页背景图 URL</div>
        <div className="row cols-2">
          <input className="input" value={settings.home_background_url || ''} onChange={e=>setSettings({...settings, home_background_url: e.target.value})} placeholder="https://..." />
          <button className="primary" onClick={saveSettings}>保存设置</button>
        </div>
        <div style={{marginTop:6, color:'#b7bdd6'}}>点缀图（逗号分隔多个 URL）</div>
        <input className="input" value={(settings.ornament_urls||[]).join(',')} onChange={e=>setSettings({...settings, ornament_urls: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
      </div>

      <div style={{marginBottom:12, borderTop:'1px dashed rgba(255,255,255,0.12)', paddingTop:10}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>首页六个按钮</div>
        {[...Array(6)].map((_,i)=>{
          const b = homeButtons[i] || { label:'', icon_url:'', content_text:'' }
          return (
            <div key={i} className="row cols-3" style={{marginBottom:6}}>
              <input className="input" placeholder={`按钮${i+1} 名称`} value={b.label} onChange={e=>{
                const arr=[...homeButtons]; arr[i]={...b, label:e.target.value}; setHomeButtons(arr)
              }} />
              <input className="input" placeholder="图标 URL" value={b.icon_url} onChange={e=>{
                const arr=[...homeButtons]; arr[i]={...b, icon_url:e.target.value}; setHomeButtons(arr)
              }} />
              <input className="input" placeholder="点击内容（文本）" value={b.content_text} onChange={e=>{
                const arr=[...homeButtons]; arr[i]={...b, content_text:e.target.value}; setHomeButtons(arr)
              }} />
            </div>
          )
        })}
        <button className="primary" onClick={saveHomeButtons}>保存六个按钮</button>
      </div>

      <div style={{marginBottom:12, borderTop:'1px dashed rgba(255,255,255,0.12)', paddingTop:10}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>回收页长图（宽度固定 577px）</div>
        <div className="row cols-2">
          <input className="input" placeholder="长图 URL" value={recycle?.image_url || ''} onChange={e=>setRecycle({...recycle, image_url: e.target.value})} />
          <button className="primary" onClick={saveRecycle}>保存回收图</button>
        </div>
      </div>

      <div style={{marginBottom:12, borderTop:'1px dashed rgba(255,255,255,0.12)', paddingTop:10}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>“我的”页四个按钮</div>
        {[...Array(4)].map((_,i)=>{
          const b = profileButtons[i] || { label:'', type:'modal', payload:'' }
          return (
            <div key={i} className="row cols-3" style={{marginBottom:6}}>
              <input className="input" placeholder={`按钮${i+1} 名称`} value={b.label} onChange={e=>{
                const arr=[...profileButtons]; arr[i]={...b, label:e.target.value}; setProfileButtons(arr)
              }} />
              <select className="select" value={b.type} onChange={e=>{
                const arr=[...profileButtons]; arr[i]={...b, type:e.target.value}; setProfileButtons(arr)
              }}>
                <option value="modal">弹窗</option>
                <option value="link">链接</option>
              </select>
              <input className="input" placeholder="弹窗文本 或 URL" value={b.payload} onChange={e=>{
                const arr=[...profileButtons]; arr[i]={...b, payload:e.target.value}; setProfileButtons(arr)
              }} />
            </div>
          )
        })}
        <button className="primary" onClick={saveProfileButtons}>保存“我的”按钮</button>
      </div>

      <div style={{marginBottom:12, borderTop:'1px dashed rgba(255,255,255,0.12)', paddingTop:10}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>上传头像到图库</div>
        <input type="file" accept="image/*" onChange={e=>e.target.files[0] && uploadAvatar2(e.target.files[0])} />
        <div style={{display:'flex', gap:8, overflow:'auto', paddingTop:8}}>
          {avatars.map(a => (<img key={a.id} src={a.url} style={{width:48, height:48, borderRadius:10, objectFit:'cover'}} />))}
        </div>
      </div>

      <div style={{marginBottom:12, borderTop:'1px dashed rgba(255,255,255,0.12)', paddingTop:10}}>
        <div style={{marginBottom:6, color:'#b7bdd6'}}>提现记录生成</div>
        <button className="primary" onClick={generate}>快速生成记录</button>
      </div>
    </div>
  )
}
