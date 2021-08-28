import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class RoleTaskService {
    config;
    route;
    baseUrl;
    roleTasksEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.roleTasksEndPoint = this.baseUrl + this.route.roleTasksEndPoint;
    }
    
    getRoleTasks(param:any = {}) {
        let url = this.roleTasksEndPoint;

        if (param.sort) {
            url += this.commonService.getQueryString(param.sort);
        }
        return this.http.get<any>(url);
    }

    getRoleTasksByRoleId(param:any = {}) {
        let url = this.roleTasksEndPoint+"/"+param.roleId;
        
        return this.http.get<any>(url);
    }

    saveRoleTasks(formData, param = {}) {
        let roleTasksEndPoint = this.roleTasksEndPoint;

        if (formData._id) {
            roleTasksEndPoint = this.roleTasksEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(roleTasksEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(roleTasksEndPoint, formData);
        }        
    } 
    
    deleteRoleTasks(id, param = {}) {
        let roleTasksEndPoint = this.roleTasksEndPoint+"/"+id;

        return this.http.delete<any>(roleTasksEndPoint);
    }
}