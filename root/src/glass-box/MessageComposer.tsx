import { useMemo, useState, type FormEvent } from 'react'
import { mockEncrypt } from './cryptoMock'

const RECIPIENTS = ['@alice.lab', '@bob.lab', '@charlie.lab']

type Props = {
  onSend: (plaintext: string, to: string) => void
  disabled?: boolean
}

export function MessageComposer({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [to, setTo] = useState(RECIPIENTS[0])

  const cipherPreview = useMemo(() => {
    if (!text.trim()) return '—'
    return mockEncrypt(text)
  }, [text])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim(), to)
    setText('')
  }

  return (
    <section className="gb-panel gb-composer">
      <header className="gb-panel__head">
        <h2 className="gb-panel__title">Compose</h2>
        <p className="gb-panel__sub">
          Cleartext never leaves this panel unencrypted. Compare before / after, then publish to the repo.
        </p>
      </header>

      <form className="gb-composer__form" onSubmit={submit}>
        <label className="gb-field">
          <span className="gb-field__label">Recipient</span>
          <select
            className="gb-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={disabled}
          >
            {RECIPIENTS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>

        <label className="gb-field">
          <span className="gb-field__label">Message (plaintext)</span>
          <textarea
            className="gb-input gb-input--area"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a sensitive note…"
            disabled={disabled}
          />
        </label>

        <div className="gb-split">
          <div className="gb-split__col">
            <div className="gb-split__title">Before encryption</div>
            <pre className="gb-pre gb-pre--soft">{text || '—'}</pre>
          </div>
          <div className="gb-split__col">
            <div className="gb-split__title">After encryption (mock)</div>
            <pre className="gb-pre gb-pre--cipher" title={cipherPreview}>
              {text.trim() ? cipherPreview.slice(0, 120) + (cipherPreview.length > 120 ? '…' : '') : '—'}
            </pre>
          </div>
        </div>

        <button type="submit" className="gb-btn gb-btn--primary" disabled={disabled || !text.trim()}>
          Encrypt &amp; publish to PDS
        </button>
      </form>
    </section>
  )
}
