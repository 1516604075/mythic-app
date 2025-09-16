import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Api } from '../App'

export default function Home() {
  const [data, setData] = useState({ settings: {}, buttons: [] })
  const [modal, setModal] = useState(null)

  useEffect(() => {
    Api.getHome().then(setData)
  }, [])

  const bg = data.settings?.home_background_url || 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&w=2048&auto=format&fit=crop'
  const ornaments = data.settings?.ornament_urls || []

  return (
    <div>
      <div className="hero">
        <img src={bg} alt="背景" />
        <div className="ornaments">
          {ornaments.map((u, i) => (
            <img className="orn" key={i} src={u} style={{left: 10 + i*30, top: 10 + i*8}} />
          ))}
        </div>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>快捷功能</div>
          <a href="/admin" style={{color:'#c6a760', textDecoration:'none'}}>管理员</a>
        </div>
        <div className="button-grid" style={{marginTop:10}}>
          {data.buttons.map((b,i) => (
            <div key={i} className="btn-tile" onClick={() => setModal(b)}>
              {b.icon_url ? <img src={b.icon_url} /> : <span className="kbd">图标</span>}
              <div className="label">{b.label}</div>
            </div>
          ))}
          {Array.from({length: Math.max(0, 6 - data.buttons.length)}).map((_,i) => (
            <div key={'ph'+i} className="btn-tile" onClick={() => {}}>
              <span className="kbd">待配置</span>
              <div className="label">—</div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>{modal.label}</h3>
            <div style={{whiteSpace:'pre-wrap', lineHeight:1.6}}>{modal.content_text || '这里显示按钮内容（后台可配置）'}</div>
            <div style={{textAlign:'right', marginTop:10}}>
              <button className="primary" onClick={()=>setModal(null)}>知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
