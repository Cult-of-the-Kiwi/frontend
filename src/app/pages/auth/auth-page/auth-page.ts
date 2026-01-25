import { Component, signal } from "@angular/core";
import { LogIn } from "../../../features/auth/components/auth-cards/log-in/log-in.component";
import { Register } from "../../../features/auth/components/auth-cards/register/register.component";

@Component({
    selector: "auth-page",
    imports: [LogIn, Register],
    templateUrl: "./auth-page.html",
    styleUrl: "./auth-page.scss",
})
export class AuthPage {
    //Flag for when login is required
    IsLogin = signal<boolean>(true);

    changeAuth() {
        this.IsLogin.set(!this.IsLogin());
    }
}
