import { agent } from './agent';
import * as dotenv from 'dotenv';

dotenv.config(); // Loads the .env variables into process.env

export async function loginAsMaster() {
  try {
    // Only login if we aren't already logged in
    if (agent.session) return agent.session;

    const response = await agent.login({
      identifier: process.env.ATP_IDENTIFIER!,
      password: process.env.ATP_PASSWORD!,
    });

    console.log(" Master Account Authenticated:", response.data.handle);
    return response.data;
  } catch (error) {
    console.error(" Master login failed. Check your .env file:", error);
    throw error;
  }
}