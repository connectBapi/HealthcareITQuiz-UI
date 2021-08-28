import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionService } from './../../services/question.service';
import { QuestionSetService } from './../../services/question-set.service';

declare var $: any;

@Component({
    selector: "app-question-set",
    templateUrl: "./question-set.component.html"
})
export class QuestionSetComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    questionFrm: FormGroup;
    submitted: Boolean = false;
    questionSearchFrm: FormGroup;
    categories;
    specialities = [];
    questions = [];
    questionSets = [];
    questionId = {};
    questionIdInSet = {};
    isEdit = false;

    sort: any = {
        "setName": 1 
    };
    isFilterApplied = false;
    noRecordFound = false;

    pageNo = 1;
    limit = 10;
    totalCount = 0;
    remainingCount;
    start = this.pageNo;
    end = this.limit;
    loaded = false;
    isAllRecordLoaded = false;
    paginationConfig;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService,
        private specialityService: SpecialityService,
        private categoryService: CategoryService,
        private questionService: QuestionService,
        private questionSetService: QuestionSetService
    ) {}

    ngOnInit() {
        this.commonService.localeObserver.subscribe(
			isLangChanged => {
				if (isLangChanged) {
                    this.initiateLocale();
				}
			}
		);
        this.initiateLocale();
        this.initiateForm();
        this.initiateSearchFrm();
        this.initiateComponent();
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["questionSet"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.questionFrm = this.fb.group({
            "_id": [""],
            "setName": ["", Validators.required],
            "specialityId": [null, Validators.required],
            "categoryId": [null, Validators.required],
            "questionId": [null, Validators.required]            
        });
    }

    initiateSearchFrm() {
        this.questionSearchFrm = this.fb.group({
            "setName": [""],
            "questionName": [""]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.getSpecialities();
    }

    getSpecialities() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.specialityService.getSpecialities(queryParams).subscribe(
			res => {                
                this.specialities = res.data;
                this.getQuestionSets();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    getCategoriesBySpeciality(specialityId = null, isEdit = false, formData = null) {
        let queryParams: any;

        if (specialityId === "null") {
            this.categories = [];
            this.questions = [];
            this.questionIdInSet = [];
            this.questionFrm.get("specialityId").setValue(null);
            this.questionFrm.get("categoryId").setValue(null);
            this.questionFrm.get("questionId").setValue(null);
            // this.resetQuestionIdMs();
            return false;
        }
        this.commonService.toggleLoader(true);
		queryParams = {
            "specialityId": specialityId
        };        		
		this.categoryService.getCategoriesBySpeciality(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.categories = res.data;
                this.questionFrm.get("categoryId").setValue(null);
                this.questions = [];
                this.questionFrm.get("questionId").setValue(null);
                // this.resetQuestionIdMs();
                if (isEdit === true) {
                    this.questionFrm.setValue(formData);
                    this.commonService.scrool2Top();
                }
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }  
    
    getQuestionsByCategory(categoryId = null, isEdit = false, formData = null) {
        let queryParams: any;

        if (categoryId === "null") {
            this.questions = [];
            this.questionFrm.get("questionId").setValue(null);
            this.questionIdInSet = [];
            // this.resetQuestionIdMs();
            return false;
        }
        this.commonService.toggleLoader(true);
		queryParams = {
            "categoryId": categoryId
        };        		
		this.questionService.getQuestionsByCategory(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.questions = res.data;
                this.questionFrm.get("questionId").setValue(null);
                if (isEdit === true) {
                    this.questionFrm.setValue(formData);
                    this.commonService.scrool2Top();
                }
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    resetQuestionIdMs() {
        // this.questionIdMs.clear();
        // this.questionIdMs.makeValid();
        // this.questionIdMs.setData([]);
    }

    getQuestionSets(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.questionSearchFrm.value;
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        queryParams.sort = this.commonService.getQueryString(this.sort);        		
		this.questionSetService.getQuestionSets(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                
                if (isAppend) {
                    this.questionSets = this.questionSets.concat(res.data.records);
                } else {                    
                    this.questionSets = res.data.records;
                    this.setScroll2Top();
                }
                this.setPageNo(pageNo);
                this.setLimit(limit);
                this.setTotalCount(res.data.pageInfo);
                this.setRemainingCount();
                this.setPaginationFlag();
                this.loaded = true;
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }
    
    addQuestionToSet(e) {
        let selectedQuestion = this.nativeEle.querySelectorAll('.question-chbx:checked'), i;

        e.stopPropagation();
        if (selectedQuestion.length === 0) {
            alert(this.locale.label.oneQuestiontoSet);
            return false;
        }
        for(i = 0; i < selectedQuestion.length; i++) {
            this.questionIdInSet[selectedQuestion[i].dataset.id] = {
                "id": selectedQuestion[i].dataset.id,
                "name": selectedQuestion[i].value
            }; 
            this.questionFrm.get("questionId").setValue(selectedQuestion[i].dataset.id);                 
        }
    }

    removeQuestionFromSet(e) {        
        let selectedQuestion = this.nativeEle.querySelectorAll('.set-chbx:checked'), i;

        e.stopPropagation();
        if (selectedQuestion.length === 0) {
            alert(this.locale.label.oneQuestionDeleteConfirm);
            return false;
        }

        if (confirm(this.locale.label.deleteConfirm)) {
            for (i = 0; i < selectedQuestion.length; i++) {
                if (this.questionIdInSet.hasOwnProperty(selectedQuestion[i].dataset.id)) {
                    delete this.questionIdInSet[selectedQuestion[i].dataset.id];
                }                
            }
        }
    }

    saveQuestionSets() {
        let frmData = this.questionFrm.value, queryParams: any;

        frmData = {
            "_id": frmData._id,
            "setName": frmData.setName,
            "questions": this.getQuestionFromSet()
        }
        if (this.isEdit === false) {
            this.submitted = true;
            if (this.questionFrm.invalid) {
                // this.commonService.scrollToElement(this.f, this.nativeEle);
                return false;          
            }
        }        
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.questionSetService.saveQuestionSets(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getQuestionSets();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    getQuestionFromSet() {
        let key, questionIdMsData = [];

        for(key in this.questionIdInSet) {
            questionIdMsData.push(this.questionIdInSet[key].id);
        }

        return questionIdMsData;
    }

    handleClickEvent(target) {
        let classList, trDataSet;

        if (target.className) {
            classList = target.classList;
            trDataSet = target.parentElement.parentElement.dataset;
            if (classList.contains("edit")) {
                this.editQuestionSets(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteQuestionSets(trDataSet);
            }
        }
    }

    editQuestionSets(idx) {
        let formData:any = {}, questions;
        this.questions = [];
        Object.assign(formData, this.questionSets[idx]);

        if (formData.hasOwnProperty("createdDate")) {
            delete formData.createdDate;
        }        
        questions = formData.question;
        delete formData.question;
        this.questionFrm.setValue({
            "_id": formData._id,
            "specialityId": null,
            "categoryId": null,
            "questionId": null,
            "setName": formData.setName
        });
        this.formatSetQuestion(questions);
        this.isEdit = true;
        this.commonService.scrool2Top();
        this.nativeEle.querySelector("#modalBtn").click();
    }

    formatSetQuestion(questions) {
        let i;
        
        for(i = 0; i < questions.length; i++) {
            this.questionIdInSet[questions[i]._id] = {
                "id": questions[i]._id,
                "name": questions[i].questionName
            };                
        }
    }

    deleteQuestionSets(id) {
        if (confirm(this.locale.label.deleteConfirm)) {
            let queryParams = {
                "lang": this.lang
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.questionSetService.deleteQuestionSets(id, queryParams).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getQuestionSets();
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

    resetFrm() {
        this.submitted = false;
        this.questionFrm.reset();
        this.questionIdInSet = {};
        this.questions = [];
        this.isEdit = false;
    }

    get isQuestionSelected() {
        return ((this.nativeEle.querySelectorAll('.regular-checkbox:checked').length > 0) ? true : false);
    }

    get questionIdInSetCnt() {
        return (this.questionIdInSet && Object.keys(this.questionIdInSet).length === 0 && this.questionIdInSet.constructor === Object);
    }

    setSort(field) {
        let newField;

        if (field) {
            if (this.sort.hasOwnProperty(field) === false) {
                this.sort = {};
                this.sort[field] = 1;
            } else {
                newField = -1;
    
                if (this.sort[field] === newField) {
                    newField = 1;                
                }   
                this.sort[field] = newField;                 
            }
        }        
        this.commonService.toggleLoader(true);
        this.getQuestionSets();
    }

    get f() { return this.questionFrm.controls; }

    toggleSearchPanel() {
        let bottomSearch = this.nativeEle.querySelector(".bottom-search");
        
        if (bottomSearch.classList.contains("show") === false) {
            bottomSearch.classList.add("show");
        } else {
            bottomSearch.classList.remove("show");
        }
    }

    resetFilters() {
        this.commonService.toggleLoader(true);
        this.questionSearchFrm.setValue({
            setName: "",
            questionName: ""
        });
        this.isFilterApplied = false;
        this.getQuestionSets();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getQuestionSets(
                false, true, this.pageNo+1, this.limit
            );
        } 
        if (this.loaded === true && this.remainingCount < 0) {
            this.isAllRecordLoaded = true;
        }
    }

    setPageNo(pageNo) {
        this.pageNo = pageNo;
    }

    setLimit(limit) {
        this.limit = parseInt(limit);
    }

    setTotalCount(pageInfo) {
        if (pageInfo[0] && pageInfo[0].count) {
            this.totalCount =  pageInfo[0].count;
        } else {
            this.totalCount = 0;
        }
    }

    setRemainingCount() {
        this.remainingCount = this.totalCount - (this.pageNo*this.limit);
    }

    setPaginationFlag() {
        if (this.pageNo === 1) {
            this.end = this.limit;
            if(this.totalCount <= this.limit) {
                this.end = this.totalCount;
            }
        } else {
            this.end = (((this.pageNo-1)*this.limit)+1)+this.limit;
            if(this.totalCount <= this.end) {
                this.end = this.totalCount;
            }
        }        
    }

    setScroll2Top() {
        if (this.nativeEle.querySelector(".table-responsive")) {
            this.nativeEle.querySelector(".table-responsive").scrollTop = 0;
        }        
    }

    setPageLimit(limit, isProductFetchReq = false) {
        this.commonService.toggleLoader(true);
        this.limit = parseInt(limit);
        if (isProductFetchReq !== false) {
            this.getQuestionSets(
                false, false, 1, this.limit
            );
        }        
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}