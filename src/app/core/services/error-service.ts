import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import errorsData from "../../../assets/errors-codes.json";

type ErrorMap = Map<number, string>;

@Injectable({
    providedIn: "root",
})
export class ErrorService {
    private errorMaps = new Map<string, ErrorMap>();

    constructor(private http: HttpClient) {
        this.loadErrors();
    }

    private loadErrors() {
        for (const [errorCtx, codes] of Object.entries(errorsData)) {
            const map = new Map<number, string>();
            for (const [code, message] of Object.entries(codes)) {
                map.set(Number(code), message);
            }
            this.errorMaps.set(errorCtx, map);
        }
    }
    getErrorMessage(errorCtx: string, error: HttpErrorResponse): string {
        const code = error.status;

        if (this.errorMaps.size === 0) {
            console.warn("Error maps not loaded yet");
            return `Unknown error: (${code})`;
        }

        const errorCtxMap = this.errorMaps.get(errorCtx);
        if (errorCtxMap?.has(code)) return errorCtxMap.get(code)!;

        const defaultMap = this.errorMaps.get("default");
        if (defaultMap?.has(code)) return defaultMap.get(code)!;

        return `Unknown error: (${error})`;
    }
}
