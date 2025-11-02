import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { WebSocketService } from "./websocket-service";
import { isPlatformBrowser } from "@angular/common";

const extension = "/ws/notification";

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export interface MessageFormat {
    header: string;
    info: Record<string, string>;
}

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    private websocketService: WebSocketService<MessageFormat> | undefined;
    private platformId = inject(PLATFORM_ID);

    //Example of callbacks
    private callbacks = {
        //TODO:@AlexGarciaPrada Implement a way to notify the user
        onOpen: () => console.log("Notification connected"),
        onClose: (e: CloseEvent) => console.log(e),
        onMessage: (data: MessageFormat) => console.log(data),
        onError: (err: Event | Error) => console.error(err),
    };

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            sleep(1000).then(() => {
                const token = localStorage.getItem("token") ?? "";
                this.websocketService = new WebSocketService(
                    extension,
                    this.callbacks,
                    token,
                );
            });
        }
    }
}
