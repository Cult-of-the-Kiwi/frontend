import { inject, Injectable } from "@angular/core";
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Observable, firstValueFrom } from "rxjs";
import { SERVER_ROUTE } from "../../../environment/environment.secret";
import { ErrorService } from "./error-service";

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

@Injectable({
    providedIn: "root",
})
export class RequestService {
    private errorService = inject(ErrorService);
    private http = inject(HttpClient);

    async makeRequest<T, B = unknown>(
        //A shitty way to pass the lint
        extension: string,
        method: HttpMethod,
        errorCtx: string = "",
        body?: B,
        headers?: Record<string, string>,
        params?: Record<string, string>,
    ): Promise<T> {
        const url = SERVER_ROUTE + "api/" + extension;
        let httpHeaders = new HttpHeaders({
            "Content-Type": "application/json",
            ...headers,
        });

        let request: Observable<T>;

        //"Let's make a map"
        switch (method) {
            case HttpMethod.GET:
                request = this.http.get<T>(url, {
                    headers: httpHeaders,
                    params,
                });
                break;
            case HttpMethod.POST:
                request = this.http.post<T>(url, body, {
                    headers: httpHeaders,
                    params,
                });
                break;
            case HttpMethod.PUT:
                request = this.http.put<T>(url, body, {
                    headers: httpHeaders,
                    params,
                });
                break;
            case HttpMethod.DELETE:
                request = this.http.delete<T>(url, {
                    headers: httpHeaders,
                    params,
                });
                break;
            default:
                throw new Error(`HTTP method ${method} not supported`);
        }
        try {
            return await firstValueFrom(request);
        } catch (err) {
            const error = err as HttpErrorResponse;
            return Promise.reject(
                this.errorService.getErrorMessage(errorCtx, error),
            );
        }
    }
}
