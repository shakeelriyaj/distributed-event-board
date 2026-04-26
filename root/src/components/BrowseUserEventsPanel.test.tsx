import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CrossRepoRecordGlassBox, isForeignRepo } from './BrowseUserEventsPanel'

describe('BrowseUserEventsPanel glass-box metadata', () => {
  it('renders foreign repo DID correctly in glass-box metadata', () => {
    const html = renderToStaticMarkup(
      <CrossRepoRecordGlassBox
        uri="at://did:plc:other/org.community.event/abc123"
        cid="bafytest"
        resolvedHandle="other.bsky.social"
        resolvedPds="https://bsky.social"
        sessionDid="did:plc:mine"
      />,
    )
    expect(html).toContain('did:plc:other')
    expect(html).toContain('@other.bsky.social')
    expect(html).toContain('org.community.event')
    expect(html).toContain('abc123')
    expect(html).toContain('bafytest')
  })

  it('shows foreign repo badge when repo DID differs from session DID', () => {
    expect(isForeignRepo('did:plc:other', 'did:plc:mine')).toBe(true)
  })
})
