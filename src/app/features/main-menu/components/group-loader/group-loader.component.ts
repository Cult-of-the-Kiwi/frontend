import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    Inject,
    Output,
    PLATFORM_ID,
} from "@angular/core";
import { EventEmitter } from "@angular/core";
import {
    RequestService,
    HttpMethod,
} from "../../../../core/services/request-service";

const context = "user-groups";

@Component({
    selector: "group-loader",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./group-loader.component.html",
    styleUrl: "./group-loader.component.scss",
})
export class GroupLoader {
    @Output() groupsLoaded = new EventEmitter<{ groupId: string }[]>();

    loading = false;
    error: string | null = null;
    groups: { groupId: string }[] = [];

    constructor(
        private requestService: RequestService,
        @Inject(PLATFORM_ID) private platformId: object,
        private cdRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.loadGroups();
    }

    async loadGroups(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.loading = false;
            return;
        }

        this.loading = true;
        this.error = null;

        const token = localStorage.getItem("token");

        if (!token) {
            this.error = "You're not logged in";
            this.loading = false;
            return;
        }

        try {
            const data = await this.requestService.makeRequest<
                { id: string }[]
            >(
                "group/user-groups",
                HttpMethod.GET,
                undefined,
                { Authorization: `Bearer ${token}` },
                context,
            );

            if (data) {
                this.groups = data.map((group) => ({ groupId: group.id }));
                this.groupsLoaded.emit(this.groups);
            }
        } catch {
            console.log("grouploader not working");
        }

        this.loading = false;
        this.cdRef.detectChanges();
    }

    isLoading(): boolean {
        return this.loading;
    }

    getError(): string | null {
        return this.error;
    }
}
