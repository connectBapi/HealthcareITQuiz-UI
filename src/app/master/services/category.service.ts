import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class CategoryService {
    config;
    route;
    baseUrl;
    categoryEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.categoryEndPoint = this.baseUrl + this.route.categoryEndPoint;
    }
    
    getCategories(param:any = {}) {
        let url = this.categoryEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveCategories(formData, param = {}) {
        let categoryEndPoint = this.categoryEndPoint;

        if (formData._id) {
            categoryEndPoint = this.categoryEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(categoryEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(categoryEndPoint, formData);
        }        
    } 
    
    deleteCategories(id, param = {}) {
        let categoryEndPoint = this.categoryEndPoint+"/"+id;

        return this.http.delete<any>(categoryEndPoint);
    }

    getCategoriesBySpeciality(formdata:any = {}) {
        let url = this.baseUrl+this.route.getCategoriesBySpeciality;

        return this.http.post<any>(url, formdata);
    }
}