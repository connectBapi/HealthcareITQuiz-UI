import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionService } from './../../services/question.service';

declare var $: any;

@Component({
    selector: "app-question",
    templateUrl: "./question.component.html"
})
export class QuestionComponent implements OnInit, OnDestroy {    
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
    sort:any = {
        "questionName": 1 
    };
    answers = [];
    options = [];
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
    specialityId2Name = {};
    categoryId2Name = {};

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService,
        private specialityService: SpecialityService,
        private categoryService: CategoryService,
        private QuestionService: QuestionService
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
        this.locale = this.commonService.getLocale()["master"]["question"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.questionFrm = this.fb.group({
            "_id": [""],
            "specialityId": [null, Validators.required],
            "categoryId": [null, Validators.required],
            "questionName": ["", Validators.required],            
            "inputType": [null, Validators.required],
            "options": ["", Validators.required],
            "answer": ["", Validators.required],
            "comments": [""]
        });        
    }

    initiateSearchFrm() {
        this.questionSearchFrm = this.fb.group({
            "specialityId": [null],
            "categoryId": [null],
            "questionName": [""],            
            "inputType": [null],
            "options": [""],
            "answer": [""]
        });        
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);        
        this.getSpecialities();
        // this.addOptions();
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
                this.formatSpecialityIdName();
                this.getQuestions();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    formatSpecialityIdName() {
        let i;

        for(i = 0; i < this.specialities.length; i++) {
            this.specialityId2Name[this.specialities[i]._id] = this.specialities[i].specialityName;
        }
    }

