import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Api } from '../App'

export default function Withdraw() {
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState({ minAmount:'', maxAmount:'', start:'', end:'' })

  async function load() {
    const params = {}
    if (filter.minAmount) params.minAmount = filter.minAmount
    if (filter.maxAmount) params.maxAmount = filter.maxAmount
    if (filter.start) params.start = filter.start
    if (filter.end) params.end = filter.end
    const list = await Api.getWithdrawRecords(params)
    setRecords(list)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div>提现记录</div>
        <button className="primary" onClick={load}>刷新</button>
      </div>

      <div className="row cols-2" style={{marginBottom:8}}>
        <input className="input" placeholder="最小金额" value={filter.minAmount} onChange={e=>setFilter(f=>({...f, minAmount:e.target.value}))} />
        <input className="input" placeholder="最大金额" value={filter.maxAmount} onChange={e=>setFilter(f=>({...f, maxAmount:e.target.value}))} />
      </div>
      <div className="row cols-2" style={{marginBottom:12}}>
        <input className="input" type="date" value={filter.start} onChange={e=>setFilter(f=>({...f, start:e.target.value}))} />
        <input className="input" type="date" value={filter.end} onChange={e=>setFilter(f=>({...f, end:e.target.value}))} />
      </div>

      <div style={{maxHeight:300, overflow:'auto'}}>
        {records.map(r => (
          <div key={r.id} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px dashed rgba(255,255,255,0.12)'}}>
            <div style={{color:'#b7bdd6'}}>{r.username}</div>
            <div>¥{Number(r.amount).toFixed(2)}</div>
            <div style={{color:'#b7bdd6'}}>{dayjs(r.occurred_at).format('YYYY-MM-DD HH:mm')}</div>
          </div>
        ))}
        {records.length===0 && <div style={{color:'#b7bdd6'}}>暂无记录</div>}
      </div>

      <div style={{marginTop:14}} className="notice">在下方绑定你的支付宝以便提现。</div>
    </div>
  )
}
