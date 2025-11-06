import { inject, Injectable, PLATFORM_ID, signal, WritableSignal, NgZone } from "@angular/core";
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
const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
@Injectable({ providedIn: "root" })
export class MessageService {
    private lastSentMessage: string = "";
    private messageQueue: string[] = [];
    public messages: WritableSignal<MessageFormat[]> = signal([]);

    private platformId = inject(PLATFORM_ID);
    private ws: WebSocketService<MessageFormat> | undefined;
    private notificationService = inject(NotificationService);

    private callbacks = {
        onOpen: () => console.log("Messages connected"),
        onClose: (e: CloseEvent) => console.log(e),
        onMessage: (data: MessageFormat) => {
                    console.log("Message recieved",data);
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
            this.listenToNotifications();
        }
    }

    send(text: string) {
        const trimmed = text?.trim();
        if (!trimmed) return;
        this.lastSentMessage = trimmed;
        this.ws?.send({ message: trimmed }); // send plain text
        this.messageQueue.push(trimmed);
    }
    private listenToNotifications() {
  const zone = inject(NgZone); 

  const originalHandler = (window as any)._notifHandler;
  (window as any)._notifHandler = (data: any) => {
    if (originalHandler) originalHandler(data);

    if (data.header === "message_sent") {
      try {
        const raw = JSON.parse(data.info.message);
        const normalized: MessageFormat = {
          sender_id: data.info.sender,
          channel_id: data.info.channel_id,
          message: raw.message,
          created_at: new Date().toISOString(),
        };
        zone.run(() => {
          this.messages.update(list => {
            console.log("Antes:", list);
            const updated = [...list, normalized];
            console.log("Después:", updated);
            return updated;
          });
        });
      } catch (e) {
        console.error("❌ Error parsing notification message:", e);
      }
    }
  };
}

}
