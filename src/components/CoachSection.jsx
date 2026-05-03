import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, Zap } from 'lucide-react'

// Lee la clave de API desde el archivo .env
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY

// Construye el contexto con tus datos reales de Garmin
function buildSystemPrompt(data) {
  if (!data) return 'Eres un coach deportivo de élite. No hay datos disponibles todavía.'

  const { heart, sleep, steps, vo2max, weight, activities, training, bodyBattery } = data
  const lastActs = (activities || []).slice(0, 5)

  return `Eres un coach deportivo de élite especializado en running y rendimiento. Tienes acceso a los datos biométricos y de entrenamiento REALES del atleta. Responde siempre en español, de forma clara, directa y con base en los datos disponibles. Sé honesto si algo indica un problema o riesgo. No uses jerga excesiva. Cuando des recomendaciones, explica brevemente el "por qué" usando los datos del atleta.

DATOS DEL ATLETA (actualizados con la última sincronización):

RECUPERACIÓN Y SALUD:
- FC en reposo hoy: ${heart?.resting || '—'} bpm
- Promedio FC reposo 7 días: ${heart?.avg7d || '—'} bpm
- Diferencia vs promedio: ${heart?.delta != null ? (heart.delta > 0 ? '+' : '') + heart.delta + ' bpm' : '—'}
- Body Battery: ${bodyBattery?.current || '—'}/100

SUEÑO (última noche):
- Total: ${sleep?.hours || '—'} horas
- Sueño profundo: ${sleep?.deep || '—'} h
- Sueño REM: ${sleep?.rem || '—'} h
- Sueño ligero: ${sleep?.light || '—'} h
- Score de sueño: ${sleep?.score || '—'}/100

ACTIVIDAD:
- Pasos hoy: ${steps?.today?.toLocaleString('es-CO') || '—'}
- VO2max estimado: ${vo2max?.current || '—'} ml/kg/min
- Peso actual: ${weight?.current || '—'} kg

ÚLTIMAS 5 ACTIVIDADES:
${lastActs.map(a =>
  `- ${a.date?.slice(0, 10) || '—'} | ${a.name || 'Sin nombre'} (${a.type || '—'}) | ${a.km > 0 ? a.km + ' km' : 'sin distancia'} | FC prom: ${a.hr ? a.hr + ' bpm' : '—'} | ${a.calories ? a.calories + ' kcal' : '—'}`
).join('\n') || '- Sin actividades registradas'}

ZONAS DE FC ACUMULADAS (minutos totales en cada zona):
- Z1 Base (suave): ${training?.zones?.z1 || 0} min
- Z2 Aeróbico (moderado): ${training?.zones?.z2 || 0} min
- Z3 Umbral (fuerte): ${training?.zones?.z3 || 0} min
- Z4 Duro (muy fuerte): ${training?.zones?.z4 || 0} min
- Z5 Máximo (explosivo): ${training?.zones?.z5 || 0} min

INSTRUCCIONES:
- Si preguntan por recuperación: usa FC reposo, sueño y Body Battery como indicadores principales
- Si preguntan por el entrenamiento de hoy: considera el sueño, la FC reposo y el Body Battery para recomendar intensidad
- Si preguntan por rendimiento: usa VO2max, zonas de FC y actividades recientes
- Si la FC reposo está elevada (>5 bpm sobre el promedio) o el sueño es bajo (<6h), sé conservador con las recomendaciones de carga
- Responde de forma concisa pero completa. Máximo 4 párrafos por respuesta`
}

// Preguntas de ejemplo para inspirar al usuario
const SUGGESTED_QUESTIONS = [
  '¿Puedo entrenar duro hoy?',
  '¿Cómo estuvo mi sueño anoche?',
  '¿Cuál es mi tendencia de VO2max?',
  '¿En qué zona debo correr hoy?',
  '¿Estoy sobreentrenando?',
  '¿Cómo mejorar mi sueño profundo?',
]

export function CoachSection({ data }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu coach de IA personal. Ya cargué tus datos más recientes:\n\n• Sueño: ${data?.sleep?.hours || '—'}h (score ${data?.sleep?.score || '—'}/100)\n• FC en reposo: ${data?.heart?.resting || '—'} bpm\n• VO2max: ${data?.vo2max?.current || '—'} ml/kg/min\n\n¿En qué te puedo ayudar hoy? Puedes preguntarme si es buen día para entrenar duro, qué significan tus métricas, cómo mejorar tu recuperación, o cualquier duda sobre tu rendimiento.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return

    if (!API_KEY) {
      setError('Falta la clave de API de Anthropic. Sigue el paso 1 de las instrucciones de configuración.')
      return
    }

    const userMsg = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: buildSystemPrompt(data),
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error?.message || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      const text = result.content?.[0]?.text || 'No se recibió respuesta.'
      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (e) {
      setError(`No se pudo conectar con el coach: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function useSuggestion(q) {
    setInput(q)
    textareaRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', gap: 'var(--space-4)' }}>

      {/* Sugerencias rápidas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => useSuggestion(q)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(79,158,255,0.1)'
              e.currentTarget.style.color = 'var(--accent-primary)'
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Área de chat */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 'var(--space-5)',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: m.role === 'user'
                  ? 'var(--accent-primary)'
                  : 'rgba(79,158,255,0.15)',
                color: m.role === 'user' ? '#fff' : 'var(--accent-primary)',
              }}
            >
              {m.role === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>

            {/* Burbuja de mensaje */}
            <div
              style={{
                maxWidth: '76%',
                padding: '10px 14px',
                borderRadius: m.role === 'user'
                  ? '16px 4px 16px 16px'
                  : '4px 16px 16px 16px',
                background: m.role === 'user'
                  ? 'var(--accent-primary)'
                  : 'var(--bg-elevated)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 14,
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Indicador de escritura (puntos animados) */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(79,158,255,0.15)',
                color: 'var(--accent-primary)',
              }}
            >
              <Bot size={15} />
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '4px 16px 16px 16px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(j => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    opacity: 0.7,
                    animation: `coachBounce 1.2s ${j * 0.2}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Ancla para auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Barra de entrada */}
      <div className="card" style={{ padding: 'var(--space-3)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
          rows={2}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.5,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            background:
              input.trim() && !loading ? 'var(--accent-primary)' : 'var(--bg-base)',
            border: `1px solid ${input.trim() && !loading ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            color: input.trim() && !loading ? '#fff' : 'var(--text-tertiary)',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 14,
            fontWeight: 500,
            height: 44,
          }}
        >
          <Zap size={15} />
          Enviar
        </button>
      </div>

      {/* Animación de los puntos de carga */}
      <style>{`
        @keyframes coachBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
