import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { HttpMethod, RequestService } from "./request-service";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})

export class GroupInfoService{

    private platformId = inject(PLATFORM_ID);
    private requestService = inject(RequestService);

    error: string | null = null;
    members = signal<string[]>([]);

    setMembers(memberIds:string[]){
        this.members.set(memberIds);
    }

    public addMember(memberId:string){
        this.members.set([...this.members(),memberId]);
        console.log(this.members())
    }

    getMembersSignal(){
        return this.members;
    }

    deleteUser(memberId:string){
        this.members.set(this.members().filter((id)=>{
            id !== memberId;
        }));
    }

    async loadMembers(groupId:string): Promise<void> {
        this.setMembers([]);
        const errorCtx = "member-list";

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.error = null;

        const token = localStorage.getItem("token");

        if (!token) {
            this.error = "You're not logged in";
            console.error("There is no token");
            return;
        }

        try {
            const data = await this.requestService.makeRequest<string[]>(
                `group/${groupId}/members`,
                HttpMethod.GET,
                errorCtx,
                undefined,
                { Authorization: `Bearer ${token}` },
                { from: "0", to: "20" },
            );
            if (data){
                this.setMembers(data);
            }
            else{

            }
            
        } catch (err) {
            console.log(err);
        }
    }
}