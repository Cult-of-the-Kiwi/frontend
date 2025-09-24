import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Observable, firstValueFrom } from "rxjs";
import { SERVER_ROUTE } from "../../../environment/environment.secret";
import { ErrorService } from "./error-service";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

@Injectable({
    providedIn: "root",
})
export class RequestService {
    constructor(
        private errorService: ErrorService,
        private http: HttpClient,
    ) {}

    async makeRequest<T, B = unknown>(
        //A shitty way to pass the lint
        extension: string,
        method: HttpMethod,
        body?: B,
        headers?: Record<string, string>,
        context: string = "",
    ): Promise<T> {
        const url = SERVER_ROUTE + "/api/" + extension;
        let httpHeaders = new HttpHeaders({
            "Content-Type": "application/json",
            ...headers,
        });

        let request: Observable<T>;

        //"Let's make a map"
        switch (method) {
            case HttpMethod.GET:
                request = this.http.get<T>(url, { headers: httpHeaders });
                break;
            case HttpMethod.POST:
                request = this.http.post<T>(url, body, {
                    headers: httpHeaders,
                });
                break;
            case HttpMethod.PUT:
                request = this.http.put<T>(url, body, { headers: httpHeaders });
                break;
            case HttpMethod.DELETE:
                request = this.http.delete<T>(url, { headers: httpHeaders });
                break;
            default:
                throw new Error(`HTTP method ${method} not supported`);
        }
        try {
            return await firstValueFrom(request);
        } catch (err) {
            const error = err as HttpErrorResponse;
            this.errorService.getErrorMessage(context, error);
            throw error;
        }
    }
}
