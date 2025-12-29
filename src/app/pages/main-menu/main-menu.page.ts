import { Component, inject, ViewChild } from "@angular/core";
import { GroupCreationComponent } from "../../features/groups/dialogs/group-creation/group-creation.component";
import { NotificationService } from "../../services/notification-service";



@Component({
    selector: "main-menu",
    imports: [GroupCreationComponent],
    templateUrl: "./main-menu.page.html",
})
export class MainMenuPage {
    //TODO:@AlexGarciaPrada As it was suggested by Sa4dus, supercomponent who use a notificationListenerService
    private notificationService = inject(NotificationService);



}
