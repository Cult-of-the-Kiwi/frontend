import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SERVER_ROUTE } from "../../../../../environment/environment.secret";

export interface MessageFormat {
  sender_id: string;
  channel_id: string;
  message: string;
  created_at: string;
}

@Injectable({ providedIn: "root" })
export class RecieveService {
  constructor(private http: HttpClient) {}

  getMessages(channelId: string) {
    const from = 0;
    const to = 50;
    const token = localStorage.getItem("token") || "";
    // Ensure URL matches your backend. If your backend root is /api/message/, keep it.
    return this.http.get<MessageFormat[]>(
      `${SERVER_ROUTE}api/message/${channelId}?from=${from}&to=${to}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}
