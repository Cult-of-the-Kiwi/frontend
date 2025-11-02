import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { WebSocketService } from "../../../../core/services/websocket-service";
import { MessageFormat } from "../recieve/recieve.service";

@Injectable({ providedIn: "root" })
export class SendService {
  private ws?: WebSocketService<string>;
  private isConnected = false;
  private messageQueue: string[] = [];
  private lastSentMessage: string | null = null;
  private currentUserId: string = "";
  message = new Subject<MessageFormat>();
  private activeChannelId: string | null = null;

  init(channelId: string) {
    this.activeChannelId = channelId;
    const token = localStorage.getItem("token");
    if (!token) return console.error("SendService.init: No token in localStorage");

    // create ws with channelId in URL & plain text handling
    this.ws = new WebSocketService<string>(`/ws/message?channel_id=${channelId}`, {
      onOpen: () => {
        console.log("SendService: WebSocket opened");
        this.isConnected = true;
        this.flushQueue();
      },
      onClose: (e) => {
        console.warn("SendService: WebSocket closed", e);
        this.isConnected = false;
      },
      onMessage: (raw) => {
        // raw is plain text (string)
        const rawStr = raw as unknown as string;

        const msg: MessageFormat = {
          sender_id: rawStr === this.lastSentMessage ? this.currentUserId : "otro",
          channel_id: channelId,
          message: rawStr,
          created_at: new Date().toISOString(),
        };
        this.message.next(msg);
      },
      onError: (err) => {
        console.error("SendService: WebSocket error:", err);
      },
    }, { isPlainTextMessages: true });

    // set currentUserId from localStorage if available
    const user = localStorage.getItem("user");
    this.currentUserId = user ? JSON.parse(user).user_id : "yo";
  }

  send(text: string) {
    const trimmed = text?.trim();
    if (!trimmed) return; // ignore empty
    this.lastSentMessage = trimmed;
    if (this.isConnected && this.ws) {
      this.ws.send(trimmed); // send plain text
    } else {
      console.log("SendService: queueing message (ws not ready):", trimmed);
      this.messageQueue.push(trimmed);
    }
  }

  close() {
    this.isConnected = false;
    this.ws?.close();
    this.ws = undefined;
    this.activeChannelId = null;
  }

  private flushQueue() {
    while (this.messageQueue.length > 0 && this.isConnected && this.ws) {
      const m = this.messageQueue.shift()!;
      this.ws.send(m);
    }
  }
}
