import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import {
    Component,
    EventEmitter,
    Inject,
    Output,
    inject,
    PLATFORM_ID,
} from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import {
    GroupDialogComponent,
    GroupDialogInterface,
} from "../../../groups/components/group-dialog/group-dialog.component";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

const context = "group-creation";

//TODO : @AlexGarciaPrada As in add-user this should be done in a more generic way
@Component({
    selector: "group-creation",
    standalone: true,
    templateUrl: "./group-creation.component.html",
    styleUrls: ["./group-creation.component.scss"],
})
export class GroupCreationComponent {
    private dialog = inject(MatDialog);
    loading = false;

    private usernames: string[] = [];
    private userIds: string[] = [];

    @Output() groupCreated = new EventEmitter<string>();

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: object,
        private requestService: RequestService,
    ) {}

    async onOpenDialog() {
        try {
            await this.loadFriends();
            await this.openFriendSelectorDialog();
        } catch (err) {
            console.error("Error opening dialog:", err);
        }
    }

    async loadFriends(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.loading = false;
            return;
        }

        this.loading = true;
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("There is no token");
            this.loading = false;
            return;
        }

        const params = { from: "0", to: "20" };

        try {
            const data = await this.requestService.makeRequest<
                { username: string; created_at: string }[]
            >(
                "user/friendship/friends",
                HttpMethod.GET,
                context,
                undefined,
                { Authorization: `Bearer ${token}` },
                params,
            );

            this.usernames = data.map((friend) => friend.username);
        } catch (error) {
            console.error("Error loading friends:", error);
            this.usernames = [];
        } finally {
            this.loading = false;
        }
    }
    async openFriendSelectorDialog() {
        try {
            if (this.usernames.length === 0) {
                console.warn("No usernames to convert. Dialog will be empty.");
            }

            this.userIds = await this.convertUserList(this.usernames);

            const dialogInfo: GroupDialogInterface = {
                title: "Select members for the new group",
                route: "create",
                users: this.userIds,
                httpOperation: HttpMethod.POST,
                finalRoute: "/main-menu",
                context: "group-creation",
                jsonField: "member_ids",
            };

            const dialogConfig = new MatDialogConfig();
            dialogConfig.width = "500px";
            dialogConfig.data = dialogInfo;

            const dialogRef = this.dialog.open(
                GroupDialogComponent,
                dialogConfig,
            );

            dialogRef.afterClosed().subscribe((result) => {
                if (result?.status === "group-created") {
                    this.groupCreated.emit(result.groupId);
                }
            });
        } catch (err) {
            console.error("Error opening friend selector dialog:", err);
        }
    }

    async convertUserList(usernames: string[]): Promise<string[]> {
        if (usernames.length === 0) return [];

        const token = localStorage.getItem("token");
        if (!token) return [];

        const promises = usernames.map((username) =>
            this.requestService.makeRequest<{ id: string }, undefined>(
                "user",
                HttpMethod.GET,
                context,
                undefined,
                { Authorization: `Bearer ${token}` },
                { user_username: username },
            ),
        );

        const results = await Promise.all(promises);
        return results.map((user) => user.id);
    }
}
