import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionSetAssignmentService } from './../../services/question-set-assignment.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: "app-exam-result",
    templateUrl: "./exam-result.component.html"
})
export class ExamResultComponent implements OnInit, OnDestroy {    
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
    answerId;
    setAssignId;

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
            this.setAssignId = params.setassignid;
            this.answerId = params.answerid;
            this.getQuestionAnswersByQuestionSetAssignId(params.answerid);
        });
        this.initiateLocale();
        this.initiateComponent();
    }   

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["examResult"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
    }

    getQuestionAnswersByQuestionSetAssignId(id) {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "_id": id
        };        		
		this.questionSetAssignmentService.getQuestionAnswersByQuestionSetAssignId(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.questionResults = res.data.questionAnsweDoc;
                // this.isSubmitted = res.data.isSubmitted;
                this.calculatePercentage();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    calculatePercentage() {
        let i, correctCnt = 0, questionResults:any = this.questionResults,
        totalQuestionCnt = questionResults.questionAnswers.length, percentage = 0;

        this.totalCnt = totalQuestionCnt;

        for(i = 0; i < questionResults.questionAnswers.length; i++) {
            if (questionResults.questionAnswers[i].isCorrect) {
                correctCnt++;
            }
        }
        this.percentage = (correctCnt/totalQuestionCnt)*100;
    }

    getCheckedChbx(answer, option) {
        return (answer.indexOf(option) !== -1) ? true : false;
    }

    retake() {
        this.router.navigate(["/admin/commence-exam"], {
            queryParams: {
                "id": this.setAssignId
            }    
        });
    }

    review() {
        this.router.navigate(["/admin/exam-review"], {
            queryParams: {
                "id": this.answerId
            }    
        });
    }

    exitExam() {
        // let res, params: any = {};
        // params._id = this.answerId;

        // this.commonService.toggleLoader(true);
        // this.questionSetAssignmentService.saveQuestionAnswers(params).subscribe(
        //     res => {
        //         this.getQuestionAnswersByQuestionSetAssignId(this.answerId)
        //         this.commonService.toggleLoader(false);
        //         this.commonService.scrool2Top();                
        //         this.alertSuccess(res.data);
        //     },
        //     err => {
        //         this.commonService.toggleLoader(false);
        //         this.commonService.showServerValidationError(
        //             err, this.formCls, this.nativeEle, this.locale
        //         );
        //     }
        // );   
        this.router.navigate(["admin/take-exam"]);
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    checkIsEnableBtn() {
        let questionResults:any = this.questionResults;
        // console.log(this.totalCnt, this.isSubmitted)

        return ((this.totalCnt === 3) || (this.isSubmitted === true)) ? false: true;
    }
    
    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}