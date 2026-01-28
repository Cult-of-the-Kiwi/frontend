import { Component, inject } from "@angular/core";
import {
    ReactiveFormsModule,
    Validators,
    FormGroup,
    FormControl,
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
interface LoginRequestResponse {
    token: string;
    username: string;
    email: string;
    telephone?: string;
    user_id: string;
}

interface LoginRequestBody {
    username: string;
    password: string;
}
const errorCtx = "login";
@Component({
    selector: "log-in",
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: "./log-in.component.html",
    styleUrls: ["./log-in.component.scss", "../auth-cards.scss"],
})
export class LogIn {
    private router = inject(Router);
    private requestService = inject(RequestService);

    loginForm = new FormGroup({
        username: new FormControl("", {
            validators: Validators.required,
            nonNullable: true,
        }),
        password: new FormControl("", {
            validators: Validators.required,
            nonNullable: true,
        }),
    });

    async onSubmit(): Promise<void> {
        if (this.loginForm.invalid) {
            return;
        }
        const { username, password } = this.loginForm.getRawValue();

        try {
            const data = await this.requestService.makeRequest<
                LoginRequestResponse,
                LoginRequestBody
            >("auth/login", HttpMethod.POST, errorCtx, { username, password });
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
            console.log(error);
        }
    }
}
