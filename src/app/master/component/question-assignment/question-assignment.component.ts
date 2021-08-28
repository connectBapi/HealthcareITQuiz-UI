import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionService } from './../../services/question.service';
import { QuestionSetService } from './../../services/question-set.service';
import { UserService } from './../../../user/services/user.services';
import { QuestionSetAssignmentService } from './../../services/question-set-assignment.service';

declare var $: any;

@Component({
    selector: "app-question-assignment",
    templateUrl: "./question-assignment.component.html"
})
export class QuestionAssignmentComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    questionAssignmentFrm: FormGroup;
    submitted: Boolean = false;
    categories;
    specialities = [];
    questions = [];

    questionSets = [];
    users = [];
    questionSetAssignments = [];
    questionAssignmentSearchFrm: FormGroup;
    sort: any = {
        "setName": 1 
    };
    questionIdMs;
    questionId = {};
    questionIdInSet = {};

    questionSetIdMs;
    list = [];
    option;
    isEdit = false;
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
    userId2Name = {};
    setId2Name = {};

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService,
        private specialityService: SpecialityService,
        private categoryService: CategoryService,
        private questionService: QuestionService,
        private questionSetService: QuestionSetService,
        private userService: UserService,
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
        this.initiateLocale();
        this.initiateForm();
        this.initiateSearchFrm();
        this.initiateComponent();
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["questionAssignment"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.questionAssignmentFrm = this.fb.group({
            "_id": [""],
            "questionSetId": [null, Validators.required],
            "userId": [null, Validators.required]
        });
    }

    initiateSearchFrm() {
        this.questionAssignmentSearchFrm = this.fb.group({
            "questionSetId": [null],
            "userId": [null]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);        
        this.getQuestionSetAssignments();
        this.getQuestionSets();
        this.getGetUsers();
    }

    getSpecialities() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang
        };        		
		this.specialityService.getSpecialities(queryParams).subscribe(
			res => {                
                this.specialities = res.data;
                this.commonService.toggleLoader(false);
                this.getQuestionSets();
                // this.initiateQuestionIdMs();
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
            this.questionAssignmentFrm.get("specialityId").setValue(null);
            this.questionAssignmentFrm.get("categoryId").setValue(null);
            this.questionAssignmentFrm.get("questionId").setValue(null);
            this.resetQuestionIdMs();
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
                this.questionAssignmentFrm.get("categoryId").setValue(null);
                this.questions = [];
                this.questionAssignmentFrm.get("questionId").setValue(null);
                this.resetQuestionIdMs();
                if (isEdit === true) {
                    this.questionAssignmentFrm.setValue(formData);
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
            this.questionAssignmentFrm.get("questionId").setValue(null);
            this.resetQuestionIdMs();
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
                this.questionAssignmentFrm.get("questionId").setValue(null);
                this.resetQuestionIdMs();
                this.createQuestionDropDown();
                if (isEdit === true) {
                    this.questionAssignmentFrm.setValue(formData);
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

    createQuestionDropDown() {
        let i, obj, list = [];

        for(i = 0; i< this.questions.length; i++) {
            obj = {
                id: this.questions[i]._id,
                name: this.questions[i].questionName
            };
            list.push(obj);
        }
        this.questionIdMs.setData(list);
    }

    initiateQuestionIdMs(list = []) {
        $(document).on( "click", ".ms-close-btn", (e) => {
            this.removeQuestionFromSet(e.target.getAttribute("id"));
        });
        $(() => {
            this.questionIdMs = $('#questionId').magicSuggest({
                placeholder: this.locale.label.questionId.placeholder,
                allowFreeEntries: false,
                data: list,
                toggleOnClick: true,
            });
            $(this.questionIdMs).on('selectionchange', (e,m, rec) => {
                if (JSON.stringify(this.questionIdMs.getValue()) === "[]") {
                    if (this.submitted) {
                        this.questionIdMs.makeInvalid(); 
                    } else {
                        // this.defaultRoleMs.makeValid();
                    }                   
                } else {                    
                    this.questionIdMs.makeValid();
                    this.questionAssignmentFrm.get("questionId").setValue(
                        this.questionIdMs.getValue()
                    );
                    this.addQuestionToSet();
                }
            });
        });
    }

    resetQuestionIdMs() {
        this.questionIdMs.clear();
        this.questionIdMs.makeValid();
        this.questionIdMs.setData([]);
    }

    getQuestionSets() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.questionSetService.getQuestionSets(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.questionSets = res.data;
                this.formatQuestionSetIdName();
                this.setOption();
                this.initiateQuestionSetIdMs();
                this.createQuestionSetDropDown();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    formatQuestionSetIdName() {
        let i;

        for(i = 0; i < this.questionSets.length; i++) {
            this.setId2Name[this.questionSets[i]._id] = this.questionSets[i].setName;
        }
    }

    createQuestionSetDropDown() {
        let i, obj, list = [];

        for(i = 0; i< this.questionSets.length; i++) {
            obj = {
                id: this.questionSets[i]._id,
                name: this.questionSets[i].setName
            };
            list.push(obj);
        }
        this.list = list;
        this.questionSetIdMs.setData(list);
    }

    setOption() {
        this.option = {
            placeholder: this.locale.label.questionSetId.placeholder,
            allowFreeEntries: false,
            data: this.list,
            toggleOnClick: true,
        }
    }

    initiateQuestionSetIdMs(list = [], ) {
        $(document).on( "click", ".ms-close-btn", (e) => {
            this.removeQuestionFromSet(e.target.getAttribute("id"));
        });
        $(() => {
            this.questionSetIdMs = $('#questionSetId').magicSuggest(this.option);
            $(this.questionSetIdMs).on('selectionchange', (e,m, rec) => {
                if (JSON.stringify(this.questionSetIdMs.getValue()) === "[]") {
                    if (this.submitted && this.isEdit === false) {
                        this.questionSetIdMs.makeInvalid(); 
                        this.questionAssignmentFrm.get("questionSetId").setValue(null);
                    }                   
                } else {
                    if (this.isEdit === false) {
                        this.questionSetIdMs.makeValid();
                        this.questionAssignmentFrm.get("questionSetId").setValue(
                            this.questionSetIdMs.getValue()
                        );
                    }
                }
            });
        });
    }

    getGetUsers() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.userService.getUsers(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.users = res.data;
                this.formatSpecialityIdName();
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

        for(i = 0; i < this.users.length; i++) {
            this.userId2Name[this.users[i]._id] = this.users[i].firstName+" "+this.users[i].lastName;
        }
    }

    getQuestionSetAssignments(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.questionAssignmentSearchFrm.value;
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        if (queryParams.questionSetId === null) {
            queryParams.questionSetId = '';
        }
        if (queryParams.userId === null) {
            queryParams.userId = '';
        }
        queryParams.sort = this.commonService.getQueryString(this.sort);       		
		this.questionSetAssignmentService.getQuestionSetAssignments(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                
                if (isAppend) {
                    this.questionSetAssignments = this.questionSetAssignments.concat(res.data.records);
                } else {                    
                    this.questionSetAssignments = res.data.records;
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

    resetQuestionSetIdMs() {
        this.questionSetIdMs.clear();
        this.questionSetIdMs.makeValid();
        this.nativeEle.querySelector("#questionSetId").style.display = 'block';
        this.nativeEle.querySelector("#questionSetIdSingle").style.display = 'none';
    }

    saveQuestionSetAssignments() {
        let frmData = this.questionAssignmentFrm.value, queryParams: any;
        
        this.submitted = true;
        if (this.questionAssignmentFrm.invalid) {
            this.questionSetIdMs.makeInvalid();
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;          
        }

		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.questionSetAssignmentService.saveQuestionSetAssignments(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getQuestionSetAssignments();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }
    
    addQuestionToSet() {
        let i, questionIdMsSelected = this.questionIdMs.getSelection();

        for(i = 0; i < questionIdMsSelected.length; i++) {
            this.questionIdInSet[questionIdMsSelected[i].id] = {
                "id": questionIdMsSelected[i].id,
                "name": questionIdMsSelected[i].name
            };                     
        } 
    }

    removeQuestionFromSet(questionId) {
        if (this.questionIdInSet.hasOwnProperty(questionId)) {
            delete this.questionIdInSet[questionId];
            document.getElementById("setName").click();
        }        
    }

    deleteQuestionFromSet(e) {
        e.stopPropagation();
        let selectedQuestion = this.nativeEle.querySelectorAll('.regular-checkbox:checked'), i;

        if (selectedQuestion.length === 0) {
            alert(this.locale.label.deleteConfirm);
            return false;
        }

        if (confirm(this.locale.label.deleteCommon)) {
            for (i = 0; i < selectedQuestion.length; i++) {
                console.log(selectedQuestion[i].value)
                if (this.questionIdInSet.hasOwnProperty(selectedQuestion[i].value)) {
                    delete this.questionIdInSet[selectedQuestion[i].value];
                    this.deleteQuestionFromMs();
                }                
            }
        }
    }

    deleteQuestionFromMs() {
        let key, questionIdMsData = [];

        for(key in this.questionIdInSet) {
            questionIdMsData.push(this.questionIdInSet[key]);
        }

        this.questionIdMs.setSelection(questionIdMsData);
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
                this.editQuestionSetAssignments(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteQuestionSetAssignments(trDataSet);
            }
        }
    }

    editQuestionSetAssignments(idx) {
        let formData:any = {}, userId, questionSetId;

        Object.assign(formData, this.questionSetAssignments[idx]);

        if (formData.hasOwnProperty("createdDate")) {
            delete formData.createdDate;
        }      
        this.nativeEle.querySelector("#questionSetId").style.display = 'none';
        this.nativeEle.querySelector("#questionSetIdSingle").style.display = 'block';        
        this.isEdit =true;  
        questionSetId = formData.question_set._id;
        delete formData.question_set;
        userId = formData.user._id;
        delete formData.user;
        this.questionAssignmentFrm.setValue({
            "_id": formData._id,
            "questionSetId": questionSetId,
            "userId": userId
        });
        this.questionSetIdMs.setValue([questionSetId]);
        this.commonService.scrool2Top();
        this.nativeEle.querySelector("#modalBtn").click();
    }

    deleteQuestionSetAssignments(id) {
        if (confirm(this.locale.label.deleteCommon)) {
            let queryParams = {
                "lang": this.lang
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.questionSetAssignmentService.deleteQuestionSetAssignments(id, queryParams).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getQuestionSetAssignments();
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
        this.questionAssignmentFrm.reset();
        this.resetQuestionSetIdMs();
    }

    get questionIdInSetLen() {
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
        this.getQuestionSetAssignments();
    }

    get f() { return this.questionAssignmentFrm.controls; }

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
        this.questionAssignmentSearchFrm.setValue({
            questionSetId: "",
            userId: ""
        });
        this.isFilterApplied = false;
        this.getQuestionSetAssignments();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getQuestionSetAssignments(
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
            this.getQuestionSetAssignments(
                false, false, 1, this.limit
            );
        }        
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}