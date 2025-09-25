import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { SendService } from "../message/send/send.service";
import { RecieveService, MessageFormat } from "../message/recieve/recieve.service";

@Component({
  selector: "app-message",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.scss"],
})
export class MessageComponent implements OnDestroy {
  messageInput = "";
  messages: MessageFormat[] = [];
  private subs = new Subscription();
  private channelId = "b9889189-6940-4176-943f-98384f7015e9";

  constructor(private send: SendService,private messageHistory: RecieveService) {
    this.initChat(this.channelId);
  }

  private initChat(channelId: string) {
    this.send.init();

    this.subs.add(
      this.messageHistory.getMessages(channelId).subscribe({
        next: msgs => this.messages = msgs,

        error: (err) => console.error("Error cargando histórico:", err)
      })
    );

    this.subs.add(
      this.send.message.subscribe(msg => this.messages.push(msg))
    );

    this.subs.add(
      this.send.open.subscribe(() => {
        console.log("Socket listo, ya se pueden enviar mensajes");
      })
    );
  }

  sendMessage() {
    const text = this.messageInput.trim();
    if (!text) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const senderId = user.user_id || "yo";

    const msgToSend = { info: { text }, sender_id: senderId };
    this.send.send(JSON.stringify(msgToSend));

    this.messages.push({
      info: {text},
      sender_id: senderId,
      type: "user"
    });

    this.messageInput = "";
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
