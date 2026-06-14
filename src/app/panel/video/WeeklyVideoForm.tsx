'use client'

import { useActionState } from 'react'
import { saveWeeklyVideo } from '@/app/panel/actions'

export default function WeeklyVideoForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(saveWeeklyVideo, null)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
      <input
        className="svc-input"
        name="video"
        defaultValue={current}
        placeholder="https://www.youtube.com/watch?v=..."
        required
      />
      {current && (
        <div style={{ fontSize: '.8rem', color: 'var(--gray)' }}>
          Video actual: <code>{current}</code>
        </div>
      )}
      {state?.ok && <div className="svc-feedback ok">✓ Video actualizado. Ya se ve en la página.</div>}
      {state && !state.ok && <div className="svc-feedback err">✗ {state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? 'Guardando…' : 'Guardar video'}
      </button>
    </form>
  )
}