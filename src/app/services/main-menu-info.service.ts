import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { HttpMethod, RequestService } from "./request-service";

@Injectable({
    providedIn: "root",
})
export class MainMenuInfoService {
    groups = signal<string[]>([]);
    private platformId = inject(PLATFORM_ID);
    private requestService = inject(RequestService);
    error: string | null = null;

    constructor() {}

    async loadGroups(): Promise<void> {
        const errorCtx = "user-groups";

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.error = null;

        const token = localStorage.getItem("token");

        if (!token) {
            this.error = "You're not logged in";
            return;
        }

        try {
            const data = await this.requestService.makeRequest<
                { id: string }[]
            >("group/user-groups", HttpMethod.GET, errorCtx, undefined, {
                Authorization: `Bearer ${token}`,
            });

            if (data) {
                this.setGroups(data.map((group) => group.id));
            }
        } catch {
            console.log("grouploader not working");
        }
    }

    setGroups(groupIds: string[]) {
        this.groups.set(groupIds);
    }

    public addGroup(groupId: string) {
        this.groups.set([...this.groups(), groupId]);
        console.log(this.groups());
    }

    getGroupsSignal() {
        return this.groups;
    }
}
