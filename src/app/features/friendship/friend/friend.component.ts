import { Component, inject, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import {
    HttpMethod,
    RequestService,
} from "../../../core/services/request-service";

export interface FriendListItem {
    username: string;
    created_at: string;
}

export interface FriendListResponse {
    friends: FriendListItem[];
}

@Component({
    selector: "app-friend",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./friend.component.html",
    styleUrls: ["./friend.component.scss"],
})
export class FriendshipFriendComponent {
    readonly requests = signal<FriendListItem[]>([]);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    private requestService = inject(RequestService);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        this.loadFriends();
    }

    async loadFriends(): Promise<void> {
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
            const response =
                await this.requestService.makeRequest<FriendListResponse>(
                    "user/friendship/friends",
                    HttpMethod.GET,
                    "Loading friends",
                    undefined,
                    { Authorization: `Bearer ${token}` },
                    { from: "0", to: "20" },
                );

            this.requests.set(
                response.friends.map((d) => ({
                    username: d.username,
                    created_at: d.created_at,
                })),
            );

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
