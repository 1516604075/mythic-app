import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Api } from '../App'

export default function Profile({ me, setMe }) {
  const [cfg, setCfg] = useState({ buttons:[], avatars:[], settings:{} })
  const [bind, setBind] = useState({ name:'', account:'' })
  const [showModal, setShowModal] = useState(null)

  useEffect(()=>{ Api.getProfileConfig().then(setCfg) },[])

  async function saveBind() {
    const { data } = await axios.post('/api/user/bind-alipay', { alipay_name: bind.name, alipay_account: bind.account })
    if (data?.user) setMe(data.user)
  }
  async function chooseAvatar(url) {
    await axios.post('/api/user/choose-avatar', { avatar_url: url })
    const me2 = await Api.me()
    setMe(me2)
  }

  const needBind = !me?.alipay_account
  const minAmt = cfg.settings?.min_withdraw_amount ?? 100
  const minH = cfg.settings?.min_withdraw_hours ?? 24

  return (
    <div className="card">
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
        <img src={me?.avatar_url || (cfg.avatars[0]?.url || 'https://avatars.githubusercontent.com/u/9919?s=200&v=4')} style={{width:56, height:56, borderRadius:16, objectFit:'cover', border:'1px solid rgba(255,255,255,0.15)'}} />
        <div>
          <div style={{fontWeight:700}}>{me?.username || '游客'}</div>
          <div className="kbd">编号：{me?.user_no || '未登录'}</div>
        </div>
      </div>

      {needBind && (
        <div className="notice" style={{marginBottom:12}}>
          你还未绑定支付宝，请尽快绑定以便提现。
        </div>
      )}

      <div className="row cols-2" style={{marginBottom:10}}>
        <input className="input" placeholder="支付宝姓名" value={bind.name} onChange={e=>setBind({...bind, name:e.target.value})} />
        <input className="input" placeholder="支付宝账号" value={bind.account} onChange={e=>setBind({...bind, account:e.target.value})} />
      </div>
      <button className="primary" onClick={saveBind}>绑定/更新 支付宝</button>

      <div style={{marginTop:14, paddingTop:10, borderTop:'1px dashed rgba(255,255,255,0.12)'}}>
        <div style={{marginBottom:8, color:'#b7bdd6'}}>可选头像</div>
        <div style={{display:'flex', gap:8, overflow:'auto', paddingBottom:8}}>
          {cfg.avatars.map(a => (
            <img key={a.id} src={a.url} onClick={()=>chooseAvatar(a.url)} style={{width:56, height:56, borderRadius:12, objectFit:'cover', border:'2px solid transparent', cursor:'pointer'}} />
          ))}
        </div>
      </div>

      <div style={{marginTop:14, paddingTop:10, borderTop:'1px dashed rgba(255,255,255,0.12)'}}>
        <div style={{marginBottom:8, color:'#b7bdd6'}}>常用功能</div>
        <div className="button-grid">
          {cfg.buttons.map((b, i) => (
            <div key={i} className="btn-tile" onClick={()=> b.type==='link' ? window.open(b.payload, '_blank') : setShowModal(b)}>
              <span className="kbd">功能</span>
              <div className="label">{b.label}</div>
            </div>
          ))}
          {Array.from({length: Math.max(0, 4 - cfg.buttons.length)}).map((_,i) => (
            <div key={'ph'+i} className="btn-tile">
              <span className="kbd">待配置</span>
              <div className="label">—</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:14}} className="notice">
        提现须知：最低金额 ¥{Number(minAmt).toFixed(2)}；预计到账时间 ≥ {minH} 小时。
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={()=>setShowModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>{showModal.label}</h3>
            <div style={{whiteSpace:'pre-wrap', lineHeight:1.6}}>{showModal.payload || '内容待配置'}</div>
            <div style={{textAlign:'right', marginTop:10}}>
              <button className="primary" onClick={()=>setShowModal(null)}>知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
