import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    PLATFORM_ID,
} from "@angular/core";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

//TODO: @AlexGarciaPrada Remade with signals
const errorCtx = "member-list";

@Component({
    selector: "member-list",
    templateUrl: "./member-list.component.html",
    standalone: true,
    imports: [CommonModule],
    styleUrl: "./member-list.component.scss",
})
export class MemberListComponent {
    @Input() groupId!: string;
    @Output() eventMembersLoaded = new EventEmitter<string[]>();

    loading = false;
    error: string | null = null;
    members: string[] = [];

    private requestService = inject(RequestService);
    private platformId = inject(PLATFORM_ID);
    private cdRef = inject(ChangeDetectorRef);

    ngOnChanges() {
        if (this.groupId) {
            this.loadMembers();
        }
    }

    async loadMembers(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.loading = false;
            return;
        }

        this.loading = true;
        this.error = null;

        const token = localStorage.getItem("token");

        if (!token) {
            this.error = "You're not logged in";
            console.error("There is no token");
            this.loading = false;
            return;
        }

        try {
            const data = await this.requestService.makeRequest<string[]>(
                `group/${this.groupId}/members`,
                HttpMethod.GET,
                errorCtx,
                undefined,
                { Authorization: `Bearer ${token}` },
                { from: "0", to: "20" },
            );

            this.members = data;
            this.loading = false;
            this.cdRef.detectChanges();
            this.eventMembersLoaded.emit(this.members);
        } catch (err) {
            console.log(err);
        }
    }
    isLoading(): boolean {
        return this.loading;
    }

    getError(): string | null {
        return this.error;
    }
}
