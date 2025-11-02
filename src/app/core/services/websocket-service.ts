import { Observable, Subject } from "rxjs";
import { SERVER_ROUTE } from "../../../environment/environment.secret";

type OpenCallback = () => void;
type CloseCallback = (event: CloseEvent) => void;
type MessageCallback<T> = (message: T) => void;
type ErrorCallback = (error: Event | Error) => void;

interface WebSocketCallbacks<T> {
  onOpen?: OpenCallback;
  onClose?: CloseCallback;
  onMessage?: MessageCallback<T>;
  onError?: ErrorCallback;
}

export class WebSocketService<T> {
  private readonly messageSubject = new Subject<T>();
  private socket!: WebSocket;
  private readonly extension: string;

  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  private readonly keepAliveTime = 30000;

  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  private readonly onOpen?: OpenCallback;
  private readonly onClose?: CloseCallback;
  private readonly onMessage?: MessageCallback<T>;
  private readonly onError?: ErrorCallback;

  // If true, treat incoming messages as plain strings (no JSON parse)
  private readonly isPlainTextMessages: boolean;

  constructor(
    extension: string,
    callbacks?: WebSocketCallbacks<T>,
    options?: { isPlainTextMessages?: boolean }
  ) {
    this.extension = extension;
    this.onOpen = callbacks?.onOpen;
    this.onClose = callbacks?.onClose;
    this.onMessage = callbacks?.onMessage;
    this.onError = callbacks?.onError;
    this.isPlainTextMessages = options?.isPlainTextMessages ?? false;
    this.connectWebSocket();
  }

  public close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // send plain ping (not JSON) to avoid breaking text-only contract
        try { this.socket.send("ping"); } catch (e) { /* noop */ }
      }
    }, this.keepAliveTime);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private reconnectWithBackoff() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log("WebSocketService: reconnecting in " + delay + "ms");

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connectWebSocket();
    }, delay);
  }

  public connect(): Observable<T> {
    // already connects in constructor; this just exposes the observable
    return this.messageSubject.asObservable();
  }

  private connectWebSocket(protocols?: string | string[]) {
  const wsUrl = SERVER_ROUTE.replace("https", "wss") + this.extension;
  const token = localStorage.getItem("token");

  console.log("Intentando abrir socket a", wsUrl);
  console.log("Token enviado como subprotocol:", token);

  if (!token) {
    console.error("❌ No hay token en localStorage");
    return;
  }

  this.socket = new WebSocket(wsUrl, [token]);

  this.socket.onopen = () => {
    console.log("✅ WS abierto correctamente:", wsUrl);
    this.startKeepAlive();
    this.onOpen?.();
  };

  this.socket.onmessage = (event) => {
    console.log("📩 Mensaje recibido (raw):", event.data);
    try {
      const data: T = JSON.parse(event.data);
      this.messageSubject.next(data);
      this.onMessage?.(data);
    } catch (err) {
      console.error("Error parseando JSON:", err);
    }
  };

  this.socket.onclose = (event) => {
    console.warn("❌ Socket cerrado:", event.code, event.reason);
    this.stopKeepAlive();
    this.onClose?.(event);
    this.reconnectWithBackoff();
  };

  this.socket.onerror = (err) => {
    console.error("💥 WS error:", err);
    this.stopKeepAlive();
    this.onError?.(err);
  };
}

  public send(msg: T) {
    if (!this.socket) {
      console.warn("WebSocketService: socket not initialized, dropping send");
      return;
    }
    if (this.socket.readyState === WebSocket.OPEN) {
      // If message is string, send raw (spec requires plain text)
      if (typeof msg === "string") {
        this.socket.send(msg);
      } else {
        // Otherwise send JSON
        this.socket.send(JSON.stringify(msg));
      }
    } else {
      console.warn("WebSocketService: socket not OPEN, message not sent:", msg);
    }
  }
}
