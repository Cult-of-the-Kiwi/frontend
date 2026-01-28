import { CommonModule } from "@angular/common";
import { Component, inject, Input, signal } from "@angular/core";
import { GroupInfoService } from "../../../../services/group-info-service";

@Component({
    selector: "member-list",
    templateUrl: "./member-list.component.html",
    standalone: true,
    imports: [CommonModule],
    styleUrl: "./member-list.component.scss",
})
export class MemberListComponent {
    @Input() groupId!: string;

    members = signal<string[]>([]);
    private groupService = inject(GroupInfoService);
    ngOnInit() {
        this.members = this.groupService.getMembersSignal();
    }
}
