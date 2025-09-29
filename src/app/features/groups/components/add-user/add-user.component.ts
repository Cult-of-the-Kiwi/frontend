import { Component, Inject, inject, Input, PLATFORM_ID } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
    GroupDialogComponent,
    GroupDialogInterface,
} from "../group-dialog/group-dialog.component";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

const context = "add-user";
@Component({
    selector: "add-user",
    imports: [CommonModule],
    standalone: true,
    templateUrl: "./add-user.component.html",
    styleUrl: "./add-user.component.scss",
})
export class AddUserComponent {
    @Input() members: string[] = [];
    @Input() groupId!: string;

    dialog = inject(MatDialog);
    private requestService = inject(RequestService);

    private usernames: string[] = [];
    private friendsIds: string[] = [];
    private notMemberFriends: string[] = [];

    constructor(@Inject(PLATFORM_ID) private platformId: object) {}

    async openAddUserDialog() {
        try {
            await this.loadFriends();
        } catch (err) {
            console.error("Error opening dialog:", err);
            return;
        }

        this.notMemberFriends = this.friendsIds.filter(
            (id) => !this.members.includes(id),
        );

        const dialogInfo: GroupDialogInterface = {
            groupId: this.groupId,
            title: "Select user to add to the group",
            route: this.groupId + "/add-users",
            users: this.notMemberFriends,
            httpOperation: HttpMethod.PUT,
            jsonField: "user_ids",
            context: "add-user",
        };

        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = "500px";
        dialogConfig.data = dialogInfo;

        this.dialog.open(GroupDialogComponent, dialogConfig);
    }

    async loadFriends(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("There is no token");
            return;
        }

        const params = { from: "0", to: "20" };

        try {
            const data = await this.requestService.makeRequest<
                { username: string; created_at: string }[],
                undefined
            >(
                "user/friendship/friends",
                HttpMethod.GET,
                context,
                undefined,
                {
                    Authorization: `Bearer ${token}`,
                },
                params,
            );

            this.usernames = data.map((friend) => friend.username);
        } catch (error) {
            console.error("Error loading friends:", error);
            this.usernames = [];
        }

        this.friendsIds = await this.convertUserList(this.usernames);
    }

    async convertUserList(usernames: string[]): Promise<string[]> {
        if (usernames.length === 0) return [];

        const token = localStorage.getItem("token");
        if (!token) return [];

        const promises = usernames.map((username) =>
            this.requestService.makeRequest<{ id: string }, undefined>(
                `user?user_username=${username}`,
                HttpMethod.GET,
                context,
                undefined,
                { Authorization: `Bearer ${token}` },
            ),
        );

        const results = await Promise.all(promises);
        return results.map((user) => user.id);
    }
}
