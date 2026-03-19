import { AtpAgent } from '@atproto/api';

// This is your main connection to the network
export const agent = new AtpAgent({
  service: 'https://bsky.social', // Default PDS; can be changed for self-hosted users
});