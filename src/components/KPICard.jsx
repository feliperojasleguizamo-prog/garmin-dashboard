import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export function KPICard({
  label,
  value,
  unit,
  delta,
  sparkData,
  color = 'var(--accent-primary)',
  icon: Icon,
}) {
  const deltaClass = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const DeltaIcon  = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus

  // Convierte el color CSS en formato usable para rgba
  // (si es una variable CSS, usamos opacity directo sobre el elemento)
  const isVar = color.startsWith('var(')

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '20px 22px 16px' }}>

      {/* Barra de color superior — identifica la métrica */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: color,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        opacity: 0.85,
      }} />

      {/* Brillo sutil de fondo con el color de la métrica */}
      <div style={{
        position: 'absolute',
        top: -30, right: -30,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: color,
        opacity: 0.04,
        pointerEvents: 'none',
        filter: 'blur(20px)',
      }} />

      {/* Fila superior: etiqueta + icono */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <div className="label">{label}</div>
        {Icon && (
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}>
            <Icon size={15} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 5,
        marginBottom: 10,
      }}>
        <span className="metric-value" style={{ color }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span className="metric-unit">{unit}</span>
        )}
      </div>

      {/* Delta */}
      <div style={{ marginBottom: sparkData?.length ? 12 : 0 }}>
        {delta != null ? (
          <span className={`delta ${deltaClass}`}>
            <DeltaIcon size={11} strokeWidth={3} />
            {Math.abs(delta)}% vs. semana anterior
          </span>
        ) : (
          <span className="delta flat">
            <Minus size={11} strokeWidth={3} />
            Sin datos previos
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div style={{ height: 36, marginLeft: -8, marginRight: -8, marginBottom: -4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData.map((v, i) => ({ i, value: v }))}>
              <defs>
                <linearGradient id={`grad-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${label.replace(/\s/g,'')})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
