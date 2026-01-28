import { Routes } from "@angular/router";
import { GroupPage } from "./pages/group/group.page";
import { CallPage } from "./pages/call/call.page";
import { MainMenuPage } from "./pages/main-menu/main-menu.page";
import { AuthPage } from "./pages/auth/auth-page/auth-page";

export const routes: Routes = [
    { path: "main-menu", component: MainMenuPage },
    { path: "home", component: AuthPage },
    { path: "group/:groupId", component: GroupPage },
    //At the time there is only one call in each group
    { path: "group/:groupId/call", component: CallPage },

    { path: "", redirectTo: "home", pathMatch: "full" },
];
