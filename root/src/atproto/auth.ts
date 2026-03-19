import { agent } from './agent';


export async function loginAsMaster() {
  try {
    // Only login if we aren't already logged in
    if (agent.session) return agent.session;

    const response = await agent.login({
      identifier: import.meta.env.VITE_ATP_IDENTIFIER,
      password: import.meta.env.VITE_ATP_PASSWORD,
    });

    console.log(" Master Account Authenticated:", response.data.handle);
    return response.data;
  } catch (error) {
    console.error(" Master login failed. Check your .env file:", error);
    throw error;
  }
}