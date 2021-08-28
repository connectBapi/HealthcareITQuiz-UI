import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class UserService {
    config;
    route;
    baseUrl;
    usersEndPoint;
    addressEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.usersEndPoint = this.baseUrl + this.route.usersEndPoint
    }

    signin(formData, queryParams) {
        let usersEndPoint = this.usersEndPoint+'/signin';
        
        return this.http.post<any>(usersEndPoint, formData);
    }
    
    signup(formData, queryParams) {
        let usersEndPoint = this.usersEndPoint;
        
        return this.http.post<any>(usersEndPoint, formData);
    }

    reset(formData, queryParams) {
        let usersEndPoint = this.usersEndPoint+'/reset-link';
        
        return this.http.post<any>(usersEndPoint, formData);
    }

    recover(formData, queryParams) {
        let usersEndPoint = this.usersEndPoint+'/recover';
        
        return this.http.post<any>(usersEndPoint, formData);
    }

    activate(formData, queryParams) {
        let usersEndPoint = this.usersEndPoint+'/activate';
        
        return this.http.post<any>(usersEndPoint, formData);
    }

    getUsers(param: any = {}) {
        let url = this.usersEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveUsers(formData, param: any = {}) {
        let usersEndPoint = this.usersEndPoint;

        if (formData._id) {
            usersEndPoint = this.usersEndPoint+"/"+formData._id;
            delete formData._id;
            delete formData.password;
            return this.http.put<any>(usersEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(usersEndPoint, formData);
        }
    }

    deleteUsers(param: any = {}) {
        let usersEndPoint = this.usersEndPoint+"/"+param._id;
        
        return this.http.delete<any>(usersEndPoint);
    }

    getUserDetails(param: any = {}) {
        let usersEndPoint = this.usersEndPoint+"/"+param.id;

        return this.http.get<any>(usersEndPoint);
    }

    saveProfile(formData, param: any = {}) {
        let usersEndPoint = this.usersEndPoint+"/"+param.id;
        
        return this.http.put<any>(usersEndPoint, formData);             
    }

    changePassword(formData, param: any = {}) {
        let changePasswordEndPoint = this.usersEndPoint + "/"+ this.route.changePassword;
        
        return this.http.post<any>(changePasswordEndPoint, formData);             
    }
}