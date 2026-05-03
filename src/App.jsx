import { useState, useEffect } from 'react'
import { Activity, Heart, Moon, Flame, Footprints, Battery, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine } from 'recharts'
import { Sidebar } from './components/Sidebar'
import { KPICard } from './components/KPICard'
import { EmptyState } from './components/EmptyState'
import { CoachSection } from './components/CoachSection'

const ZONE_COLORS = ['#3b82f6','#22c55e','#eab308','#f97316','#ef4444']
const TYPE_COLORS = ['#3b82f6','#8b5cf6','#22c55e','#f97316','#ef4444']

const TYPE_LABELS = {
  running: 'Running', cycling: 'Ciclismo', walking: 'Caminata',
  swimming: 'Natación', hiking: 'Senderismo', strength_training: 'Fuerza',
  yoga: 'Yoga', cardio: 'Cardio', other: 'Otro'
}

function SleepBar({ label, hours, total, color }) {
  const pct = total > 0 ? Math.round((hours / total) * 100) : 0
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{hours}h <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function ScoreRing({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const pct = score / 100
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : 'Bajo'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x={65} y={60} textAnchor="middle" fill="var(--text-primary)" fontSize={28} fontWeight={700}>{score}</text>
        <text x={65} y={80} textAnchor="middle" fill="var(--text-secondary)" fontSize={12}>/100</text>
      </svg>
      <span style={{ fontSize: 13, color, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

function SuenioSection({ data }) {
  const sleep = data?.sleep || {}
  const { hours = 0, deep = 0, rem = 0, light = 0, score = 0, history = [] } = sleep
  const tickFmt = d => d ? d.slice(5) : ''

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 'var(--space-4)' }}>
        {[
          { label: 'Total', value: hours, unit: 'hrs', color: '#8b5cf6' },
          { label: 'Sueño profundo', value: deep, unit: 'hrs', color: '#3b82f6' },
          { label: 'Sueño REM', value: rem, unit: 'hrs', color: '#22c55e' },
          { label: 'Sueño ligero', value: light, unit: 'hrs', color: '#eab308' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="label">{k.label}</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: k.color, margin: '6px 0' }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k.unit}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <ScoreRing score={score} />
          <div style={{ flex: 1 }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Puntuación de sueño</h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {score >= 80 ? 'Dormiste muy bien. Tu cuerpo tuvo tiempo suficiente para recuperarse.'
                : score >= 60 ? 'Sueño aceptable. Intenta mantener un horario consistente.'
                : 'Sueño insuficiente. Considera acostarte más temprano esta noche.'}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="h2" style={{ marginBottom: 20 }}>Distribución del sueño</h2>
          <SleepBar label="Sueño ligero" hours={light} total={hours} color="#eab308" />
          <SleepBar label="Sueño profundo" hours={deep} total={hours} color="#3b82f6" />
          <SleepBar label="Sueño REM" hours={rem} total={hours} color="#22c55e" />
        </div>
      </div>

      {/* Histórico */}
      {history.length > 1 && (
        <div className="chart-grid" style={{ marginTop: 'var(--space-4)' }}>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>Horas de sueño — últimos {history.length} días</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={tickFmt} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="h" domain={[0, 10]} />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}h`]} />
                <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="4 4" label={{ value: '7h rec.', fill: '#22c55e', fontSize: 10 }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>Fases del sueño — tendencia</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={tickFmt} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="h" />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}h`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="deep" stroke="#3b82f6" strokeWidth={2} dot={false} name="Profundo" />
                <Line type="monotone" dataKey="rem" stroke="#22c55e" strokeWidth={2} dot={false} name="REM" />
                <Line type="monotone" dataKey="light" stroke="#eab308" strokeWidth={2} dot={false} name="Ligero" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Análisis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { titulo: 'Sueño profundo', ok: deep >= 1.5, texto: deep >= 1.5 ? `${deep}h es un buen nivel de sueño profundo. Favorece la recuperación muscular.` : `${deep}h es bajo. El sueño profundo es clave para recuperación física.` },
            { titulo: 'Sueño REM', ok: rem >= 1.5, texto: rem >= 1.5 ? `${rem}h de REM es adecuado. Ayuda a la consolidación de memoria.` : `${rem}h de REM es bajo. Afecta la concentración y el estado de ánimo.` },
            { titulo: 'Duración total', ok: hours >= 7, texto: hours >= 7 ? `${hours}h está dentro del rango recomendado (7-9h para adultos).` : `${hours}h está por debajo de las 7h recomendadas para adultos.` }
          ].map((item, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 12, background: item.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${item.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: item.ok ? '#22c55e' : '#ef4444', marginBottom: 6 }}>{item.ok ? '✓' : '!'} {item.titulo}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.texto}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function SaludSection({ data }) {
  const heart = data?.heart || {}
  const { resting = 0, avg7d = 0, delta = 0, history = [], series = [] } = heart
  const tickFmt = d => d ? d.slice(5) : ''

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">FC reposo hoy</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#ef4444', margin: '8px 0' }}>{resting || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>bpm</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Promedio 7 días</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#f87171', margin: '8px 0' }}>{avg7d || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>bpm</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Diferencia vs promedio</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: delta > 0 ? '#ef4444' : '#22c55e', margin: '8px 0' }}>
            {delta > 0 ? '+' : ''}{delta || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>bpm</div>
        </div>
      </div>

      <div className="chart-grid">
        {history.length > 1 && (
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>FC reposo — últimos {history.length} días</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={tickFmt} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit=" bpm" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v} bpm`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="resting" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="FC reposo" />
                <Line type="monotone" dataKey="avg7d" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Promedio 7d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {series.length > 0 && (
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>FC durante el día</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit=" bpm" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v} bpm`]} />
                <Line type="monotone" dataKey="bpm" stroke="#f87171" strokeWidth={2} dot={false} name="FC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  )
}

function PesoSection({ data }) {
  const weight = data?.weight || {}
  const { current = 0, history = [] } = weight
  const min = history.length ? Math.min(...history.map(h => h.kg)) : 0
  const max = history.length ? Math.max(...history.map(h => h.kg)) : 0
  const first = history[0]?.kg || 0
  const diff = current && first ? round1(current - first) : 0
  const tickFmt = d => d ? d.slice(5) : ''
  function round1(n) { return Math.round(n * 10) / 10 }

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Peso actual</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--accent-primary)', margin: '8px 0' }}>{current}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>kg</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Mínimo registrado</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>{min || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>kg</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Cambio total</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: diff < 0 ? '#22c55e' : diff > 0 ? '#ef4444' : 'var(--text-secondary)', margin: '8px 0' }}>
            {diff > 0 ? '+' : ''}{diff || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>kg desde el inicio</div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Evolución del peso — {history.length} registros</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={history} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={tickFmt} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit=" kg" domain={[Math.floor(min) - 1, Math.ceil(max) + 1]} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v} kg`]} />
              <ReferenceLine y={current} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="kg" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-primary)' }} name="Peso" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {history.length > 1 && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h2 className="h2" style={{ marginBottom: 16 }}>Historial de registros</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Fecha</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Peso</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Cambio</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((w, i, arr) => {
                  const prev = arr[i + 1]?.kg
                  const delta = prev ? round1(w.kg - prev) : null
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px' }}>{w.date}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{w.kg} kg</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: delta === null ? 'var(--text-secondary)' : delta < 0 ? '#22c55e' : delta > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                        {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta} kg`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function ActividadesSection({ data }) {
  const acts = data?.activities || []
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('todos')

  const tipos = ['todos', ...Array.from(new Set(acts.map(a => a.type).filter(Boolean)))]
  const filtradas = acts.filter(a => {
    const matchTipo = tipoFiltro === 'todos' || a.type === tipoFiltro
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase())
    return matchTipo && matchSearch
  })
  const totalKm = filtradas.reduce((s, a) => s + (a.km || 0), 0)
  const totalKcal = filtradas.reduce((s, a) => s + (a.calories || 0), 0)
  const avgHR = filtradas.filter(a => a.hr).length
    ? Math.round(filtradas.filter(a => a.hr).reduce((s, a) => s + a.hr, 0) / filtradas.filter(a => a.hr).length) : 0

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Actividades</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-primary)', margin: '6px 0' }}>{filtradas.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>en vista actual</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">Distancia total</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#22c55e', margin: '6px 0' }}>{totalKm.toFixed(1)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>km</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="label">FC prom</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#ef4444', margin: '6px 0' }}>{avgHR || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>bpm</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar actividad..."
              style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tipos.map(t => (
              <button key={t} onClick={() => setTipoFiltro(t)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.15s', background: tipoFiltro === t ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: tipoFiltro === t ? '#fff' : 'var(--text-secondary)' }}>
                {t === 'todos' ? 'Todos' : (TYPE_LABELS[t] || t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="h2" style={{ marginBottom: 16 }}>{filtradas.length} actividad{filtradas.length !== 1 ? 'es' : ''}{tipoFiltro !== 'todos' ? ` · ${TYPE_LABELS[tipoFiltro] || tipoFiltro}` : ''}</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Actividad','Tipo','Distancia','FC prom','Calorías','Fecha'].map((h, i) => (
                  <th key={i} style={{ textAlign: i < 2 ? 'left' : 'right', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Sin resultados</td></tr>
              ) : filtradas.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.name || '—'}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{TYPE_LABELS[a.type] || a.type || '—'}</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{a.km > 0 ? `${a.km} km` : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f87171' }}>{a.hr ? `${a.hr} bpm` : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>{a.calories ? `${a.calories} kcal` : '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{a.date ? a.date.slice(0, 10) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtradas.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Total calorías: <strong style={{ color: 'var(--text-primary)' }}>{totalKcal.toLocaleString()} kcal</strong></span>
            <span>Distancia total: <strong style={{ color: 'var(--text-primary)' }}>{totalKm.toFixed(1)} km</strong></span>
          </div>
        )}
      </div>
    </>
  )
}

export default function App() {
  const [section, setSection] = useState('resumen')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/summary.json`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const zoneData = data ? [
    {name:'Z1 Base', min: data.training?.zones?.z1||0, color:'#3b82f6'},
    {name:'Z2 Aeróbico', min: data.training?.zones?.z2||0, color:'#22c55e'},
    {name:'Z3 Umbral', min: data.training?.zones?.z3||0, color:'#eab308'},
    {name:'Z4 Duro', min: data.training?.zones?.z4||0, color:'#f97316'},
    {name:'Z5 Máximo', min: data.training?.zones?.z5||0, color:'#ef4444'},
  ] : []

  return (
    <div className="app-shell">
      <Sidebar active={section} onChange={setSection} />
      <main className="main-content">
        <header style={{ marginBottom: 'var(--space-6)' }}>
          <div className="label">Tu progreso</div>
          <h1 className="h1" style={{ marginTop: 4 }}>
            {section === 'resumen' && 'Resumen general'}
            {section === 'actividades' && 'Actividades'}
            {section === 'salud' && 'Salud'}
            {section === 'sueno' && 'Sueño'}
            {section === 'entrenamiento' && 'Entrenamiento'}
            {section === 'peso' && 'Peso y composición'}
            {section === 'coach' && 'Coach IA'}
          </h1>
        </header>
        {!data ? (
          <div className="card"><EmptyState /></div>
        ) : (
          <>
            {section === 'resumen' && (
              <>
                <div className="kpi-grid">
                  <KPICard label="Pasos hoy" value={data.steps?.today} unit="pasos" delta={data.steps?.delta} sparkData={data.steps?.spark} color="var(--metric-activity)" icon={Footprints} />
                  <KPICard label="FC reposo" value={data.heart?.resting} unit="bpm" delta={data.heart?.delta} sparkData={data.heart?.spark} color="var(--metric-heart)" icon={Heart} />
                  <KPICard label="Sueño" value={data.sleep?.hours} unit="hrs" delta={data.sleep?.delta} sparkData={data.sleep?.spark} color="var(--metric-sleep)" icon={Moon} />
                  <KPICard label="Body Battery" value={data.bodyBattery?.current} unit="/100" delta={data.bodyBattery?.delta} sparkData={data.bodyBattery?.spark} color="var(--metric-recovery)" icon={Battery} />
                  <KPICard label="Calorías" value={data.calories?.today} unit="kcal" delta={data.calories?.delta} sparkData={data.calories?.spark} color="var(--metric-stress)" icon={Flame} />
                  <KPICard label="VO2max" value={data.vo2max?.current} unit="ml/kg" delta={data.vo2max?.delta} sparkData={data.vo2max?.spark} color="var(--accent-primary)" icon={Activity} />
                </div>
                <div className="chart-grid">
                  <div className="card">
                    <h2 className="h2">Tendencia semanal</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.weeklyTrend||[]} margin={{top:8,right:8,left:-20,bottom:0}}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="week" tick={{fontSize:11,fill:'var(--text-secondary)'}}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}}/>
                        <Tooltip contentStyle={{background:'#1a1d2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                        <Legend wrapperStyle={{fontSize:12}}/>
                        <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={2} dot={false} name="Distancia (km)"/>
                        <Line type="monotone" dataKey="kcal" stroke="#f97316" strokeWidth={2} dot={false} name="Calorías (kcal)"/>
                        <Line type="monotone" dataKey="fc" stroke="#ef4444" strokeWidth={2} dot={false} name="FC prom (bpm)"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <h2 className="h2">Últimas actividades</h2>
                    <div style={{overflowX:'auto',marginTop:16}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                        <thead>
                          <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                            <th style={{textAlign:'left',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>Actividad</th>
                            <th style={{textAlign:'left',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>Tipo</th>
                            <th style={{textAlign:'right',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>Distancia</th>
                            <th style={{textAlign:'right',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>FC prom</th>
                            <th style={{textAlign:'right',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>Calorías</th>
                            <th style={{textAlign:'right',padding:'8px 12px',color:'var(--text-secondary)',fontWeight:500}}>Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.activities||[]).map((a,i)=>(
                            <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',transition:'background 0.15s'}}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <td style={{padding:'10px 12px',fontWeight:500}}>{a.name||'—'}</td>
                              <td style={{padding:'10px 12px',color:'var(--text-secondary)',textTransform:'capitalize'}}>{a.type||'—'}</td>
                              <td style={{padding:'10px 12px',textAlign:'right'}}>{a.km>0?`${a.km} km`:'—'}</td>
                              <td style={{padding:'10px 12px',textAlign:'right',color:'#f87171'}}>{a.hr?`${a.hr} bpm`:'—'}</td>
                              <td style={{padding:'10px 12px',textAlign:'right'}}>{a.calories?`${a.calories} kcal`:'—'}</td>
                              <td style={{padding:'10px 12px',textAlign:'right',color:'var(--text-secondary)'}}>{a.date?a.date.slice(0,10):'—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {section === 'actividades' && <ActividadesSection data={data} />}
            {section === 'sueno' && <SuenioSection data={data} />}
            {section === 'salud' && <SaludSection data={data} />}

            {section === 'entrenamiento' && (
              <>
                <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                  <div className="card" style={{textAlign:'center'}}>
                    <div className="label">VO2max actual</div>
                    <div style={{fontSize:48,fontWeight:700,color:'var(--accent-primary)',margin:'8px 0'}}>{data.vo2max?.current}</div>
                    <div style={{fontSize:13,color:'var(--text-secondary)'}}>ml/kg/min</div>
                  </div>
                  <div className="card" style={{textAlign:'center'}}>
                    <div className="label">Efecto aeróbico</div>
                    <div style={{fontSize:48,fontWeight:700,color:'#22c55e',margin:'8px 0'}}>{data.training?.effects?.[data.training.effects.length-1]?.aerobic||0}</div>
                    <div style={{fontSize:13,color:'var(--text-secondary)'}}>{data.training?.effects?.[data.training.effects.length-1]?.label||'—'}</div>
                  </div>
                  <div className="card" style={{textAlign:'center'}}>
                    <div className="label">Actividades totales</div>
                    <div style={{fontSize:48,fontWeight:700,color:'#f97316',margin:'8px 0'}}>{(data.training?.activityTypes||[]).reduce((s,t)=>s+t.count,0)}</div>
                    <div style={{fontSize:13,color:'var(--text-secondary)'}}>registradas</div>
                  </div>
                </div>
                <div className="chart-grid">
                  <div className="card">
                    <h2 className="h2">VO2max en el tiempo</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data.vo2max?.trend||[]} margin={{top:8,right:8,left:-20,bottom:0}}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--text-secondary)'}} tickFormatter={d=>d.slice(5)}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}} domain={['auto','auto']}/>
                        <Tooltip contentStyle={{background:'#1a1d2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                        <Line type="monotone" dataKey="vo2" stroke="#8b5cf6" strokeWidth={2} dot={{r:3,fill:'#8b5cf6'}} name="VO2max"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <h2 className="h2">Tiempo en zonas de FC</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={zoneData} margin={{top:8,right:8,left:-20,bottom:0}}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--text-secondary)'}}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}} unit=" min"/>
                        <Tooltip contentStyle={{background:'#1a1d2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}} formatter={(v)=>[`${v} min`]}/>
                        {zoneData.map((z,i)=>(<Bar key={i} dataKey="min" fill={z.color} radius={[4,4,0,0]} name={z.name}/>))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="chart-grid">
                  <div className="card">
                    <h2 className="h2">Distribución de actividades</h2>
                    <div style={{display:'flex',alignItems:'center',gap:24}}>
                      <ResponsiveContainer width={180} height={180}>
                        <PieChart>
                          <Pie data={data.training?.activityTypes||[]} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}>
                            {(data.training?.activityTypes||[]).map((_,i)=>(<Cell key={i} fill={TYPE_COLORS[i%TYPE_COLORS.length]}/>))}
                          </Pie>
                          <Tooltip contentStyle={{background:'#1a1d2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{flex:1}}>
                        {(data.training?.activityTypes||[]).map((t,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                            <div style={{width:10,height:10,borderRadius:'50%',background:TYPE_COLORS[i%TYPE_COLORS.length]}}/>
                            <span style={{fontSize:13,textTransform:'capitalize',flex:1}}>{t.type}</span>
                            <span style={{fontSize:13,color:'var(--text-secondary)'}}>{t.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <h2 className="h2">Efecto de entrenamiento</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.training?.effects||[]} margin={{top:8,right:8,left:-20,bottom:0}}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="date" tick={{fontSize:10,fill:'var(--text-secondary)'}} tickFormatter={d=>d.slice(5)}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}} domain={[0,5]}/>
                        <Tooltip contentStyle={{background:'#1a1d2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                        <Legend wrapperStyle={{fontSize:12}}/>
                        <Bar dataKey="aerobic" fill="#22c55e" radius={[4,4,0,0]} name="Aeróbico"/>
                        <Bar dataKey="anaerobic" fill="#f97316" radius={[4,4,0,0]} name="Anaeróbico"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {section === 'peso' && <PesoSection data={data} />}
            {section === 'coach' && <CoachSection data={data} />}
          </>
        )}
      </main>
    </div>
  )
}