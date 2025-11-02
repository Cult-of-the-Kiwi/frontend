import { Component, inject, Input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
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
    messages = signal<MessageFormat[]>([]);
    private subs = new Subscription();
    private requestService = inject(RequestService);
    private messageService = inject(MessageService);

    currentUserId: string = "";

    ngOnInit() {
        this.loadMessages();
    }
    constructor() {}

    sendMessage() {
        this.messageService.send(this.messageInput);
    }

    //This loads the previous messages
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
            this.messages.set(messages);
        } catch (error) {
            console.warn(error);
        }
    }
}
