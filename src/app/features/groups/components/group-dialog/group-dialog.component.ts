import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import {
    Component,
    inject,
    Inject,
    PLATFORM_ID,
    ViewChild,
} from "@angular/core";
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { GroupUserListComponent } from "./group-user-list/group-user-list.component";
import { MatButtonModule } from "@angular/material/button";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

//This is a generic dialog for the group operations. Yes, OOP entered in the frontend team

//TODO: @AlexGarciaPrada For a better usage it will be needed userId -> username that it's not done in backend

export interface GroupDialogInterface {
    groupId?: string;
    title: string;
    route: string;
    users: string[];
    httpOperation: HttpMethod;
    jsonField: string;
    finalRoute?: string; //In case it doesn't have it is the groupId
    uniqueAnswer?: boolean; // In default is not unique answer, puto Marcelo, pq se borran usuarios de uno en uno
    context?: string;
    styleUrl?: string;
}
@Component({
    selector: "group-dialog.component",
    imports: [GroupUserListComponent, MatButtonModule, MatDialogModule],
    standalone: true,
    templateUrl: "./group-dialog.component.html",
    styleUrl: "./group-dialog.component.scss",
})
export class GroupDialogComponent {
    //For getting the info from who opens it
    dialogRef = inject(MatDialogRef<GroupDialogComponent>);
    data = inject<GroupDialogInterface>(MAT_DIALOG_DATA);
    private router = inject(Router);

    selection: string[] = [];
    uniqueAnswer = this.data.uniqueAnswer ?? false;

    @ViewChild(GroupUserListComponent)
    groupUserList!: GroupUserListComponent;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: object,
        private requestService: RequestService,
    ) {}

    async onSubmitGroupDialog(): Promise<void> {
        this.selection = [...this.groupUserList.selections];

        if (!isPlatformBrowser(this.platformId)) return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("There is no token");
            return;
        }

        let body: { [key: string]: string | string[] };

        if (this.uniqueAnswer) {
            body = { [this.data.jsonField]: this.selection[0] };
        } else {
            body = { [this.data.jsonField]: this.selection };
        }
        try {
            //I Assume there is not a response. If its the case the options should be updated
            const data = await this.requestService.makeRequest<
                void,
                typeof body
            >(
                "group/" + this.data.route,
                this.data.httpOperation,
                this.data.context ?? "",
                body,
                { Authorization: `Bearer ${token}` },
            );

            this.dialogRef.close(data);
            this.router.navigate([
                this.data.finalRoute ?? "group/" + this.data.groupId,
            ]);
            //TODO: @AlexGarciaPrada Update this
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }
}
