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

  currentUserId: string = "";

  constructor(private sendService: SendService, private receiveService: RecieveService) {
    const user = localStorage.getItem("user");
    this.currentUserId = user ? JSON.parse(user).user_id : "yo";
    this.initChat(this.channelId);
  }
private async initChat(channelId: string) {
  try {
    // Saltamos group_id fetch
    this.sendService.init(channelId);

    // Cargar historial
    this.receiveService.getMessages(channelId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      },
      error: (err) => console.error("Error al cargar histórico:", err),
    });

    this.subs.add(
      this.sendService.message.subscribe((msg) => {
        if (!msg.message) return;
        this.messages.push(msg);
      })
    );
  } catch (err) {
    console.error("Error inicializando chat:", err);
  }
}


  sendMessage() {
    const text = this.messageInput.trim();
    if (!text) return;
    this.sendService.send(text);
    this.messageInput = "";
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.sendService.close();
  }
}
