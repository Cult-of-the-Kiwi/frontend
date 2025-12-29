import { isPlatformBrowser } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MainMenuInfoService } from '../../../../services/main-menu-info.service';




@Component({
    selector: 'app-group-container',
    imports: [],
    templateUrl: './group-container.component.html',
    styleUrl: './group-container.component.scss'
})
export class GroupContainerComponent {




    private mainMenuService = inject(MainMenuInfoService);
    private router = inject(Router);

    groups = this.mainMenuService.getGroupsSignal();

    goToGroup(groupId: string) {
        this.router.navigate([`group/${groupId}`]);
    }
}
