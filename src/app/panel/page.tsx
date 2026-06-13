import { createAdminClient } from '@/utils/supabase/admin'
import { colombiaToday } from '@/lib/date'
import { savePrediction } from './actions'
import SendButton from '@/components/panel/SendButton'

export default async function PanelHome() {
  const date = colombiaToday()
  const admin = createAdminClient()

  const { data: predictions } = await admin
    .from('predictions')
    .select('position, title, pdf_path')
    .eq('match_date', date)
    .order('position')

  const byPosition = new Map((predictions ?? []).map((p) => [p.position, p]))
  const positions = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div>
      <h1 className="panel-title">Pronósticos del día</h1>
      <p className="panel-sub">{date}</p>

      <div className="panel-guide">
        <strong>Cómo publicar los pronósticos de hoy</strong>
        <ol>
          <li>En cada posición, escribe el título del partido.</li>
          <li>Sube el PDF de ese pronóstico.</li>
          <li>
            Pulsa <b>Guardar</b> en esa fila. <em>Hasta que no guardes, el PDF no se sube.</em>
          </li>
          <li>
            Cuando estén listas las posiciones que vas a enviar, pulsa{' '}
            <b>Enviar pronósticos de hoy</b> al final.
          </li>
        </ol>
        <p className="panel-guide-note">
          El plan de 1 recibe la posición 1; el de 3, las posiciones 1 a 3; el de 8, las 8. Llena las
          posiciones en orden, sin saltarte ninguna.
        </p>
      </div>

      <div className="pred-list">
        {positions.map((pos) => {
          const existing = byPosition.get(pos)
          const hasPdf = !!existing?.pdf_path
          const exists = !!existing

          return (
            <form key={pos} action={savePrediction} className={`pred-card ${hasPdf ? 'is-ready' : ''}`}>
              <input type="hidden" name="position" value={pos} />

              <div className="pred-card-head">
                <span className="pred-pos">{pos}</span>
                <span
                  className={`pred-badge ${hasPdf ? 'ok' : exists ? 'warn' : 'pending'}`}
                >
                  {hasPdf
                    ? 'Guardado · PDF cargado ✓'
                    : exists
                      ? 'Guardado · falta el PDF'
                      : 'Pendiente'}
                </span>
              </div>

              <input
                type="text"
                name="title"
                defaultValue={existing?.title ?? ''}
                placeholder={`Título del pronóstico ${pos} (ej. Real Madrid vs Barcelona)`}
                className="pred-input"
                required
              />

              <div className="pred-card-foot">
                <label className="pred-filewrap">
                  <span className="pred-filelabel">
                    {hasPdf ? 'Reemplazar PDF (opcional)' : 'Subir PDF'}
                  </span>
                  <input type="file" name="pdf" accept="application/pdf" />
                </label>
                <button type="submit" className="btn btn-primary pred-save">
                  Guardar
                </button>
              </div>
            </form>
          )
        })}
      </div>

      <div className="pred-send">
        <p className="pred-send-hint">
          Esto envía un correo a cada suscriptor con los PDFs que le correspondan según su plan.
        </p>
        <SendButton />
      </div>
    </div>
  )
}