import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MemberListComponent } from "../../features/groups/components/member-list/member-list.component";
import { CommonModule } from "@angular/common";
import { CallButtonComponent } from "../../features/calls/call-button/call-button.component";
import { RemoveUserComponent } from "../../features/groups/components/remove-user/remove-user.component";
import { HttpMethod, RequestService } from "../../services/request-service";
import { AddUserComponent } from "../../features/groups/components/add-user/add-user.component";
import { GroupInfoService } from "../../services/group-info-service";

//TODO: @AlexGarciaPrada make it dialog

@Component({
    selector: "group",
    standalone: true,
    imports: [
        MemberListComponent,
        RemoveUserComponent,
        AddUserComponent,
        CommonModule,
        CallButtonComponent,
    ],
    templateUrl: "./group.page.html",
    styleUrls: ["./group.page.scss"],
})
export class GroupPage {

    members=signal<String[]>([]);
    groupId!: string;
    membersLoaded = false;

    private route = inject(ActivatedRoute);
    private requestService = inject(RequestService);
    private groupInfo = inject (GroupInfoService);

    ngOnInit() {
        this.groupId = this.route.snapshot.paramMap.get("groupId")!;
        this.groupInfo.loadMembers(this.groupId);
        this.members = this.groupInfo.getMembersSignal();
    }
}
