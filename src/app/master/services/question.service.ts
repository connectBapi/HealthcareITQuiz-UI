import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class QuestionService {
    config;
    route;
    baseUrl;
    questionEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.questionEndPoint = this.baseUrl + this.route.questionEndPoint;
    }
    
    getQuestions(param:any = {}) {
        let url = this.questionEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveQuestions(formData, param = {}) {
        let questionEndPoint = this.questionEndPoint;

        if (formData._id) {
            questionEndPoint = this.questionEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(questionEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(questionEndPoint, formData);
        }        
    } 
    
    deleteQuestions(id, param = {}) {
        let questionEndPoint = this.questionEndPoint+"/"+id;

        return this.http.delete<any>(questionEndPoint);
    }

    getQuestionsByCategory(formdata:any = {}) {
        let url = this.baseUrl+this.route.getQuestionsByCategory;

        return this.http.post<any>(url, formdata);
    }
}