import { inject, Injectable, PLATFORM_ID, signal, WritableSignal, effect, NgZone } from "@angular/core";
import { WebSocketService } from "./websocket-service";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "./notification-service";

export interface MessageFormat {
    id?: string;
    sender_id?: string;
    channel_id?: string;
    message: string;
    created_at?: string;
}

const extension = "/ws/message";
const sleep = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

@Injectable({ providedIn: "root" })
export class MessageService {
    private lastSentMessage = "";
    private messageQueue: string[] = [];
    public messages: WritableSignal<MessageFormat[]> = signal([]);

    private platformId = inject(PLATFORM_ID);
    private ws?: WebSocketService<MessageFormat>;
    private notificationService = inject(NotificationService);
    private zone = inject(NgZone);

    private callbacks = {
        onOpen: () => console.log("Messages connected"),
        onClose: (e: CloseEvent) => console.log(e),
        onMessage: (data: MessageFormat) => {
            console.log("Message received:", data);
            this.messages.update(list => [...list, data]);
        },
        onError: (err: Event | Error) => console.error(err),
    };

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            sleep(1000).then(() => {
                const token = localStorage.getItem("token") ?? "";
                this.ws = new WebSocketService(extension, this.callbacks, [
                    token,
                    "b9889189-6940-4176-943f-98384f7015e9",
                ]);
            });

          effect(() => {
              const notif = this.notificationService.lastNotification();
              if (notif?.header === "message_sent") {
                  try {
                      const raw = JSON.parse(notif.info['message']);
                      const normalized: MessageFormat = {
                          sender_id: notif.info['sender'],
                          channel_id: notif.info['channel_id'],
                          message: raw.message,
                          created_at: new Date().toISOString(),
                      };
                      this.zone.run(() => {
                          this.messages.update(list => [...list, normalized]);
                      });
                  } catch (e) {
                      console.error("❌ Error parsing notification message:", e);
                  }
              }
          });
        }
    }

    send(text: string) {
        const trimmed = text?.trim();
        if (!trimmed) return;
        this.lastSentMessage = trimmed;
        this.ws?.send({ message: trimmed });
        this.messageQueue.push(trimmed);
    }
}
