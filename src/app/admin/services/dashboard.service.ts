import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class DashboardService {
    config;
    route;
    baseUrl;
    dashboardEndpoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.dashboardEndpoint = this.baseUrl + this.route.dashboard;
    }
    
    getDashBoard(param:any = {}) {
        let url = this.dashboardEndpoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }
}