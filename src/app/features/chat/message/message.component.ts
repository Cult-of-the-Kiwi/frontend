import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    MessageFormat,
    MessageService,
} from "../../../core/services/message-service";
import {
    HttpMethod,
    RequestService,
} from "../../../core/services/request-service";
const extension = "message/";
@Component({
    selector: "app-message",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"],
})
export class MessageComponent {
    @Input() channel_id: string = "";
    messageInput = "";
    private requestService = inject(RequestService);
    private messageService = inject(MessageService);

        messages = this.messageService.messages; // directly use the service signal

    currentUserId: string = "";

    ngOnInit() {
        this.loadMessages();
    }
    constructor() {}

    sendMessage() {
        if (!this.messageInput.trim()) 
            return;
        this.messageService.send(this.messageInput);
        this.messageInput = "";
    }

    async loadMessages() {
        const token = localStorage.getItem("token") ?? "";
        try {
            const messages = await this.requestService.makeRequest<MessageFormat[]>(
                extension + this.channel_id,
                HttpMethod.GET,
                "",
                {},
                { Authorization: `Bearer ${token}` },
            );
            console.log(messages);
            this.messages.set(messages);
        } catch (error) {
            console.warn(error);
        }
    }
}