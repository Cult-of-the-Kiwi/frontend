import { Component, inject, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import {
    HttpMethod,
    RequestService,
} from "../../../core/services/request-service";

interface SentRequest {
    to_user_username: string;
    state: "pending" | "accepted" | "rejected";
    created_at: string;
}

export interface SentRequestsResponse {
    requests: SentRequest[];
}

@Component({
    selector: "app-friendship-sent",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./friendship-sent.component.html",
    styleUrls: ["./friendship-sent.component.scss"],
})
export class FriendshipSentComponent {
    readonly requests = signal<SentRequest[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    private requestService = inject(RequestService);
    private platformId = inject(PLATFORM_ID);
    constructor() {
        this.loadSentRequests();
    }

    async loadSentRequests(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.loading.set(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            this.error.set("You're not logged");
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        try {
            const data = await this.requestService.makeRequest<SentRequest[]>(
                "user/friendship/sent",
                HttpMethod.GET,
                "Loading sent requests",
                undefined,
                { Authorization: `Bearer ${token}` },
                { from: "0", to: "20" },
            );

            this.requests.set(data);
            this.loading.set(false);
        } catch (err) {
            console.log(err);
        }
    }

    isLoading() {
        return this.loading();
    }

    getError() {
        return this.error();
    }

    getRequests() {
        return this.requests();
    }

    hasRequests() {
        return this.requests().length > 0;
    }

    showEmpty() {
        return !this.isLoading() && !this.getError() && !this.hasRequests();
    }
}
