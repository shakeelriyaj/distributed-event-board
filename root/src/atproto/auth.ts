import { agent } from './agent';

export async function loginAsMaster() {
  // 1. THE GATEKEEPER: If we already have a session, skip the login logic entirely.
  if (agent.session) {
    return;
  }

  const identifier = import.meta.env.VITE_ATP_IDENTIFIER;
  const password = import.meta.env.VITE_ATP_PASSWORD;

  if (!identifier || !password) {
    throw new Error('Missing ATProto Credentials in .env file');
  }

  // 2. Extra safety: Check if a login is ALREADY in progress
  // (Optional, but good for fast double-clicks)
  console.log('🔑 Attempting Master Account Auth...');
  
  try {
    await agent.login({
      identifier: identifier,
      password: password,
    });
    console.log('✅ Master Account Authenticated:', identifier);
  } catch (err: any) {
    // If we get a "Concurrent login" error, we can ignore it because 
    // it means another part of the app already handled it.
    if (err.message?.includes('Concurrent login')) {
      console.log('⚠️ Login already in progress, skipping...');
      return;
    }
    throw err;
  }
}