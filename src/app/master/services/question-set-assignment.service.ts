import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CommonService } from "./../../core/services/common.service";

@Injectable()
export class QuestionSetAssignmentService {
    config;
    route;
    baseUrl;
    questionSetAssignmentEndPoint;
    questionAnswerEndPoint;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        this.config = this.commonService.getConfig();
        this.route = this.commonService.getRoute();
        this.baseUrl = this.route.baseUrl;
        this.questionSetAssignmentEndPoint = this.baseUrl + this.route.questionSetAssignmentEndPoint;
        this.questionAnswerEndPoint = this.baseUrl + this.route.questionAnswerEndPoint;
    }
    
    getQuestionSetAssignments(param:any = {}) {
        let url = this.questionSetAssignmentEndPoint, params;
        
        params = new HttpParams({ fromObject: param });

        return this.http.get<any>(url, { params });
    }

    saveQuestionSetAssignments(formData, param = {}) {
        let questionSetAssignmentEndPoint = this.questionSetAssignmentEndPoint;

        if (formData._id) {
            questionSetAssignmentEndPoint = this.questionSetAssignmentEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(questionSetAssignmentEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(questionSetAssignmentEndPoint, formData);
        }        
    } 

    getQuestionSetAssignmentQuestions(formData) {
        let questionSetAssignmentEndPoint = this.questionSetAssignmentEndPoint+"/"+formData._id;
       
        return this.http.get<any>(questionSetAssignmentEndPoint);
    }
    
    deleteQuestionSetAssignments(id, param = {}) {
        let questionSetAssignmentEndPoint = this.questionSetAssignmentEndPoint+"/"+id;

        return this.http.delete<any>(questionSetAssignmentEndPoint);
    }

    saveQuestionAnswers(formData, param = {}) {
        let questionAnswerEndPoint = this.questionAnswerEndPoint;

        if (formData._id) {
            questionAnswerEndPoint = this.questionAnswerEndPoint+"/"+formData._id;
            delete formData._id;
            return this.http.put<any>(questionAnswerEndPoint, formData);
        } else {
            delete formData._id;
            return this.http.post<any>(questionAnswerEndPoint, formData);
        }        
    }

    getQuestionAnswersByQuestionSetAssignId(formData) {
        let questionAnswerEndPoint = this.questionSetAssignmentEndPoint+"/"+formData._id+"/exam-result";
       
        return this.http.get<any>(questionAnswerEndPoint);
    }

    getQuestionAnswersDetailByQuestionSetAssignId(formData) {
        let questionAnswerEndPoint = this.baseUrl + this.route.questionResultByQuestionSetId+"/"+formData._id;
       
        return this.http.get<any>(questionAnswerEndPoint);
    }

    getExamReview(formData) {
        let questionAnswerEndPoint = this.baseUrl + this.route.examReview+"/"+formData._id;
       
        return this.http.get<any>(questionAnswerEndPoint);
    }    
}