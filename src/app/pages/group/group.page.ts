import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MemberListComponent } from "../../features/groups/components/member-list/member-list.component";
import { CommonModule } from "@angular/common";
import { CallButtonComponent } from "../../features/calls/call-button/call-button.component";
import { RemoveUserComponent } from "../../features/groups/components/remove-user/remove-user.component";
import { HttpMethod, RequestService } from "../../services/request-service";
import { AddUserComponent } from "../../features/groups/components/add-user/add-user.component";

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
    channel_id = "b9889189-6940-4176-943f-98384f7015e9";
    members: string[] = [];
    groupId!: string;
    membersLoaded = false;

    private route = inject(ActivatedRoute);
    private requestService = inject(RequestService);
    constructor() {
        this.groupId = this.route.snapshot.paramMap.get("groupId")!;
        this.getInfo();
    }
    async getInfo() {
        const token = localStorage.getItem("token") ?? "";
        const info = await this.requestService.makeRequest(
            "group/user-groups",
            HttpMethod.GET,
            "",
            {},
            { Authorization: `Bearer ${token}` },
        );
        console.log(info);
    }
    activateMembersLoaded(members: string[]) {
        this.members = members;
        this.membersLoaded = true;
    }
}
