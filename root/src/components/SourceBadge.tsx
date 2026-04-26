export type SourceBadgeVariant = 'pds-list-records' | 'mock-feed' | 'future-appview' | 'handle-pds-direct'

const META: Record<SourceBadgeVariant, { label: string; cls: string }> = {
  'pds-list-records': { label: 'PDS · listRecords', cls: 'en-srcbadge--pds' },
  'mock-feed': { label: 'Mock feed', cls: 'en-srcbadge--mock' },
  'future-appview': { label: 'Future AppView', cls: 'en-srcbadge--future' },
  'handle-pds-direct': { label: "Handle's PDS · direct", cls: 'en-srcbadge--handle' },
}

export function SourceBadge({
  variant,
  labelOverride,
}: {
  variant: SourceBadgeVariant
  labelOverride?: string
}) {
  const m = META[variant]
  return (
    <span role="status" className={`en-srcbadge ${m.cls}`}>
      {labelOverride ?? m.label}
    </span>
  )
}
