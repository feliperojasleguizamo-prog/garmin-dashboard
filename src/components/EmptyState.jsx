import { Database, RefreshCw } from 'lucide-react'

export function EmptyState({ message = 'Aún no hay datos sincronizados' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8) var(--space-5)',
      textAlign: 'center',
      gap: 'var(--space-4)',
      minHeight: 280,
    }}>
      <div style={{
        background: 'rgba(79, 158, 255, 0.08)',
        padding: 16,
        borderRadius: '50%',
        color: 'var(--accent-primary)',
      }}>
        <Database size={28} strokeWidth={2} />
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{message}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 360 }}>
          Ejecuta el script de exportación de Garmin para empezar a ver tus métricas aquí.
        </p>
      </div>
      <code style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        background: 'var(--bg-elevated)',
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
      }}>
        bash garmin-export.sh
      </code>
    </div>
  )
}