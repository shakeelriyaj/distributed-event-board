import { AtpAgent } from "@atproto/api";

/**
 * TEST SCRIPT: Post an event from ANY ATProto account.
 *
 * 1. Get an App Password from your Bluesky settings.
 * 2. Fill in the 'identifier' and 'password' below.
 * 3. Run this with: npx tsx test-post.ts
 */

async function main() {
  const agent = new AtpAgent({ service: "https://bsky.social" });

  // --- EDIT THESE FOR YOUR OTHER ACCOUNT ---
  const identifier = "irfantastic06.bsky.social";
  const password = "yk2o-zvji-4iyj-nqcg"; // <--- PASTE YOUR APP PASSWORD HERE
  // -----------------------------------------

  console.log("🔑 Logging in as:", identifier);
  await agent.login({ identifier, password });
  console.log("✅ Login successful!");

  console.log("🚀 Publishing event to org.community.event...");

  const record = {
    $type: "org.community.event",
    title: "Global Test Event from CLI 🌍",
    description:
      "This event was posted from a different account to test the global indexer!",
    eventDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    location: "Distributed Network",
    createdAt: new Date().toISOString(),
  };

  const response = await agent.com.atproto.repo.createRecord({
    repo: agent.session!.did,
    collection: "org.community.event",
    record: record,
  });

  console.log("\n--- SUCCESS ---");
  console.log("URI:", response.data.uri);
  console.log("CID:", response.data.cid);
  console.log(
    "\nYour Indexer should pick this up via Jetstream in a few seconds!",
  );
}

main().catch((err) => {
  console.error("❌ Failed to post event:", err.message);
});
