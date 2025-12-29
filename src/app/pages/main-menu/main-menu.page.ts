import { Component} from "@angular/core";
import { GroupContainerComponent } from "../../features/groups/components/group-container.component/group-container.component";
import { GroupCreationComponent } from "../../features/groups/components/group-creation/group-creation.component";



@Component({
    selector: "main-menu",
    imports: [GroupCreationComponent,GroupContainerComponent],
    templateUrl: "./main-menu.page.html",
})
export class MainMenuPage {







}
