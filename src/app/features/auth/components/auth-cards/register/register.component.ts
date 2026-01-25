import { Component, inject } from "@angular/core";
import {
    ReactiveFormsModule,
    Validators,
    FormControl,
    FormGroup,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
    HttpMethod,
    RequestService,
} from "../../../../../services/request-service";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

const errorCtx = "register";

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
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss", "../auth-cards.scss"],
})
export class Register {
    private router = inject(Router);
    private requestService = inject(RequestService);

    registerForm = new FormGroup({
        username: new FormControl("", {
            validators: Validators.required,
            nonNullable: true,
        }),
        password: new FormControl("", {
            validators: Validators.required,
            nonNullable: true,
        }),
        email: new FormControl("", {
            validators: Validators.required,
            nonNullable: true,
        }),
        telephone: new FormControl("", {
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
