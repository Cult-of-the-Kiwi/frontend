import { CommonModule} from "@angular/common";
import {
    Component,
    inject,
    Input,
    SimpleChanges,
} from "@angular/core";
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
    private groupService = inject(GroupInfoService);
    members = this.groupService.getMembersSignal();
    
    //This is a shitty solution
    ngOnChanges(changes: SimpleChanges) {        
        if (changes['groupId'] && this.groupId) {
            this.groupService.loadMembers(this.groupId);
        }
    }

    
}
