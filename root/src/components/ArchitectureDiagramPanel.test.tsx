import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArchitectureDiagramPanel } from './ArchitectureDiagramPanel'

describe('ArchitectureDiagramPanel', () => {
  it('marks cross-repo path as implemented', () => {
    const html = renderToStaticMarkup(<ArchitectureDiagramPanel />)
    expect(html).toContain('CROSS-REPO READ (IMPLEMENTED)')
    expect(html).toContain('✅ resolveHandle')
    expect(html).toContain('✅ PDS B (foreign repo)')
    expect(html).toContain('✅ listRecords')
    expect(html).toContain('✅ render')
  })
})
