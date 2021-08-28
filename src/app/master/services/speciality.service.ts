import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class SpecialityService {
    config;
    route;
    baseUrl;
    specialityEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.specialityEndPoint = this.baseUrl + this.route.specialityEndPoint;
    }
    
    getSpecialities(param:any = {}) {
        let url = this.specialityEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveSpecialities(formData, param = {}) {
        let specialityEndPoint = this.specialityEndPoint;

        if (formData._id) {
            specialityEndPoint = this.specialityEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(specialityEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(specialityEndPoint, formData);
        }        
    } 
    
    deleteSpecialities(id, param = {}) {
        let specialityEndPoint = this.specialityEndPoint+"/"+id;

        return this.http.delete<any>(specialityEndPoint);
    }
}