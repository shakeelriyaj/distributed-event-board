export type SourceBadgeVariant = 'pds-list-records' | 'mock-feed' | 'future-appview' | 'handle-pds-direct'

const STYLES: Record<
  SourceBadgeVariant,
  { label: string; background: string; color: string; border: string }
> = {
  'pds-list-records': {
    label: 'Source: PDS/listRecords',
    background: '#ecfdf5',
    color: '#065f46',
    border: '#6ee7b7',
  },
  'mock-feed': {
    label: 'Source: Mock Feed',
    background: '#fffbeb',
    color: '#92400e',
    border: '#fcd34d',
  },
  'future-appview': {
    label: 'Source: Future AppView',
    background: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
  },
  'handle-pds-direct': {
    label: "Source: from handle's PDS directly",
    background: '#eef2ff',
    color: '#3730a3',
    border: '#a5b4fc',
  },
}

export function SourceBadge({ variant, labelOverride }: { variant: SourceBadgeVariant; labelOverride?: string }) {
  const s = STYLES[variant]
  return (
    <span
      role="status"
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        padding: '4px 10px',
        borderRadius: '999px',
        border: `1px solid ${s.border}`,
        background: s.background,
        color: s.color,
      }}
    >
      {labelOverride ?? s.label}
    </span>
  )
}
