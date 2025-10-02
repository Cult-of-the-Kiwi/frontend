import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
    RequestService,
    HttpMethod,
} from "../../../core/services/request-service";

//TODO: @AlexGarciaPrada This have to be remade entirely

const context = "receive-friendships";

interface FriendRequest {
    from_user_username: string;
    state: "pending" | "accepted" | "rejected";
    created_at: string;
}

interface FriendActionBody {
    to_user_username: string;
}

interface FriendRequestsResponse {
    requests: FriendRequest[];
}

@Component({
    selector: "app-received-friendship",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: "./received-friendship.component.html",
    styleUrls: ["./received-friendship.component.scss"],
})
export class FriendRequestsComponent {
    readonly friendRequests = signal<FriendRequest[]>([]);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    pageSize = 10;
    currentPage = 0;

    private requestService = inject(RequestService);

    async ngOnInit(): Promise<void> {
        if (typeof window === "undefined") return;
        await this.loadFriendRequests();
    }

    setLoading(loading: boolean): void {
        this.isLoading.set(loading);
    }

    setError(error: string | null): void {
        this.error.set(error);
    }

    async loadFriendRequests(): Promise<void> {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found.");
            return;
        }

        const from = this.currentPage * this.pageSize;
        const to = from + this.pageSize;

        this.setLoading(true);
        this.setError(null);

        try {
            const response =
                await this.requestService.makeRequest<FriendRequestsResponse>(
                    "user/friendship/received",
                    HttpMethod.GET,
                    context,
                    undefined,
                    { Authorization: `Bearer ${token}` },
                    { from: from.toString(), to: to.toString() },
                );

            this.friendRequests.set(response.requests || []);
            this.setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }

    async onClickAccept(request: FriendRequest): Promise<void> {
        const token = localStorage.getItem("token");
        if (!token) return;

        const body: FriendActionBody = {
            to_user_username: request.from_user_username,
        };

        try {
            await this.requestService.makeRequest<object, FriendActionBody>(
                "user/friendship/accept",
                HttpMethod.POST,
                context,
                body,
                { Authorization: `Bearer ${token}` },
            );
            await this.loadFriendRequests();
        } catch (err) {
            console.log(err);
        }
    }

    async onClickReject(request: FriendRequest): Promise<void> {
        const token = localStorage.getItem("token");
        if (!token) return;

        const body: FriendActionBody = {
            to_user_username: request.from_user_username,
        };

        try {
            await this.requestService.makeRequest<object, FriendActionBody>(
                "user/friendship/reject",
                HttpMethod.POST,
                context,
                body,
                { Authorization: `Bearer ${token}` },
            );
            await this.loadFriendRequests();
        } catch (err) {
            console.log(err);
        }
    }

    nextPage(): void {
        this.currentPage++;
        this.loadFriendRequests();
    }

    prevPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadFriendRequests();
        }
    }
}
