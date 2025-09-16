import React, { useEffect, useState } from 'react'
import { Api } from '../App'

export default function Recycle() {
  const [cfg, setCfg] = useState(null)
  useEffect(()=>{ Api.getRecycle().then(setCfg) },[])
  const url = cfg?.image_url || ''

  return (
    <div className="card" style={{overflow:'auto', padding:0}}>
      {!url ? (
        <div style={{padding:12, color:'#b7bdd6'}}>暂无图片，请管理员在后台上传并设置。</div>
      ) : (
        <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
          <img src={url} style={{width:577, maxWidth:'100%'}} />
        </div>
      )}
    </div>
  )
}
