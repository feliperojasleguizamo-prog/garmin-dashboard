import { Activity, Heart, Moon, Dumbbell, Scale, Home, Bot } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'resumen',       label: 'Resumen',       icon: Home     },
  { id: 'actividades',   label: 'Actividades',   icon: Activity },
  { id: 'salud',         label: 'Salud',         icon: Heart    },
  { id: 'sueno',         label: 'Sueño',         icon: Moon     },
  { id: 'entrenamiento', label: 'Entrenamiento', icon: Dumbbell },
  { id: 'peso',          label: 'Peso',          icon: Scale    },
]

const COACH_ITEM = { id: 'coach', label: 'Coach IA', icon: Bot }

export function Sidebar({ active, onChange }) {
  function NavButton({ item, isCoach = false }) {
    const isActive = active === item.id
    const Icon = item.icon

    return (
      <button
        onClick={() => onChange(item.id)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '9px 12px 9px 16px',
          background: isActive
            ? (isCoach ? 'rgba(167,139,250,0.08)' : 'rgba(91,143,255,0.08)')
            : 'transparent',
          color: isActive
            ? (isCoach ? '#a78bfa' : 'var(--accent-primary)')
            : 'var(--text-tertiary)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          letterSpacing: '-0.01em',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-tertiary)'
          }
        }}
      >
        {isActive && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '18%',
            height: '64%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            background: isCoach
              ? 'linear-gradient(180deg, #c084fc, #a78bfa)'
              : 'linear-gradient(180deg, #7eb3ff, var(--accent-primary))',
          }} />
        )}
        <div style={{
          width: 28, height: 28,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isActive
            ? (isCoach ? 'rgba(167,139,250,0.15)' : 'rgba(91,143,255,0.12)')
            : 'transparent',
          flexShrink: 0,
          transition: 'background 0.15s ease',
        }}>
          <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        {item.label}
        {isCoach && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4,
            background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
            textTransform: 'uppercase', flexShrink: 0,
          }}>Beta</span>
        )}
      </button>
    )
  }

  return (
    <aside className="sidebar">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 'var(--space-7)', paddingLeft: 4,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7b5cff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(91,143,255,0.3)', letterSpacing: '-0.02em',
        }}>F</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Felipe</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.02em' }}>Athlete Dashboard</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 16, marginBottom: 6 }}>
          Métricas
        </div>
        {NAV_ITEMS.map(item => <NavButton key={item.id} item={item} />)}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 0' }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-disabled)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: 16, marginBottom: 6 }}>
          Inteligencia
        </div>
        <NavButton item={COACH_ITEM} isCoach />
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--success)', flexShrink: 0,
            boxShadow: '0 0 6px rgba(6,214,160,0.5)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }} />
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>Garmin conectado</div>
        </div>
      </div>
    </aside>
  )
}
