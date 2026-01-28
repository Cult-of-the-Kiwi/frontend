import {
    inject,
    Injectable,
    PLATFORM_ID,
    signal,
    WritableSignal,
} from "@angular/core";
import { WebSocketService } from "./websocket-service";
import { isPlatformBrowser } from "@angular/common";

const extension = "/ws/notification";

const sleep = (ms: number): Promise<void> =>
    new Promise((res) => setTimeout(res, ms));

export interface NotificationFormat {
    header: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    info: Record<string, any>;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
    private platformId = inject(PLATFORM_ID);

    public lastNotification: WritableSignal<NotificationFormat | null> =
        signal(null);

    private callbacks = {
        //TODO:@AlexGarciaPrada Implement a way to notify the user
        onOpen: () => console.log("Notification connected"),
        onClose: (e: CloseEvent) => console.log(e),
        onMessage: (data: NotificationFormat) => {
            console.log(data);
            this.lastNotification.set(data);
        },
        onError: (err: Event | Error) => console.error("panico", err),
    };

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            sleep(1000).then(() => {
                const token = localStorage.getItem("token") ?? "";
                new WebSocketService(extension, this.callbacks, token);
            });
        }
    }
}
