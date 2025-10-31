import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { WebSocketService } from "../../../../core/services/websocket-service";
import { MessageFormat } from "../recieve/recieve.service";


@Injectable({ providedIn: 'root' })

export class SendService {
    private ws?: WebSocketService<string>;
    private channelId = "b9889189-6940-4176-943f-98384f7015e9"; // hardcodeada
    private isConnected = false;
    private messageQueue: string[] = [];
    private lastSentMessage: string | null = null;
    private currentUserId: string = "";
    message = new Subject<MessageFormat>();


    init(channelId:string) {
      const token=localStorage.getItem("token");
      if (!token) return console.error("No token");
      this.ws = new WebSocketService<string>( 
      `/ws/message?channel_id=${channelId}`,
      {
        onOpen: () => {
            console.log("WebSocket abierto correctamente");
            this.isConnected=true;
            this.flushQueue();
        },
        onClose: (e) => {
            console.warn("WebSocket cerrado", e);
            this.isConnected=false;
        },
        onMessage: (raw) => {
          const msg: MessageFormat = {
            sender_id: raw === this.lastSentMessage ? this.currentUserId : "otro",
            channel_id: this.channelId,
            message: raw,
            created_at: new Date().toISOString(),
          };
          this.message.next(msg);
        },
        onError: (err) => {
            console.error("Catastrofe!! Error al enviar:", err);
        },
      }
    );
    }

    send(text: string) {
        if (!text.trim()) //podía enviar espacios vacíos lol
            return;
        //else
        this.lastSentMessage = text;
        if (this.isConnected) {
              this.ws?.send(text);
            } else {
              console.log("Encolando mensaje (WS no listo):", text);
              this.messageQueue.push(text);
            }
    }

    close() {
      this.isConnected= false;
        this.ws?.close();
    }
    private flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      if (this.isConnected) {
        this.ws?.send(msg);
      }
    }
  }
}
