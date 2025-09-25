import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SERVER_ROUTE } from "../../../../../environment/environment.secret";
//En el anterior esto no estaba aquí, pero para proceder a la operación rescate es necesario.
//faltaba por limpiar campos, ya he quitado a la fuerza los que sobraban, ya descubriré porque fallaba
export interface MessageFormat  {
  id?: string;
  sender_id?: string;
  channel_id?: string;
  info?: Record<string, string>; 
  created_at?: string;
  type?:string;
}

@Injectable({providedIn: 'root' })
    
export class RecieveService {
  constructor(private http: HttpClient) {}

getMessages(channelId: string) {
    const from=0;
    const to=50;
    return this.http.get<MessageFormat[]>(//solo podía devolver un mensaje...jeje (hace falta lista)
        `${SERVER_ROUTE}/api/message/${channelId}?from=${from}&to=${to}`,
        {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
  );
}
}
