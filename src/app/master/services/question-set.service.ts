import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class QuestionSetService {
    config;
    route;
    baseUrl;
    questionSetEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.questionSetEndPoint = this.baseUrl + this.route.questionSetEndPoint;
    }
    
    getQuestionSets(param:any = {}) {
        let url = this.questionSetEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    getQuestionSetDetails(param:any = {}) {
        let url = this.questionSetEndPoint+"/"+param._id;
       
        return this.http.get<any>(url);
    }

    saveQuestionSets(formData, param = {}) {
        let questionSetEndPoint = this.questionSetEndPoint;

        if (formData._id) {
            questionSetEndPoint = this.questionSetEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(questionSetEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(questionSetEndPoint, formData);
        }        
    } 
    
    deleteQuestionSets(id, param = {}) {
        let questionSetEndPoint = this.questionSetEndPoint+"/"+id;

        return this.http.delete<any>(questionSetEndPoint);
    }
}