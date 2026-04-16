import { useEffect } from "react";

const JETSTREAM_URL =
  "wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=org.community.event";
//'wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post';

export type JetstreamEvent = {
  did: string;
  time_us: number;
  kind: string;
  commit?: {
    rev: string;
    operation: 'create' | 'update' | 'delete';
    collection: 'org.community.event';
    rkey: string;
    record?: any;
    cid?: string;
  };
};

export const useJetstream = (onEvent: (event: JetstreamEvent) => void) => {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      console.log("🔌 Connecting to Jetstream...");
      ws = new WebSocket(JETSTREAM_URL);

      ws.onopen = () => {
        console.log("✅ Connected to Jetstream");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as JetstreamEvent;
          onEvent(data);
        } catch (err) {
          console.error("Failed to parse Jetstream message:", err);
        }
      };

      ws.onclose = () => {
        console.log("❌ Jetstream connection closed. Reconnecting in 5s...");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("Jetstream error:", err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent reconnect on unmount
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [onEvent]);
};
