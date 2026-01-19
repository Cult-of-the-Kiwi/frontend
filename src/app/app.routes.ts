import { Routes } from "@angular/router";
import { RegisterPage } from "./pages/auth/register/register.page";
import { LogInPage } from "./pages/auth/log-in/log-in.page";
import { HomePage } from "./pages/home.page";
import { GroupPage } from "./pages/group/group.page";
import { CallPage } from "./pages/call/call.page";
import { MainMenuPage } from "./pages/main-menu/main-menu.page";

export const routes: Routes = [
    { path: "main-menu", component: MainMenuPage },
    { path: "register", component: RegisterPage },
    { path: "login", component: LogInPage },
    { path: "home", component: HomePage },
    { path: "group/:groupId", component: GroupPage },
    //At the time there is only one call in each group
    { path: "group/:groupId/call", component: CallPage },

    { path: "", redirectTo: "home", pathMatch: "full" },
];