    getQuestions(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.questionSearchFrm.value;
        if(queryParams.specialityId === null) {
            queryParams.specialityId = '';
        }
        if(queryParams.categoryId === null) {
            queryParams.categoryId = '';
        }
        if(queryParams.inputType === null) {
            queryParams.inputType = '';
        }
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        queryParams.sort = this.commonService.getQueryString(this.sort);       		
		this.QuestionService.getQuestions(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                
                if (isAppend) {
                    this.questions = this.questions.concat(res.data.records);
                } else {                    
                    this.questions = res.data.records;
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

    getCategoriesBySpeciality(specialityId = null, isEdit = false, formData = null) {
        let queryParams: any;

        if (specialityId === "null") {
            this.categories = [];
            this.questionFrm.get("categoryId").setValue(null);
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
                this.formatCategoryIdName();
                this.questionFrm.get("categoryId").setValue(null);
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
    
    formatCategoryIdName() {
        let i;

        for(i = 0; i < this.categories.length; i++) {
            this.categoryId2Name[this.categories[i]._id] = this.categories[i].categoryName;
        }
    }

    saveQuestions() {
        let frmData = this.questionFrm.value, queryParams: any,
            optionError;

        this.submitted = true;
        optionError = this.showOptionValidationError();

		if (this.questionFrm.invalid || !optionError) {
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;          
        }
        this.getOptionsVal();
        frmData.options = this.options;
        frmData.answer = this.answers;
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.QuestionService.saveQuestions(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getQuestions();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    addOptions() {
        let totalOptions = this.options.length, questionFrmValue = this.questionFrm.value, inputType = questionFrmValue.inputType;

        if (!inputType) {
            alert(this.locale.label.selectType);
            return false;
        }
        if ((inputType === "1" || inputType === "2") && totalOptions > 0) {
            alert(this.locale.label.inputOptionPopup);
            return false;
        }

        for(let i = totalOptions; i < (totalOptions+1); i++) {
            this.options.push(i);
        }
        this.questionFrm.get("options").setValue(this.options.join(",")); 
        setTimeout(() => { this.showOptionValidationError();}, 0);
    } 
    
    removeOptions(e) {
        let chbxEle = this.nativeEle.querySelectorAll(".option-chbx:checked"), i, inptEle, optionsArrData = this.options;

        if (chbxEle.length === 0) {
            alert(this.locale.label.atleastOneOption);
            return false;
        }
        for(i = 0; i < chbxEle.length; i++) {
            if (chbxEle[i].checked) {
                optionsArrData.splice(
                    optionsArrData.indexOf(parseInt(chbxEle[i].value)), 1
                );

                inptEle = chbxEle[i].parentElement.parentElement.querySelector(".inpt.opts");
                if (inptEle && inptEle.value && this.answers.indexOf(inptEle.value) !== -1) {                        
                    this.answers.splice(this.answers.indexOf(inptEle.value), 1);
                }
            }            
        } 
        if (this.answers.length === 0) {
            this.questionFrm.get("answer").setValue("");
            this.questionFrm.get("options").setValue("");
        }
        this.showOptionValidationError();
    }

    showOptionValidationError() {
        let optInptEle = this.nativeEle.querySelectorAll(".opts"), i, isOptionValid = true;
        
        if (this.submitted === false) {
            return true;
        }
        for(i = 0; i < optInptEle.length; i++) {
            if (optInptEle[i].value) {                
                if (optInptEle[i].parentElement.querySelector(".error")) {
                    optInptEle[i].parentElement.querySelector(".error").classList.add("ds-9");
                    optInptEle[i].classList.remove("is-invalid");
                }
            } else {
                isOptionValid = false;
                optInptEle[i].parentElement.querySelector(".error").classList.remove("ds-9");
                optInptEle[i].classList.add("is-invalid");
            }
        }
        this.toggleOptionOuterError();        

        return isOptionValid;
    }

    toggleOptionOuterError() {
        let optOuter = this.nativeEle.querySelector(".option-outer"), optOuterError;

        optOuterError = this.nativeEle.querySelector(".option-outer + .error");
        if (this.options.length === 0) { 
            optOuter.classList.add("is-invalid");
            optOuterError.classList.remove("ds-9"); 
            return false;                       
        } else {
            optOuter.classList.remove("is-invalid");
            optOuterError.classList.add("ds-9");
        }
    }

    resetOptionAnser() {
        this.options = [];
        this.answers = [];
        this.showOptionValidationError();
        this.questionFrm.get("options").setValue(""); 
        this.questionFrm.get("answer").setValue("");
    }

    addAnswer() {
        let questionFrmValue = this.questionFrm.value, i, answers = [], 
        chbxEle = this.nativeEle.querySelectorAll(".option-chbx:checked"),
        inptEle, inputType = questionFrmValue.inputType, j, inptBlankCnt = 0;
       
        if (chbxEle.length === 0) {
            alert(this.locale.label.atleastOneOption);
            return false;
        }

        if (!inputType) {
            alert(this.locale.label.selectType);
            return false;
        }

        if(((inputType === "1" || inputType === "2" || inputType === "3" || inputType === "4") && chbxEle.length > 1) || (this.answers.length > 0)) {
            alert(this.locale.label.multipleAnswerOnlyValid);
            return false;
        }

        for(i = 0; i< chbxEle.length; i++) {
            if (chbxEle[i].parentElement.parentElement) {                
                inptEle = chbxEle[i].parentElement.parentElement.querySelector(".inpt.opts");                
                if (inptEle.value) { 
                    answers.push(inptEle.value); 
                } else {
                    inptBlankCnt++;
                }
            }
        }
        if (inptBlankCnt > 0) {
            alert(this.locale.label.enterOptVal);
            return false;
        }
        for(i = 0; i < answers.length; i++) {
            if (this.answers.indexOf(answers[i]) === -1) {
                this.answers.push(answers[i]);
            }            
        }
        this.questionFrm.get("answer").setValue(this.answers.join(","));
    }

    removeAnswer() {
        let chbxEle = this.nativeEle.querySelectorAll(".answer-chbx:checked"),
        i;
       
        if (chbxEle.length === 0) {
            alert(this.locale.label.atleastOneOption);
            return false;
        }

        for(i = 0; i< chbxEle.length; i++) { 
            if (chbxEle[i] && chbxEle[i].value && this.answers.indexOf(chbxEle[i].value) !== -1) {                        
                this.answers.splice(this.answers.indexOf(chbxEle[i].value), 1);
            }
        }
        if (this.answers.length === 0) {
            this.questionFrm.get("answer").setValue("");
        }
    }

    getOptionsVal() {
        let i, chbxEle = this.nativeEle.querySelectorAll(".option-chbx"), inptEle;

        this.options = [];
        for (i = 0; i < chbxEle.length; i++) {
            inptEle = chbxEle[i].parentElement.parentElement.querySelector(".inpt.opts");
            this.options.push(inptEle.value);
        }
    }

    handleClickEvent(target) {
        let classList, trDataSet;

        if (target.className) {
            classList = target.classList;
            trDataSet = target.parentElement.parentElement.dataset;
            if (classList.contains("edit")) {
                this.editQuestions(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteQuestions(trDataSet);
            }
        }
    }

    editQuestions(idx) {
        let formData:any = {}, specialityId, categoryId;
        this.options = [];
        this.answers = [];
        this.commonService.toggleLoader(true);
        Object.assign(formData, this.questions[idx]);

        if (formData.hasOwnProperty("createdDate")) {
            delete formData.createdDate;
        }
        specialityId = formData.speciality._id;
        categoryId = formData.category._id;
        delete formData.category;
        delete formData.speciality;
        formData.specialityId = specialityId;
        formData.categoryId = categoryId;
        this.options = formData.options;
        this.answers = formData.answer;
        setTimeout(() => { this.setOptionValue();}, 0);
        this.getCategoriesBySpeciality(specialityId, true, formData);
        this.nativeEle.querySelector("#modalBtn").click();
    }

    setOptionValue() {
        let i, chbxEle = this.nativeEle.querySelectorAll(".option-chbx"), inptEle;

        for (i = 0; i < chbxEle.length; i++) {
            inptEle = chbxEle[i].parentElement.parentElement.querySelector(".inpt.opts");
            inptEle.value = this.options[i];
        }
    }

    deleteQuestions(id) {
        if (confirm(this.locale.label.deleteConfirm)) {
            let queryParams = {
                "lang": this.lang
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.QuestionService.deleteQuestions(id, queryParams).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getQuestions();
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
        let optOuter = this.nativeEle.querySelector(".option-outer"), optOuterError;

        optOuterError = this.nativeEle.querySelector(".option-outer + .error");
        optOuter.classList.remove("is-invalid");
        optOuterError.classList.add("ds-9");
        this.submitted = false;
        this.questionFrm.reset();
        this.options = [];
        this.answers = [];
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
        this.getQuestions();
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
            "specialityId": null,
            "categoryId": null,
            "questionName": "",            
            "inputType": null,
            "options": "",
            "answer": ""
        });
        this.isFilterApplied = false;
        this.getQuestions();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getQuestions(
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
            this.getQuestions(
                false, false, 1, this.limit
            );
        }        
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}