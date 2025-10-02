import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

interface requestResponse {
    token: string;
    username: string;
    email: string;
    telephone?: string;
    user_id: string;
}
//This null |undefined has to be with the FormControl
//TODO:@AlexGarciaPrada Redo the form, it's just not good
interface requestBody {
    username: string | null | undefined;
    password: string | null | undefined;
}
const context = "login";
@Component({
    selector: "log-in",
    imports: [ReactiveFormsModule],
    templateUrl: "./log-in.page.html",
    styleUrls: ["./log-in.page.scss"],
})
export class LogInPage {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private requestService = inject(RequestService);

    readonly logInForm = this.fb.group({
        username: ["", Validators.required],
        password: ["", Validators.required],
    });

    readonly formValid = toSignal(this.logInForm.statusChanges, {
        initialValue: this.logInForm.valid ? "VALID" : "INVALID",
    });

    async onSubmit(): Promise<void> {
        if (!this.logInForm.valid) {
            console.warn("Fill the form correctly");
            return;
        }

        const { username, password } = this.logInForm.value;

        try {
            const data = await this.requestService.makeRequest<
                requestResponse,
                requestBody
            >("auth/login", HttpMethod.POST, context, { username, password });
            if (data.username && data.token) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        username: data.username,
                        email: data.email,
                        telephone: data.telephone || null,
                        user_id: data.user_id,
                    }),
                );
                localStorage.setItem("token", data.token);
                this.router.navigate(["/main-menu"]);
            }
        } catch (error) {
            //I don't think here I should do anything, but idk
            console.log(error);
        }
    }
}
