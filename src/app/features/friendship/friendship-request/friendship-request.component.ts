import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import {
    HttpMethod,
    RequestService,
} from "../../../core/services/request-service";

const errorCtx = "friendship-request";

export interface FriendshipRequestResponse {
    success: boolean;
    message: string;
}

export interface FriendshipRequestBody {
    to_user_username: string;
}

@Component({
    selector: "app-friendship-request",
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: "./friendship-request.component.html",
    styleUrls: ["./friendship-request.component.scss"],
})
export class FriendshipRequestComponent {
    readonly toUserUsername = signal("");

    private requestService = inject(RequestService);
    private router = inject(Router);
    constructor() {}

    async sendRequest(): Promise<void> {
        const username = this.toUserUsername().trim();
        if (!username) {
            console.warn("Username can't be empty");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("You're not logged");
            return;
        }

        try {
            const body: FriendshipRequestBody = { to_user_username: username };

            const data = await this.requestService.makeRequest<
                FriendshipRequestResponse,
                FriendshipRequestBody
            >("user/friendship/request", HttpMethod.POST, errorCtx, body, {
                Authorization: `Bearer ${token}`,
            });

            console.log("Request successfully sent:", data);
            this.toUserUsername.set("");
            this.router.navigate(["/user"]);
        } catch (err) {
            console.log(err);
        }
    }
}
