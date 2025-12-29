import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpMethod, RequestService } from "../../../services/request-service";



const errorCtx = "register";

//TODO: @AlexGarciaPrada Redo this forms also to avoid this null|undefined stuff

interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
    telephone?: string;
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

    private router = inject(Router);
    private requestService = inject(RequestService);

    registerForm = new FormGroup({
        username: new FormControl('', {
            validators: Validators.required,
            nonNullable: true,
        }),
        password: new FormControl('', {
            validators: Validators.required,
            nonNullable: true,
        }),
       email: new FormControl('', {
            validators: Validators.required,
            nonNullable: true,
        }),
        telephone: new FormControl('', {
            validators: Validators.required,
            nonNullable: true,
        }),
    });

    async onSubmit(): Promise<void> {
        if (!this.registerForm.valid) return;

        const { username, email, password, telephone } =
            this.registerForm.getRawValue();

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
