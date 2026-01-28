import {
    Component,
    ElementRef,
    inject,
    Inject,
    PLATFORM_ID,
    signal,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { WebSocketService } from "../../services/websocket-service";
import { isPlatformBrowser } from "@angular/common";

// WebSocket extension
const extension = "/ws/call";

export enum WebSocketMessageType {
    ConnectToRoom = "connecttoroom",
    RTCAnswer = "rtcanswer",
    RTCCandidate = "rtccandidate",
    Offer = "offer",
    Answer = "answer",
    Candidate = "candidate",
}

type MessageFormat =
    | { type: WebSocketMessageType.ConnectToRoom; room_id: string }
    | {
          type: WebSocketMessageType.RTCCandidate;
          candidate: RTCIceCandidateInit;
      }
    | {
          type: WebSocketMessageType.RTCAnswer;
          answer: RTCSessionDescriptionInit;
      }
    | { type: WebSocketMessageType.Offer; sdp: string }
    | { type: WebSocketMessageType.Answer; sdp: string }
    | { type: WebSocketMessageType.Candidate; candidate: RTCIceCandidateInit };

@Component({
    selector: "call",
    templateUrl: "./call.page.html",
    styleUrls: ["./call.page.scss"],
})
export class CallPage {
    @ViewChild("localVideo", { static: true })
    localVideoRef!: ElementRef<HTMLVideoElement>;
    @ViewChild("remoteMediaContainer", { static: true })
    remoteMediaContainerRef!: ElementRef<HTMLDivElement>;

    //This is not angular20
    private route = inject(ActivatedRoute);

    private platformId: object;
    private token = "";
    private websocketService!: WebSocketService<MessageFormat>;
    private groupId = "";

    private localStream!: MediaStream;
    private peerConnection!: RTCPeerConnection;
    private remoteStreams = new Map<string, MediaStream>();
    public cameraOn = signal<boolean>(true);
    public micOn = signal<boolean>(true);

    private configuration: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    private callbacks = {
        onOpen: this.handleOpen.bind(this),
    };

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.platformId = platformId;

        //localstorage is key
        if (isPlatformBrowser(this.platformId)) {
            this.token = localStorage.getItem("token") ?? "";
        }
    }

    ngOnInit() {
        // Just in bowser (Mario Bros guy)
        if (!isPlatformBrowser(this.platformId)) return;

        this.groupId = this.route.snapshot.paramMap.get("groupId")!;

        this.websocketService = new WebSocketService(
            extension,
            this.callbacks,
            this.token,
        );
    }

    ngOnDestroy() {
        this.leaveCall();
    }

    async handleOpen() {
        if (!isPlatformBrowser(this.platformId)) return;

        const nav = window.navigator;
        this.localStream = new MediaStream();

        try {
            const videoStream = await nav.mediaDevices.getUserMedia({
                video: true,
            });
            videoStream.getVideoTracks().forEach((track) => {
                this.localStream.addTrack(track);
                this.cameraOn.set(true);
            });
        } catch (e) {
            console.warn("No hay cámara disponible");
            this.cameraOn.set(false);
        }

        try {
            const audioStream = await nav.mediaDevices.getUserMedia({
                audio: true,
            });
            audioStream.getAudioTracks().forEach((track) => {
                this.localStream.addTrack(track);
                this.micOn.set(true);
            });
        } catch (e) {
            console.warn("No hay micrófono disponible");
            this.micOn.set(false);
        }

        if (this.localStream.getVideoTracks().length > 0) {
            this.localVideoRef.nativeElement.srcObject = this.localStream;
            this.localVideoRef.nativeElement.muted = true;
        }

        this.peerConnection = new RTCPeerConnection(this.configuration);

        this.localStream.getTracks().forEach((track) => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        let counter = 0;
        this.peerConnection.ontrack = (event) => {
            if (counter < 2) {
                counter++;
                return;
            }

            const [stream] = event.streams;
            const userId = stream.id;

            if (!this.remoteStreams.has(userId)) {
                this.remoteStreams.set(userId, stream);

                const container = document.createElement("div");
                container.className = "user-media";
                container.id = `remote-user-${userId}`;

                const video = document.createElement("video");
                video.autoplay = true;
                video.playsInline = true;
                video.srcObject = stream;
                video.onloadedmetadata = () => video.play().catch(console.warn);

                const label = document.createElement("div");
                label.textContent = `Usuario: ${userId}`;

                container.appendChild(label);
                container.appendChild(video);
                this.remoteMediaContainerRef.nativeElement.appendChild(
                    container,
                );
            }
        };
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.websocketService.send({
                    type: WebSocketMessageType.RTCCandidate,
                    candidate: event.candidate,
                });
            }
        };
        this.websocketService.send({
            type: WebSocketMessageType.ConnectToRoom,
            room_id: this.groupId,
        });
    }

    async toggleCamera() {
        
        if (!this.localStream || !this.peerConnection) return;

        const sender = this.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === "video");

        if (this.cameraOn()) {
            sender?.track?.stop();
            sender?.replaceTrack(null);
            this.localStream
                .getVideoTracks()
                .forEach((t) => this.localStream.removeTrack(t));
            this.cameraOn.set(false);
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            const videoTrack = stream.getVideoTracks()[0];
            this.localStream.addTrack(videoTrack);
            sender?.replaceTrack(videoTrack);
            this.cameraOn.set(true);
        }
    }

    async toggleMic() {
        if (!this.localStream || !this.peerConnection) return;

        const sender = this.peerConnection
            .getSenders()
            .find((s) => s.track?.kind === "audio");

        if (this.micOn()) {
            sender?.track?.stop();
            sender?.replaceTrack(null);
            this.localStream
                .getAudioTracks()
                .forEach((t) => this.localStream.removeTrack(t));
            this.micOn.set(false);
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const audioTrack = stream.getAudioTracks()[0];
            this.localStream.addTrack(audioTrack);
            sender?.replaceTrack(audioTrack);
            this.micOn.set(true);
        }
    }

    //THis will avoid us entering jail
    leaveCall() {
        if (this.peerConnection) {
            this.peerConnection.ontrack = null;
            this.peerConnection.onicecandidate = null;
            this.peerConnection.close();
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
        }

        this.remoteStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
        this.remoteStreams.clear();

        if (this.remoteMediaContainerRef) {
            this.remoteMediaContainerRef.nativeElement.innerHTML = "";
        }

        if (this.websocketService) {
            this.websocketService.disconnect();
        }

        console.log("Llamada finalizada correctamente");
    }
}
