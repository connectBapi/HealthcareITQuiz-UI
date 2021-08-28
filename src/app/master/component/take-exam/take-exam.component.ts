import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';
import { QuestionSetAssignmentService } from './../../services/question-set-assignment.service';

@Component({
    selector: "app-take-exam",
    templateUrl: "./take-exam.component.html"
})
export class TakeExamComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls; 
    questionSetAssignments = [];
    takeExamSearchFrm: FormGroup;

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
    capability;
    isAdmin = false;    

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
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
        this.initiateLocale();
        this.initiateSearchFrm();
        this.initiateComponent();
    }   

    initiateLocale() {
        this.locale = this.commonService.getLocale()["master"]["takeExam"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.capability = this.commonService.getCapabilities();
        if (this.capability && this.capability.cmr && this.capability.cmr.isRead) {
            this.isAdmin = true;
        }
        this.commonService.toggleLoader(true);
        this.getQuestionSetAssignments();
    }

    initiateSearchFrm() {
        this.takeExamSearchFrm = this.fb.group({
            "setName": [""]
        });
    }

    getQuestionSetAssignments(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.takeExamSearchFrm.value;
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
        this.takeExamSearchFrm.setValue({
            setName: ""
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