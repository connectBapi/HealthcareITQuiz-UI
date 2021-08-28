import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class RoleService {
    config;
    route;
    baseUrl;
    rolesEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.rolesEndPoint = this.baseUrl + this.route.rolesEndPoint;
    }
    
    getRoles(param:any = {}) {
        let url = this.rolesEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveRoles(formData, param = {}) {
        let rolesEndPoint = this.rolesEndPoint;

        if (formData._id) {
            rolesEndPoint = this.rolesEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(rolesEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(rolesEndPoint, formData);
        }        
    } 
    
    deleteRoles(id, param = {}) {
        let rolesEndPoint = this.rolesEndPoint+"/"+id;

        return this.http.delete<any>(rolesEndPoint);
    }
}