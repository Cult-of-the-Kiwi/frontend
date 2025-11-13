import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    MessageFormat,
    MessageService,
} from "../../../core/services/messages-service";
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
    messages = this.messageService.messages;

    currentUserId: string = "";

    ngOnInit() {
        this.messages = this.messageService.messages;
        this.messageService.init(this.channel_id);
        this.loadMessages();
    }

    constructor() {}

    sendMessage() {
        if (!this.messageInput.trim()) return;
        this.messageService.send(this.messageInput);
        this.messageInput = "";
    }

    async loadMessages() {
        const token = localStorage.getItem("token") ?? "";
        try {
            const messages = await this.requestService.makeRequest<
                MessageFormat[]
            >(
                extension + this.channel_id,
                HttpMethod.GET,
                "",
                {},
                { Authorization: `Bearer ${token}` },
            );
            console.log(messages);
            this.messageService.messages.update(() => messages);
        } catch (error) {
            console.warn(error);
        }
    }
}