import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class TaskService {
    config;
    route;
    baseUrl;
    tasksEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.tasksEndPoint = this.baseUrl + this.route.tasksEndPoint;
    }
    
    getTasks(param:any = {}) {
        let url = this.tasksEndPoint, params;

        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveTasks(formData, param = {}) {
        let tasksEndPoint = this.tasksEndPoint;

        if (formData._id) {
            tasksEndPoint = this.tasksEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(tasksEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(tasksEndPoint, formData);
        }        
    } 
    
    deleteTasks(id, param = {}) {
        let tasksEndPoint = this.tasksEndPoint+"/"+id;

        return this.http.delete<any>(tasksEndPoint);
    }
}