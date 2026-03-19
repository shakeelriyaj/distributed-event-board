import { agent } from './agent';
import { loginAsMaster } from './auth';
import { Record as EventRecord } from '../lexicons/types/org/community/event';

export async function silentPublishEvent(formData: Omit<EventRecord, 'createdAt'>) {
  // 1. Ensure we are logged in as the Master Account
  await loginAsMaster();

  // 2. Prepare the record with the timestamp
  const record: EventRecord = {
    ...formData,
    createdAt: new Date().toISOString(),
  };

  // 3. Push to the AT Protocol network
  const response = await agent.com.atproto.repo.createRecord({
    repo: agent.session!.did,
    collection: 'org.community.event',
    record: record,
  });

  return response.uri; // Returns the "AT URI" (the decentralized link to the post)
}