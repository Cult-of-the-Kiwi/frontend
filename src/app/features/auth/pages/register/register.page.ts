import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
    HttpMethod,
    RequestService,
} from "../../../../core/services/request-service";

const errorCtx = "register";

//TODO: @AlexGarciaPrada Redo this forms also to avoid this null|undefined stuff

interface RegisterRequestBody {
    username: string | null | undefined;
    email: string | null | undefined;
    password: string | null | undefined;
    telephone?: string | null | undefined;
}

interface RegisterRequestResponse {
    token: string;
    username: string;
    email: string;
    telephone?: string;
    user_id: string;
}

@Component({
    selector: "register",
    imports: [ReactiveFormsModule],
    templateUrl: "./register.page.html",
    styleUrls: ["./register.page.scss"],
})
export class RegisterPage {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private requestService = inject(RequestService);

    registerForm = this.fb.group({
        username: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", Validators.required],
        telephone: [""],
    });

    async onSubmit(): Promise<void> {
        if (!this.registerForm.valid) return;

        const { username, email, password, telephone } =
            this.registerForm.value;

        try {
            const data = await this.requestService.makeRequest<
                RegisterRequestResponse,
                RegisterRequestBody
            >("auth/register", HttpMethod.POST, errorCtx, {
                username,
                email,
                password,
                telephone,
            });

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
            console.error(error);
        }
    }
}
