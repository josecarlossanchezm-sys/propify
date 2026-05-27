// src/App.jsx
// App principal de Propify — conectada a Supabase
import { useState, useEffect } from 'react'
import {
  supabase,
  signIn, signUp, signOut,
  getProperties, getMyProperties,
  getPropertyById, createProperty,
  getFavorites, toggleFavorite,
  sendLead, getMyLeads,
  getProfile
} from './supabase.js'

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const G = {
  primary: '#FF385C', dark: '#1a1a2e', teal: '#00A699',
  bg: '#f7f7f7', white: '#fff', border: '#ebebeb',
  text: '#222', muted: '#666', light: '#999'
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:#f7f7f7;}
  .card{background:#fff;border-radius:16px;overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:pointer;}
  .card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.12);}
  .img-wrap{position:relative;overflow:hidden;height:210px;}
  .img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
  .card:hover .img-wrap img{transform:scale(1.06);}
  .heart{position:absolute;top:12px;right:12px;background:#fff;border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2);font-size:16px;transition:transform .15s;}
  .heart:hover{transform:scale(1.2);}
  .type-pill{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;color:#fff;text-transform:uppercase;display:inline-block;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:22px;}
  .tab{padding:8px 20px;border-radius:20px;border:1.5px solid #ddd;background:#fff;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;color:#555;}
  .tab.on{background:#222;color:#fff;border-color:#222;}
  .btn-p{background:#FF385C;color:#fff;border:none;border-radius:10px;padding:13px 26px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
  .btn-p:hover{background:#e0314f;transform:translateY(-1px);}
  .btn-p:disabled{background:#ccc;cursor:not-allowed;transform:none;}
  .btn-o{background:transparent;color:#333;border:1.5px solid #ddd;border-radius:10px;padding:12px 22px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s;}
  .btn-o:hover{border-color:#333;}
  .inp{width:100%;padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;font-family:inherit;outline:none;transition:border .15s;background:#fff;}
  .inp:focus{border-color:#FF385C;}
  .logo{font-family:'Fraunces',serif;font-weight:800;font-size:22px;color:#FF385C;cursor:pointer;}
  .nav{background:#fff;border-bottom:1px solid #ebebeb;position:sticky;top:0;z-index:100;}
  .nav-in{max-width:1200px;margin:0 auto;padding:0 24px;height:68px;display:flex;align-items:center;justify-content:space-between;}
  .hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:70px 24px 60px;}
  .main{max-width:1200px;margin:0 auto;padding:28px 24px 60px;}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
  .modal{background:#fff;border-radius:20px;width:100%;max-width:460px;overflow:hidden;max-height:90vh;overflow-y:auto;}
  .gallery{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:240px 240px;gap:4px;border-radius:16px;overflow:hidden;}
  .gallery .main-img{grid-row:1/3;grid-column:1/2;}
  .gallery img{width:100%;height:100%;object-fit:cover;}
  .amenity{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#f7f7f7;border-radius:20px;font-size:13px;color:#444;}
  .dash-stat{background:#fff;border-radius:14px;padding:20px 24px;border:1px solid #ebebeb;}
  .prop-row{display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #f0f0f0;}
  .error-box{background:#fff5f5;border:1px solid #ffcccc;border-radius:8px;padding:10px 14px;font-size:13px;color:#c0392b;margin-bottom:12px;}
  .success-box{background:#f0fff4;border:1px solid #c3e6cb;border-radius:8px;padding:10px 14px;font-size:13px;color:#27ae60;margin-bottom:12px;}
  .spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user, onSignOut }) {
  return (
    <nav className="nav">
      <div className="nav-in">
        <span className="logo" onClick={() => setPage('home')}>Propify</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {!user ? (
            <>
              <button className="btn-o" style={{ padding:'8px 18px', fontSize:13 }} onClick={() => setPage('login')}>Ingresar</button>
              <button className="btn-p" style={{ padding:'9px 18px', fontSize:13 }} onClick={() => setPage('register')}>Publicar</button>
            </>
          ) : (
            <>
              <button className="btn-o" style={{ padding:'8px 14px', fontSize:13 }} onClick={() => setPage('dashboard')}>Dashboard</button>
              <button className="btn-o" style={{ padding:'8px 14px', fontSize:13 }} onClick={onSignOut}>Salir</button>
              <img src={user.avatar_url || `https://i.pravatar.cc/40?u=${user.id}`} alt="" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', border:'2px solid #FF385C' }} />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background:'#fff', borderRadius:16, overflow:'hidden' }}>
      <div className="skeleton" style={{ height:210 }} />
      <div style={{ padding:16 }}>
        <div className="skeleton" style={{ height:16, marginBottom:8 }} />
        <div className="skeleton" style={{ height:12, width:'60%', marginBottom:16 }} />
        <div className="skeleton" style={{ height:20, width:'40%' }} />
      </div>
    </div>
  )
}

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────
function PropCard({ p, saved, onSave, onClick }) {
  const mainImg = p.property_images?.find(i => i.is_main)?.url || p.property_images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=70'
  const agent = p.profiles

  return (
    <div className="card" onClick={onClick}>
      <div className="img-wrap">
        <img src={mainImg} alt={p.title} />
        <button className="heart" onClick={e => { e.stopPropagation(); onSave() }}>{saved ? '❤️' : '🤍'}</button>
        <div style={{ position:'absolute', top:12, left:12, background: p.type==='Venta'?G.dark:G.teal, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:'#fff', textTransform:'uppercase' }}>{p.type}</div>
        {p.badge && <div style={{ position:'absolute', bottom:12, left:12, background:p.badge_color||'#FF385C', padding:'3px 9px', borderRadius:12, fontSize:11, fontWeight:600, color:'#fff' }}>{p.badge}</div>}
      </div>
      <div style={{ padding:16 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:G.text, lineHeight:1.3, marginBottom:5 }}>{p.title}</h3>
        <p style={{ fontSize:12, color:G.muted, marginBottom:12 }}>📍 {p.location}</p>
        <div style={{ display:'flex', gap:14, marginBottom:14 }}>
          {p.beds > 0 && <span style={{ fontSize:12, color:'#555' }}>🛏 {p.beds} rec.</span>}
          <span style={{ fontSize:12, color:'#555' }}>🚿 {p.baths} baños</span>
          <span style={{ fontSize:12, color:'#555' }}>📐 {p.sqm} m²</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f0f0f0', paddingTop:12 }}>
          <div>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:19, fontWeight:700 }}>${Number(p.price).toLocaleString('es-MX')}</span>
            {p.period && <span style={{ color:'#888', fontSize:12 }}>{p.period}</span>}
          </div>
          {agent && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <img src={agent.avatar_url || `https://i.pravatar.cc/30?u=${agent.id}`} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover' }} />
              <span style={{ fontSize:11, color:G.muted }}>{agent.name?.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ setPage, setSelectedId, savedIds, onToggleFav, user }) {
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProperties({ sortBy: 'recent' }).then(({ data }) => {
      setProps(data?.slice(0, 3) || [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="hero">
        <div style={{ maxWidth:1200, margin:'0 auto', textAlign:'center' }}>
          <p style={{ color:G.primary, fontWeight:700, fontSize:12, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>La plataforma inmobiliaria más confiable</p>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(34px,6vw,64px)', fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:20 }}>
            Encuentra tu<br /><span style={{ color:G.primary }}>hogar ideal</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:16, marginBottom:36, maxWidth:460, margin:'0 auto 36px' }}>
            Miles de propiedades verificadas con los mejores corredores inmobiliarios del país.
          </p>
          <div style={{ background:'#fff', borderRadius:40, display:'flex', alignItems:'center', padding:'7px 7px 7px 20px', boxShadow:'0 8px 30px rgba(0,0,0,.25)', maxWidth:620, margin:'0 auto', gap:6 }}>
            <span>📍</span>
            <input className="inp" style={{ border:'none', outline:'none', flex:1, fontSize:15, background:'transparent', padding:'4px 0' }} placeholder="¿Qué colonia o ciudad buscas?" onKeyDown={e => e.key === 'Enter' && setPage('listing')} />
            <button className="btn-p" style={{ borderRadius:30 }} onClick={() => setPage('listing')}>🔍 Buscar</button>
          </div>
          <div style={{ display:'flex', gap:14, justifyContent:'center', marginTop:40, flexWrap:'wrap' }}>
            {[['12,400+','Propiedades'],['3,200+','Corredores'],['98%','Satisfacción']].map(([n,l]) => (
              <div key={l} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:16, padding:'20px 24px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:800, color:'#fff' }}>{n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700 }}>Propiedades destacadas</h2>
          <button className="btn-o" onClick={() => setPage('listing')}>Ver todas →</button>
        </div>
        <div className="grid">
          {loading ? [1,2,3].map(i => <SkeletonCard key={i} />) :
            props.map(p => (
              <PropCard key={p.id} p={p} saved={savedIds.includes(p.id)}
                onSave={() => onToggleFav(p.id)}
                onClick={() => { setSelectedId(p.id); setPage('detail') }} />
            ))
          }
        </div>

        <div style={{ marginTop:56, borderRadius:24, background:'linear-gradient(135deg,#0f3460,#1a1a2e)', padding:'50px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:28 }}>
          <div>
            <p style={{ color:G.primary, fontWeight:700, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Para corredores</p>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10 }}>Publica y llega a más compradores</h2>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:14 }}>Únete gratis. Sin comisiones ocultas.</p>
          </div>
          <button className="btn-p" onClick={() => setPage(user ? 'dashboard' : 'register')}>
            {user ? 'Ir al Dashboard' : 'Crear cuenta gratis'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LISTING ──────────────────────────────────────────────────────────────────
function Listing({ setPage, setSelectedId, savedIds, onToggleFav }) {
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    setLoading(true)
    getProperties({ type: tab, search, sortBy: sort }).then(({ data }) => {
      setProps(data || [])
      setLoading(false)
    })
  }, [tab, search, sort])

  return (
    <div className="main">
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>Propiedades disponibles</h2>
          <p style={{ color:G.muted, fontSize:13 }}>{props.length} resultados</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <input className="inp" style={{ width:200, padding:'9px 14px', fontSize:13 }} placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          {['Todos','Venta','Renta'].map(t => (
            <button key={t} className={`tab ${tab===t?'on':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
          <select className="inp" style={{ width:150, padding:'9px 14px', fontSize:13 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio: menor</option>
            <option value="price_desc">Precio: mayor</option>
          </select>
        </div>
      </div>

      <div className="grid">
        {loading ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />) :
          props.length === 0
            ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:G.muted }}>No se encontraron propiedades.</div>
            : props.map(p => (
                <PropCard key={p.id} p={p} saved={savedIds.includes(p.id)}
                  onSave={() => onToggleFav(p.id)}
                  onClick={() => { setSelectedId(p.id); setPage('detail') }} />
              ))
        }
      </div>
    </div>
  )
}

// ─── DETAIL ───────────────────────────────────────────────────────────────────
function Detail({ propId, setPage, savedIds, onToggleFav, user }) {
  const [prop, setProp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    getPropertyById(propId).then(({ data }) => {
      setProp(data)
      if (data) setForm(f => ({ ...f, message: `Hola, me interesa la propiedad "${data.title}". ¿Podemos agendar una visita?` }))
      setLoading(false)
    })
  }, [propId])

  const handleSendLead = async () => {
    if (!form.name || !form.email) return
    setSending(true)
    await sendLead({
      propertyId: prop.id,
      agentId: prop.agent_id,
      senderName: form.name,
      senderEmail: form.email,
      senderPhone: form.phone,
      message: form.message
    })
    setSending(false)
    setSent(true)
  }

  if (loading) return <div className="main"><div className="skeleton" style={{ height:480, borderRadius:16 }} /></div>
  if (!prop) return <div className="main"><p>Propiedad no encontrada.</p></div>

  const imgs = prop.property_images?.sort((a,b) => a.order_index - b.order_index).map(i => i.url) || ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80']
  const agent = prop.profiles

  return (
    <div style={{ background:G.bg, minHeight:'100vh' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 60px' }}>
        <button className="btn-o" style={{ marginBottom:20, fontSize:13, padding:'8px 16px' }} onClick={() => setPage('listing')}>← Volver</button>

        {/* GALLERY */}
        {imgs.length >= 4 ? (
          <div className="gallery" style={{ marginBottom:28 }}>
            <div className="main-img"><img src={imgs[activeImg]} alt="" /></div>
            {imgs.slice(1,4).map((src,i) => <img key={i} src={src} alt="" onClick={() => setActiveImg(i+1)} />)}
          </div>
        ) : (
          <div style={{ borderRadius:16, overflow:'hidden', height:340, marginBottom:28 }}>
            <img src={imgs[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}

        <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
          <div style={{ flex:'1 1 560px' }}>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <span className="type-pill" style={{ background:prop.type==='Venta'?G.dark:G.teal }}>{prop.type}</span>
              {prop.badge && <span className="type-pill" style={{ background:prop.badge_color||G.primary }}>{prop.badge}</span>}
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:800, marginBottom:6 }}>{prop.title}</h1>
            <p style={{ color:G.muted, fontSize:15, marginBottom:20 }}>📍 {prop.location}</p>

            <div style={{ display:'flex', gap:20, flexWrap:'wrap', background:'#fff', borderRadius:14, padding:'18px 22px', marginBottom:24, border:'1px solid #ebebeb' }}>
              {prop.beds > 0 && <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700 }}>{prop.beds}</div><div style={{ fontSize:12, color:G.muted }}>Recámaras</div></div>}
              <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700 }}>{prop.baths}</div><div style={{ fontSize:12, color:G.muted }}>Baños</div></div>
              <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700 }}>{prop.sqm}</div><div style={{ fontSize:12, color:G.muted }}>m²</div></div>
              {prop.parking > 0 && <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700 }}>{prop.parking}</div><div style={{ fontSize:12, color:G.muted }}>Cajones</div></div>}
            </div>

            <h3 style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>Descripción</h3>
            <p style={{ color:'#444', lineHeight:1.7, fontSize:14, marginBottom:24 }}>{prop.description}</p>

            {prop.amenities?.length > 0 && <>
              <h3 style={{ fontWeight:700, fontSize:16, marginBottom:12 }}>Amenidades</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {prop.amenities.map(a => <span key={a} className="amenity">✓ {a}</span>)}
              </div>
            </>}
          </div>

          {/* SIDEBAR */}
          <div style={{ flex:'0 0 290px' }}>
            <div style={{ background:'#fff', borderRadius:16, padding:22, border:'1px solid #ebebeb', marginBottom:16, position:'sticky', top:80 }}>
              <div style={{ marginBottom:16 }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:800 }}>${Number(prop.price).toLocaleString('es-MX')}</span>
                {prop.period && <span style={{ color:G.muted, fontSize:14 }}>{prop.period}</span>}
              </div>
              <button className="btn-p" style={{ width:'100%', justifyContent:'center', marginBottom:10 }} onClick={() => setShowContact(true)}>
                Contactar corredor
              </button>
              <button className="btn-o" style={{ width:'100%', textAlign:'center' }} onClick={() => onToggleFav(prop.id)}>
                {savedIds.includes(prop.id) ? '❤️ Guardado' : '🤍 Guardar'}
              </button>
            </div>

            {agent && (
              <div style={{ background:'#fff', borderRadius:16, padding:22, border:'1px solid #ebebeb' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
                  <img src={agent.avatar_url || `https://i.pravatar.cc/50?u=${agent.id}`} alt="" style={{ width:50, height:50, borderRadius:'50%', objectFit:'cover' }} />
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{agent.name} {agent.verified && '✅'}</div>
                    <div style={{ fontSize:12, color:G.muted }}>{agent.title}</div>
                    <div style={{ fontSize:12, color:G.primary, fontWeight:500 }}>{agent.agency}</div>
                  </div>
                </div>
                <p style={{ fontSize:12, color:'#555', lineHeight:1.6, marginBottom:12 }}>{agent.bio}</p>
                {agent.phone && <p style={{ fontSize:13, marginBottom:6 }}>📞 {agent.phone}</p>}
                {agent.email && <p style={{ fontSize:13 }}>✉️ {agent.email}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {showContact && (
        <div className="modal-bg" onClick={() => setShowContact(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#1a1a2e,#0f3460)', padding:'22px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:'#fff' }}>Contactar corredor</span>
              <button style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', width:30, height:30, borderRadius:'50%', cursor:'pointer' }} onClick={() => { setShowContact(false); setSent(false) }}>✕</button>
            </div>
            {sent ? (
              <div style={{ padding:'36px 24px', textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, marginBottom:8 }}>¡Mensaje enviado!</h3>
                <p style={{ color:G.muted, fontSize:14 }}>El corredor te responderá pronto.</p>
                <button className="btn-p" style={{ marginTop:20 }} onClick={() => { setShowContact(false); setSent(false) }}>Cerrar</button>
              </div>
            ) : (
              <div style={{ padding:24 }}>
                {[['Tu nombre','text','name','Juan Pérez'],['Teléfono','tel','phone','55 1234 5678'],['Correo','email','email','juan@email.com']].map(([l,t,k,ph]) => (
                  <div key={k} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>{l}</label>
                    <input className="inp" type={t} placeholder={ph} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Mensaje</label>
                  <textarea className="inp" rows={3} style={{ resize:'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button className="btn-p" style={{ width:'100%', justifyContent:'center' }} onClick={handleSendLead} disabled={sending}>
                  {sending ? <span className="spinner" /> : 'Enviar mensaje'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ mode, setPage, onLogin }) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [role, setRole] = useState('buyer')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('Completa todos los campos.')
    if (!isLogin && form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    if (isLogin) {
      const { data, error } = await signIn({ email: form.email, password: form.password })
      if (error) { setError(error.message); setLoading(false); return }
      const { data: profile } = await getProfile(data.user.id)
      onLogin(profile || data.user)
      setPage('dashboard')
    } else {
      const { data, error } = await signUp({ email: form.email, password: form.password, name: form.name, role })
      if (error) { setError(error.message); setLoading(false); return }
      onLogin({ id: data.user?.id, name: form.name, email: form.email, role })
      setPage('dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex' }}>
      <div style={{ flex:'0 0 42%', background:'linear-gradient(145deg,#1a1a2e,#0f3460)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 50px' }}>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:36, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:20 }}>
          El mercado<br />inmobiliario<br /><span style={{ color:G.primary }}>en tus manos</span>
        </div>
        {['12,400+ propiedades verificadas','3,200+ corredores certificados','Proceso 100% digital'].map(item => (
          <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,56,92,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:G.primary, fontSize:11 }}>✓</span>
            </div>
            <span style={{ color:'rgba(255,255,255,.65)', fontSize:13 }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40, background:'#fafafa' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:800, marginBottom:6 }}>
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p style={{ color:G.muted, fontSize:14, marginBottom:28 }}>
            {isLogin ? 'Ingresa a tu panel de control' : 'Empieza gratis, sin tarjeta de crédito'}
          </p>

          {error && <div className="error-box">{error}</div>}

          {!isLogin && step === 1 && (
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:G.muted, marginBottom:12 }}>¿Cómo quieres usar Propify?</p>
              <div style={{ display:'flex', gap:12, marginBottom:24 }}>
                {[['🏠','buyer','Busco propiedad'],['💼','agent','Soy corredor']].map(([icon,r,label]) => (
                  <button key={r} onClick={() => setRole(r)} style={{ flex:1, padding:'16px 12px', borderRadius:12, border:`2px solid ${role===r?G.primary:'#ddd'}`, background:role===r?'#fff5f7':'#fff', cursor:'pointer', textAlign:'center', fontFamily:'inherit' }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{label}</div>
                  </button>
                ))}
              </div>
              <button className="btn-p" style={{ width:'100%', justifyContent:'center' }} onClick={() => setStep(2)}>Continuar →</button>
            </div>
          )}

          {(isLogin || step === 2) && (
            <div>
              {!isLogin && <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Nombre completo</label>
                <input className="inp" placeholder="Juan Pérez" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Correo electrónico</label>
                <input className="inp" type="email" placeholder="juan@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Contraseña</label>
                <input className="inp" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              {!isLogin && <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Confirmar contraseña</label>
                <input className="inp" type="password" placeholder="Repite tu contraseña" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>}
              <button className="btn-p" style={{ width:'100%', justifyContent:'center', marginBottom:16 }} onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner" /> : isLogin ? 'Ingresar' : 'Crear cuenta gratis'}
              </button>
              <div style={{ textAlign:'center', fontSize:13, color:G.muted }}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <span style={{ color:G.primary, cursor:'pointer', fontWeight:600 }} onClick={() => { setIsLogin(!isLogin); setStep(1); setError('') }}>
                  {isLogin ? 'Regístrate' : 'Ingresar'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  const [section, setSection] = useState('overview')
  const [myProps, setMyProps] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProp, setShowNewProp] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [propForm, setPropForm] = useState({ title:'', price:'', type:'Venta', category:'Departamento', location:'', beds:1, baths:1, sqm:'', parking:1, description:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSavedProp] = useState(false)

  useEffect(() => {
    Promise.all([getMyProperties(), getMyLeads()]).then(([p, l]) => {
      setMyProps(p.data || [])
      setLeads(l.data || [])
      setLoading(false)
    })
  }, [])

  const handleCreateProp = async () => {
    setSaving(true)
    const { error } = await createProperty({
      ...propForm,
      price: Number(propForm.price),
      beds: Number(propForm.beds),
      baths: Number(propForm.baths),
      sqm: Number(propForm.sqm),
      parking: Number(propForm.parking),
    })
    setSaving(false)
    if (!error) {
      setSavedProp(true)
      const { data } = await getMyProperties()
      setMyProps(data || [])
    }
  }

  const sections = [['📊','overview','Resumen'],['🏠','properties','Mis Propiedades'],['💬','leads','Leads'],['⚙️','settings','Configuración']]

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 68px)', background:G.bg }}>
      <div style={{ width:210, background:G.dark, padding:'24px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <img src={user.avatar_url || `https://i.pravatar.cc/40?u=${user.id}`} alt="" style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', border:'2px solid #FF385C' }} />
          <div>
            <div style={{ fontWeight:600, fontSize:13, color:'#fff' }}>{user.name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{user.role === 'agent' ? 'Corredor' : 'Comprador'}</div>
          </div>
        </div>
        {sections.map(([icon,key,label]) => (
          <button key={key} onClick={() => setSection(key)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'none', background:section===key?'rgba(255,56,92,.2)':'transparent', color:section===key?'#FF385C':'rgba(255,255,255,.6)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:section===key?600:400, marginBottom:4 }}>
            {icon} {label}
          </button>
        ))}
        <button onClick={() => setPage('home')} style={{ width:'100%', marginTop:120, padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:'rgba(255,255,255,.3)', cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:'left' }}>← Volver al sitio</button>
      </div>

      <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
        {section === 'overview' && (
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, marginBottom:20 }}>Resumen 👋</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:28 }}>
              {[['🏠', myProps.length, 'Propiedades','#FF385C'],['💬', leads.length,'Leads totales','#00A699'],['👁️', myProps.reduce((a,p)=>a+(p.views||0),0),'Vistas','#7B68EE']].map(([icon,n,l,c]) => (
                <div key={l} className="dash-stat">
                  <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:800, color:c }}>{n}</div>
                  <div style={{ fontSize:12, color:G.muted }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', borderRadius:14, padding:22, border:'1px solid #ebebeb' }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Tus propiedades recientes</h3>
              {loading ? <div className="skeleton" style={{ height:80 }} /> :
                myProps.slice(0,3).map(p => (
                  <div key={p.id} className="prop-row">
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>{p.title}</div>
                      <div style={{ fontSize:12, color:G.muted }}>{p.type} · ${Number(p.price).toLocaleString('es-MX')}</div>
                    </div>
                    <div style={{ fontSize:12, color:G.muted }}>👁 {p.views || 0}</div>
                  </div>
                ))
              }
              {myProps.length === 0 && <p style={{ color:G.muted, fontSize:14 }}>Aún no tienes propiedades publicadas.</p>}
            </div>
          </div>
        )}

        {section === 'properties' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700 }}>Mis propiedades</h2>
              <button className="btn-p" onClick={() => { setShowNewProp(true); setSavedProp(false); setFormStep(1) }}>+ Nueva propiedad</button>
            </div>
            {loading ? <div className="skeleton" style={{ height:100 }} /> :
              myProps.length === 0
                ? <p style={{ color:G.muted }}>No has publicado propiedades aún.</p>
                : myProps.map(p => (
                    <div key={p.id} style={{ background:'#fff', borderRadius:14, padding:16, border:'1px solid #ebebeb', marginBottom:12, display:'flex', gap:14, alignItems:'center' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600 }}>{p.title}</div>
                        <div style={{ fontSize:13, color:G.muted }}>{p.type} · ${Number(p.price).toLocaleString('es-MX')}{p.period||''}</div>
                        <div style={{ fontSize:12, color:G.muted, marginTop:4 }}>👁 {p.views||0} vistas</div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color:p.status==='active'?G.teal:'#FC642D' }}>
                        {p.status==='active'?'Activo':'Pausado'}
                      </span>
                    </div>
                  ))
            }
          </div>
        )}

        {section === 'leads' && (
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:20 }}>Leads recibidos</h2>
            {loading ? <div className="skeleton" style={{ height:100 }} /> :
              leads.length === 0
                ? <p style={{ color:G.muted }}>Aún no tienes leads. Publica una propiedad para empezar a recibirlos.</p>
                : leads.map(l => (
                    <div key={l.id} style={{ background:'#fff', borderRadius:14, padding:18, border:'1px solid #ebebeb', marginBottom:12, display:'flex', gap:14 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:G.dark, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, flexShrink:0 }}>{l.sender_name[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14 }}>{l.sender_name}</div>
                        <p style={{ fontSize:13, color:'#555', margin:'4px 0' }}>{l.message}</p>
                        <div style={{ fontSize:11, color:G.muted }}>{l.sender_email} · {l.sender_phone}</div>
                        {l.properties && <div style={{ fontSize:11, color:G.primary, marginTop:4 }}>🏠 {l.properties.title}</div>}
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:l.status==='new'?G.primary:G.teal, flexShrink:0 }}>{l.status==='new'?'Nuevo':'Leído'}</span>
                    </div>
                  ))
            }
          </div>
        )}

        {section === 'settings' && (
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:22 }}>Configuración</h2>
            <div style={{ background:'#fff', borderRadius:14, padding:24, border:'1px solid #ebebeb', maxWidth:500 }}>
              {[['Nombre completo',user.name],['Correo',user.email||''],['Agencia',''],['Teléfono','']].map(([l,v]) => (
                <div key={l} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>{l}</label>
                  <input className="inp" defaultValue={v} />
                </div>
              ))}
              <button className="btn-p">Guardar cambios</button>
            </div>
          </div>
        )}
      </div>

      {/* NUEVA PROPIEDAD MODAL */}
      {showNewProp && (
        <div className="modal-bg" onClick={() => setShowNewProp(false)}>
          <div className="modal" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#1a1a2e,#0f3460)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:'#fff' }}>Nueva propiedad</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Paso {formStep} de 2</div>
              </div>
              <button style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer' }} onClick={() => setShowNewProp(false)}>✕</button>
            </div>
            <div style={{ display:'flex', padding:'12px 24px 0' }}>
              {[1,2].map(s => <div key={s} style={{ flex:1, height:3, borderRadius:2, background:s<=formStep?G.primary:'#e0e0e0', marginRight:s<2?6:0 }} />)}
            </div>

            {saved ? (
              <div style={{ padding:'36px 24px', textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>🎉</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, marginBottom:8 }}>¡Publicada!</h3>
                <p style={{ color:G.muted, fontSize:14 }}>Tu propiedad ya está visible en Propify.</p>
                <button className="btn-p" style={{ marginTop:20 }} onClick={() => { setShowNewProp(false); setSection('properties') }}>Ver mis propiedades</button>
              </div>
            ) : (
              <div style={{ padding:24 }}>
                {formStep === 1 ? (
                  <div>
                    {[['Título','text','title','Ej. Penthouse en Polanco'],['Precio','number','price','8500000'],['Ubicación','text','location','Polanco, CDMX']].map(([l,t,k,ph]) => (
                      <div key={k} style={{ marginBottom:14 }}>
                        <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>{l}</label>
                        <input className="inp" type={t} placeholder={ph} value={propForm[k]} onChange={e => setPropForm(f => ({ ...f, [k]: e.target.value }))} />
                      </div>
                    ))}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Tipo</label>
                        <select className="inp" value={propForm.type} onChange={e => setPropForm(f => ({ ...f, type: e.target.value }))}>
                          <option>Venta</option><option>Renta</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Categoría</label>
                        <select className="inp" value={propForm.category} onChange={e => setPropForm(f => ({ ...f, category: e.target.value }))}>
                          <option>Departamento</option><option>Casa</option><option>Oficina</option><option>Local</option><option>Terreno</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                      {[['Recámaras','beds'],['Baños','baths'],['m²','sqm'],['Cajones','parking']].map(([l,k]) => (
                        <div key={k}>
                          <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>{l}</label>
                          <input className="inp" type="number" value={propForm[k]} onChange={e => setPropForm(f => ({ ...f, [k]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, color:G.muted, display:'block', marginBottom:5 }}>Descripción</label>
                      <textarea className="inp" rows={4} style={{ resize:'vertical' }} placeholder="Describe la propiedad..." value={propForm.description} onChange={e => setPropForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
                  {formStep > 1 ? <button className="btn-o" onClick={() => setFormStep(1)}>← Atrás</button> : <div />}
                  {formStep < 2
                    ? <button className="btn-p" onClick={() => setFormStep(2)}>Siguiente →</button>
                    : <button className="btn-p" onClick={handleCreateProp} disabled={saving}>{saving ? <span className="spinner" /> : '🚀 Publicar'}</button>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [savedIds, setSavedIds] = useState([])

  // Verificar sesión al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getProfile(session.user.id).then(({ data }) => {
          setUser(data || session.user)
        })
        getFavorites().then(({ data }) => setSavedIds(data || []))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setSavedIds([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleToggleFav = async (id) => {
    if (!user) return setPage('login')
    const { saved } = await toggleFavorite(id)
    setSavedIds(prev => saved ? [...prev, id] : prev.filter(i => i !== id))
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setPage('home')
  }

  return (
    <div>
      <style>{css}</style>
      <Navbar page={page} setPage={setPage} user={user} onSignOut={handleSignOut} />
      {page === 'home' && <Home setPage={setPage} setSelectedId={setSelectedId} savedIds={savedIds} onToggleFav={handleToggleFav} user={user} />}
      {page === 'listing' && <Listing setPage={setPage} setSelectedId={setSelectedId} savedIds={savedIds} onToggleFav={handleToggleFav} />}
      {page === 'detail' && selectedId && <Detail propId={selectedId} setPage={setPage} savedIds={savedIds} onToggleFav={handleToggleFav} user={user} />}
      {page === 'dashboard' && user && <Dashboard user={user} setPage={setPage} />}
      {(page === 'login' || page === 'register') && <Auth mode={page} setPage={setPage} onLogin={setUser} />}
    </div>
  )
}
