import { useMemo, useState } from 'react';
import { getAtprotoConfig } from '../lib/atproto/config';
import { resolveIdentity, type IdentitySnapshot } from '../lib/atproto/identity';
import {
  getCurrentSessionSnapshot,
  loginAndGetSession,
  type SessionSnapshot,
} from '../lib/atproto/session';

export const AtprotoVerificationPanel = () => {
  const config = useMemo(() => getAtprotoConfig(), []);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionSnapshot | null>(getCurrentSessionSnapshot());
  const [identity, setIdentity] = useState<IdentitySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextSession = await loginAndGetSession();
      setSession(nextSession);
      const nextIdentity = await resolveIdentity();
      setIdentity(nextIdentity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify ATProto connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="atp-verify">
      <div className="atp-verify__header">
        <h2>ATProto Connectivity Check (Pass 1)</h2>
        <p>Verify login, active session DID/handle, and identifier resolution from the browser.</p>
      </div>

      <div className="atp-verify__row">
        <button type="button" onClick={verify} disabled={loading}>
          {loading ? 'Verifying...' : 'Login + Resolve Identity'}
        </button>
        <span className="atp-verify__status">
          {session ? `Session active: ${session.handle}` : 'No active session yet'}
        </span>
      </div>

      <div className="atp-verify__cards">
        <article className="atp-verify__card">
          <h3>Config</h3>
          <ul>
            <li>
              <strong>Service:</strong> {config.service}
            </li>
            <li>
              <strong>Identifier:</strong> {config.identifier || 'Missing'}
            </li>
            <li>
              <strong>Password:</strong> {config.password ? 'Configured' : 'Missing'}
            </li>
          </ul>
        </article>

        <article className="atp-verify__card">
          <h3>Session</h3>
          {session ? (
            <ul>
              <li>
                <strong>DID:</strong> {session.did}
              </li>
              <li>
                <strong>Handle:</strong> {session.handle}
              </li>
              <li>
                <strong>JWT prefix:</strong> {session.accessJwtPrefix ?? 'n/a'}...
              </li>
            </ul>
          ) : (
            <p>No session data yet.</p>
          )}
        </article>

        <article className="atp-verify__card">
          <h3>Identity Resolution</h3>
          {identity ? (
            <ul>
              <li>
                <strong>Input identifier:</strong> {identity.inputIdentifier || 'n/a'}
              </li>
              <li>
                <strong>Resolved DID:</strong> {identity.resolvedDidFromHandle ?? 'n/a'}
              </li>
              <li>
                <strong>Session DID:</strong> {identity.sessionDid ?? 'n/a'}
              </li>
              <li>
                <strong>Session handle:</strong> {identity.sessionHandle ?? 'n/a'}
              </li>
            </ul>
          ) : (
            <p>Run verification to fetch identity metadata.</p>
          )}
        </article>
      </div>

      {error && <p className="atp-verify__error">Error: {error}</p>}
    </section>
  );
};
