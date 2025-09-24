import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

const context = "login";
@Component({
    selector: "log-in",
    imports: [ReactiveFormsModule],
    templateUrl: "./log-in.page.html",
    styleUrls: ["./log-in.page.scss"],
})
export class LogInPage {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);

    constructor(private requestService: RequestService) {}

    readonly logInForm = this.fb.group({
        username: ["", Validators.required],
        password: ["", Validators.required],
    });

    readonly formValid = toSignal(this.logInForm.statusChanges, {
        initialValue: this.logInForm.valid ? "VALID" : "INVALID",
    });

    async onSubmitLogIn(): Promise<void> {
        if (!this.logInForm.valid) {
            console.warn("Fill the form correctly");
            return;
        }

        const { username, password } = this.logInForm.value;

        try {
            const data = await this.requestService.makeRequest<{
                token: string;
                username: string;
                email: string;
                telephone?: string;
                user_id: string;
            }>(
                "auth/login",
                HttpMethod.POST,
                { username, password },
                undefined,
                context,
            );
            if (data.username) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        username: data.username,
                        email: data.email,
                        telephone: data.telephone || null,
                        user_id: data.user_id,
                    }),
                );
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            this.router.navigate(["/main-menu"]);
        } catch (error) {
            //I don't think here I should do anything, but idk
            console.log(error);
        }
    }
}
