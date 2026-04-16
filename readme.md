Event posting board using ATProto

You can run it by running npm run dev.

This will open up localhost:5173.

the reason why we only see a certain amount of people posting
on our board is due to our lexicon. We defined a certain schema that not 
many people are using, therefore we see a small amount of posts. 

If we were to use blueskys normal lexicon, we would have everyones posts come
through.

This system turns the AT Protocol into a global, shared database using a
  "secret handshake" (your Lexicon). Here is how it works and how you see
  other people's posts:


  1. The "Secret Handshake" (The Lexicon)
  Everything revolves around the ID: org.community.event.
   * The Rule: Any post on the entire AT Protocol network that identifies
     itself as org.community.event is considered an "Event" by your app.
   * The Filter: Your backend Indexer is currently listening to a "Firehose"
     (Jetstream) that sees every single post made on Bluesky/ATProto. It
     ignores everything (photos, likes, posts) except for records labeled
     with your specific lexicon.


  2. How You See Other People
  If a user in Japan or London uses a compatible app to post a record with
  the ID org.community.event, here is the journey:
   1. They Post: They push the data to their own Personal Data Server (PDS).
   2. Jetstream Catches It: The Jetstream service (the firehose) broadcasts
      this new record to the whole world.
   3. Your Indexer Saves It: Your backend server sees this broadcast,
      notices it matches org.community.event, and saves the title,
      description, and eventDate into your local events.db file.
   4. Your Feed Updates: Next time you open your app (or via the live
      WebSocket update), that post appears in your feed alongside your own.


  3. The Rules It Follows
  To be seen by your board, a post must follow these rules:
   * Collection Name: It must be in the org.community.event collection. If
     they post it to app.bsky.feed.post (a normal Bluesky post), your app
     will ignore it.
   * Required Fields: According to your JSON lexicon, the post must have a
     title, description, eventDate, and createdAt. If these are missing, the
     ATProto network might reject the record before it even reaches you.
   * Publicity: The post must be "public" on the ATProto relay. (Since
     everything on the main Bluesky relay is public, this is the default).


  4. Why this is "Distributed"
   * No Central Owner: You don't "own" the posts. If you turn off your
     server, the events still exist on the authors' own data servers.
   * Permissionless: Anyone can write a script to post to this board without
     asking you for an API key. As long as they use your "Secret Handshake"
     (the lexicon ID), they are part of the community.
   * Your Indexer is Your View: Your events.db is your personal "index" of
     the global conversation. If someone else starts a rival event board,
     they would run their own indexer and see the exact same posts!


  To test it: If you have another ATProto account, you could technically use
  a tool like atp-cli to post a record to org.community.event from that
  account, and you would see it appear on your board instantly!

npx atp-cli createRecord \
    --repo irfantastic06.bsky.social \
    --collection org.community.event \
    --record '{
    "title": "Global Test Event",
    "description": "Checking if the indexer picks this up!",
    "eventDate": "2026-05-01T10:00:00Z",
    "createdAt": "2026-04-16T12:00:00Z"
}'