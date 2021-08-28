import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from './../../../core/services/common.service';
import { QuestionSetService } from './../../services/question-set.service';
import { QuestionSetAssignmentService } from './../../services/question-set-assignment.service';

declare var Splide: any;

@Component({
    selector: "app-commence-exam",
    templateUrl: "./commence-exam.component.html"
})
export class CommenceExamComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls; 
    questionSets:any = {};
    sort = null;
    slide;
    formatedQuestion = {};
    isAnsweredAllQuestion = true;
    setAssignId;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,    
        private route: ActivatedRoute,  
        private router: Router,  
        private commonService: CommonService,
        private questionSetService: QuestionSetService,
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
            this.setAssignId = params.id;
            this.getQuestionSetAssignmentQuestions(params.id);
        });
        this.initiateLocale();
        this.initiateComponent();
    }   

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["commenceExam"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
        this.formCls = this.locale.label.formCls;
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
    }

    getQuestionSetAssignmentQuestions(id) {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "sort": this.sort,
            "_id": id
        };        		
		this.questionSetAssignmentService.getQuestionSetAssignmentQuestions(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.questionSets = res.data;
                this.formatQuesion();
                setTimeout(() => {
                    this.initiateSlider();
                }, 500);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    initiateSlider() {
        let ele = this.nativeEle.querySelector("#image-slider");

        this.slide = new Splide(ele, {
            type       : 'fade',
            heightRatio: 0.9,
            pagination : false,
            arrows     : false,
            // width: "100%",
            height: "250px"
            // cover      : true,
            // autoHeight: true,
            // autoWidth: true
        } ).mount();
        // console.log(this.slider)
    }

    formatQuesion() {
        let i;

        for (i = 0; i < this.questionSets.questionSetId.questions.length; i++) {
            this.formatedQuestion[this.questionSets.questionSetId.questions[i]._id] = {
                "inputType": this.questionSets.questionSetId.questions[i].inputType,
                "answer": this.questionSets.questionSetId.questions[i].answer,
                "isAttempted": false,
                "isAnswered": false,
                "isCorrect": false                
            };
        }
    }

    prev() {        
        this.slide.go( '-1' );
        this.checkAllQuestionAnswered();     
    }

    next() {
        this.slide.go( '+1' ); 
        this.checkAllQuestionAnswered();   
        this.updateQuestionAnswer();      
    }

    updateQuestionAnswer() {        
        let idx = this.slide.index+1, inptEle = this.nativeEle.querySelector("#image-slider-slide0"+idx), currentQuestion:any = {}, inptValue, i, elem, chkBxIsCorrect, chkBxChkdCnt;

        if (inptEle && inptEle.dataset.questionid && this.formatedQuestion[inptEle.dataset.questionid]) {
            currentQuestion = this.formatedQuestion[inptEle.dataset.questionid];
            if (currentQuestion.inputType === 1 || currentQuestion.inputType === 2 || currentQuestion.inputType === 3) {
                inptValue = inptEle.querySelector(".inpt").value;
                    
                this.formatedQuestion[inptEle.dataset.questionid].isAttempted = true;
                this.formatedQuestion[inptEle.dataset.questionid].isAnswered = true;
                this.formatedQuestion[inptEle.dataset.questionid].isCorrect = false;
                if (inptValue && currentQuestion.answer.indexOf(inptValue) !== -1) {
                    this.formatedQuestion[inptEle.dataset.questionid].isCorrect = true;
                } else if (inptValue === "") {
                    this.formatedQuestion[inptEle.dataset.questionid].isAnswered = false;
                }
                this.formatedQuestion[inptEle.dataset.questionid].answer = [inptValue];
            } else if (currentQuestion.inputType === 4) {
                inptValue = "";
                if (inptEle.querySelector(".chkrad:checked")) {
                    inptValue = inptEle.querySelector(".chkrad:checked").value;
                }                
                
                this.formatedQuestion[inptEle.dataset.questionid].isAttempted = true;
                this.formatedQuestion[inptEle.dataset.questionid].isAnswered = true;
                this.formatedQuestion[inptEle.dataset.questionid].isCorrect = false;
                if (inptValue && currentQuestion.answer.indexOf(inptValue) !== -1) {
                    this.formatedQuestion[inptEle.dataset.questionid].isCorrect = true;
                } else if (inptValue === "") {
                    this.formatedQuestion[inptEle.dataset.questionid].isAnswered = false;
                }
                this.formatedQuestion[inptEle.dataset.questionid].answer = [inptValue];
            } else if (currentQuestion.inputType === 5) {                
                this.formatedQuestion[inptEle.dataset.questionid].isAttempted = true;
                this.formatedQuestion[inptEle.dataset.questionid].isAnswered = true;
                this.formatedQuestion[inptEle.dataset.questionid].isCorrect = false;
                chkBxIsCorrect = 0;
                chkBxChkdCnt = 0;
                elem = inptEle.querySelectorAll(".chkchbx:checked");
                inptValue = [];
                for(i = 0; i < elem.length; i++) {
                    chkBxChkdCnt++;                    
                    if (elem[i].value && currentQuestion.answer.indexOf(elem[i].value) !== -1) {
                        chkBxIsCorrect++;
                    }
                    inptValue.push(elem[i].value);
                }
                if (inptValue.length === 0) {
                    inptValue = [""];
                }
                this.formatedQuestion[inptEle.dataset.questionid].answer = inptValue;
                if (chkBxIsCorrect === currentQuestion.answer.length) {
                    this.formatedQuestion[inptEle.dataset.questionid].isCorrect = true;
                }  
                if (chkBxChkdCnt > 0) {
                    this.formatedQuestion[inptEle.dataset.questionid].isAnswered = true;
                } else {
                    this.formatedQuestion[inptEle.dataset.questionid].isAnswered = false;
                }
            }
            
        }
        this.checkAllQuestionAnswered();
    }

    checkIsLastQuestion() {
        return (this.slide && this.slide.index+1 === this.questionSets.questionSetId.questions.length);
    }

    showUnansweredQuestion() {
        let key, idx = 0;

        for(key in this.formatedQuestion) {
            if (this.formatedQuestion[key].isAnswered === false) {
                this.slide.go( idx );
                break;
            }
            idx++;
        }  
        this.checkAllQuestionAnswered();     
    }

    checkAllQuestionAnswered() {
        let key, idx = 0;

        for(key in this.formatedQuestion) {
            if (this.formatedQuestion[key].isAnswered === true) {
                idx++;
            }
        }
        if (idx === this.questionSets.questionSetId.questions.length) {
            this.isAnsweredAllQuestion = true;
        } else {
            this.isAnsweredAllQuestion = false;
        }
    }

    submitAnswer() {
        let res, formatedAnswers = null;

        if (!this.isAnsweredAllQuestion) {
            let res = confirm(this.locale.label.unAnsweredConfirm);
            if (res === false) {
                return false;
            }
            formatedAnswers = this.getFormatedSubmitAnswer();
        } else {
            formatedAnswers = this.getFormatedSubmitAnswer();
        }
        if (formatedAnswers) {
            this.commonService.toggleLoader(true);
            this.questionSetAssignmentService.saveQuestionAnswers(formatedAnswers).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();                
                    this.alertSuccess(res.data);
                    // setTimeout(() => {
                        this.router.navigate(["/admin/exam-result"], {
                            queryParams: { 
                                "setassignid": this.setAssignId,
                                "answerid": res.data.questionAnswerId._id
                            }
                        });
                    // }, 3000);
                },
                err => {
                    this.commonService.toggleLoader(false);
                    this.commonService.showServerValidationError(
                        err, this.formCls, this.nativeEle, this.locale
                    );
                }
            );            
        }
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    getFormatedSubmitAnswer(){
        let questionId, formatedAnswers: any = {}, formatedAnswer = {};

        formatedAnswers = {
            questionSetAssignments: this.questionSets._id,
            userId: this.questionSets.userId._id,
            setId: this.questionSets.questionSetId._id,
            questionAnswers: []
        };

        for(questionId in this.formatedQuestion) {
            formatedAnswer = {
                "questionId": questionId,
                "answer": this.formatedQuestion[questionId].answer,
                "isAnswered": this.formatedQuestion[questionId].isAnswered,
                "isAttempted": this.formatedQuestion[questionId].isAttempted,
                "isCorrect": this.formatedQuestion[questionId].isCorrect
            };
            formatedAnswers.questionAnswers.push(formatedAnswer);
        }

        return formatedAnswers;
    }
    
    setSort(field) {
        let newField;
        
        if (this.sort.hasOwnProperty(field) === false) {
            this.sort = {};
            this.sort[field] = 1;
        } else {
            let newField = -1;

            if (this.sort[field] === newField) {
                newField = 1;                
            }   
            this.sort[field] = newField;                 
        }
        this.commonService.toggleLoader(true);
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}