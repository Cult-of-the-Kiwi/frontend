import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { WebSocketService } from "../../../../core/services/websocket-service";
import { MessageFormat } from "../recieve/recieve.service";

@Injectable({ providedIn: 'root' })

export class SendService {
    private ws!: WebSocketService<MessageFormat>;
    private channelId = "b9889189-6940-4176-943f-98384f7015e9"; // hardcodeada
    private isMessage = true; 
    
    message = new Subject<MessageFormat>();
    open = new Subject<void>();
    cerrar = new Subject<void>();//esta en español porque en inglés se me pone en rojo...(será nombre reservado)

    init() {
        this.ws = new WebSocketService<MessageFormat>( 
        "ws/message",
        {
        onOpen: () => {
            console.log("WebSocket abierto correctamente");
            this.open.next();
        },
        onClose: (e) => {
            console.warn("WebSocket cerrado", e);
            this.cerrar.next();
        },
        onMessage: (msg) => {
            this.message.next(msg);
            console.log("Mensaje recibido:", msg);
        },
        onError: (err) => {
            console.error("Catastrofe!! Error al enviar:", err);
        },
      },
        undefined,//preguntar, aquí van protocols realmente, pero por ahora es ajeno a mi conocimiento
      {
        isMessage: this.isMessage,
        channelId: this.channelId
      }
    );

    }

    send(text: string) {
        if (!text) 
            return;
        //else
    const mensajito: MessageFormat = { info: { text } };
    this.ws.send(mensajito);
  }

    close() {
        this.ws?.close();
  }
}
