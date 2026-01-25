import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthPage } from "./pages/auth/auth-page/auth-page";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterModule, AuthPage],
    templateUrl: "./app.html",
    styleUrls: ["./app.scss"],
})
export class App {
    protected title = "frontend";
}
