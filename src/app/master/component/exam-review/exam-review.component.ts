import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionSetAssignmentService } from './../../services/question-set-assignment.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: "app-exam-review",
    templateUrl: "./exam-review.component.html"
})
export class ExamReviewComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls; 
    questionResults = [];
    sort = null;
    totalCnt = 0;
    percentage;
    id;
    isSubmitted = false;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,      
        private route: ActivatedRoute,  
        private router: Router,
        private commonService: CommonService,
        private specialityService: SpecialityService,
        private categoryService: CategoryService,
        private questionSetAssignmentService: QuestionSetAssignmentService
    ) {}

    ngOnInit() {
        this.commonService.localeObserver.subscribe(
			isLangChanged => {
				if (isLangChanged) {
                    this.initiateLocale();
				}
			}
        );
        this.route.queryParams.subscribe(params => {
            this.id = params.id;
            this.getExamReview(params.id);
        });
        this.initiateLocale();
        this.initiateComponent();
    }   

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["examReview"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
    }

    getExamReview(id) {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "_id": id
        };        		
		this.questionSetAssignmentService.getExamReview(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.questionResults = res.data.questionAnsweDoc;
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    getQuestionAnswer(answer) {
        return answer.join(',');
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}