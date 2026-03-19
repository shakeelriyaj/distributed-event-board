import { silentPublishEvent } from './src/atproto/events';
import * as dotenv from 'dotenv';

// Load your credentials
dotenv.config();

async function runTest() {
  console.log("Starting Sandbox Test...");

  try {
    const testData = {
      title: "Decentralized Study Session",
      description: "Testing our AT Protocol Event Board. Join us for coffee and code!",
      eventDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      location: "University Library, Room 402"
    };

    console.log("Attempting to publish to the network...");
    const uri = await silentPublishEvent(testData);

    console.log("✅ SUCCESS!");
    console.log("Event URI:", uri);
    console.log("Your event is now live on the decentralized web.");
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
  }
}

runTest();