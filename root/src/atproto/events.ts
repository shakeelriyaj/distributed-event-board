import { agent } from './agent';
import { loginAsMaster } from './auth';
import type { Record as EventRecord } from '../lexicons/types/org/community/event';

type SilentPublishEventInput = {
  title: EventRecord['title']
  description: EventRecord['description']
  eventDate: EventRecord['eventDate']
  location?: EventRecord['location']
}

export async function silentPublishEvent(formData: SilentPublishEventInput) {
  await loginAsMaster();

  // Create the base record with required fields
  const record: EventRecord = {
    $type: 'org.community.event',
    title: formData.title,
    description: formData.description,
    eventDate: formData.eventDate,
    createdAt: new Date().toISOString(),
  };

  // Only add location if it actually exists in the form
  if (formData.location) {
    record.location = formData.location;
  }

  const response = await agent.com.atproto.repo.createRecord({
    repo: agent.session!.did,
    collection: 'org.community.event',
    record: record,
  });

  return response.data.uri;
}