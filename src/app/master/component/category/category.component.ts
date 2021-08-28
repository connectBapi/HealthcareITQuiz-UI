import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { SpecialityService } from './../../services/speciality.service';
import { CategoryService } from './../../services/category.service';

declare var $: any;

@Component({
    selector: "app-category",
    templateUrl: "./category.component.html"
})
export class CategoryComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    categoryFrm: FormGroup;    
    submitted: Boolean = false;
    categorySearchFrm: FormGroup;
    specialities = [];
    categories = [];
    sort: any = {
        "categoryName": 1 
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

    specialityId2Name = {};

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService,
        private specialityService: SpecialityService,
        private categoryService: CategoryService
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
        this.locale = this.commonService.getLocale()["master"]["category"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.categoryFrm = this.fb.group({
            "_id": [""],
            "specialityId": [null, [
                    Validators.required
                ]
            ],
            "categoryName": ["", [
                    Validators.required
                ]
            ]
        });
    }

    initiateSearchFrm() {
        this.categorySearchFrm = this.fb.group({
            "specialityId": [null],
            "categoryName": [""]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.getSpecialities();
        this.getCategories();
    }

    getSpecialities() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "sort": this.sort,
            "type": "dropdown"
        };   
        queryParams.sort = this.commonService.getQueryString(this.sort);
		this.specialityService.getSpecialities(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.specialities = res.data;
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

        for(i = 0; i < this.specialities.length; i++) {
            this.specialityId2Name[this.specialities[i]._id] = this.specialities[i].specialityName;
        }
    }

    getCategories(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.categorySearchFrm.value;
        if(queryParams.specialityId === null) {
            queryParams.specialityId = '';
        }
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        queryParams.sort = this.commonService.getQueryString(this.sort);      		
		this.categoryService.getCategories(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                
                if (isAppend) {
                    this.categories = this.categories.concat(res.data.records);
                } else {                    
                    this.categories = res.data.records;
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

    saveCategories() {
        let frmData = this.categoryFrm.value, queryParams: any;

        this.submitted = true;
		if (this.categoryFrm.invalid) {
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;           
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.categoryService.saveCategories(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getCategories();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    handleClickEvent(target) {
        let classList, trDataSet;

        if (target.className) {
            classList = target.classList;
            trDataSet = target.parentElement.parentElement.dataset;
            if (classList.contains("edit")) {
                this.editCategories(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteCategories(trDataSet);
            }
        }
    }

    editCategories(idx) {
        let formData:any = {}, specialityId;
        
        Object.assign(formData, this.categories[idx]);
        if (formData.hasOwnProperty("createdDate")) {
            delete formData.createdDate;
        }
        specialityId = formData.speciality._id;
        delete formData.speciality;
        formData.specialityId = specialityId;
        this.categoryFrm.setValue(formData);
        this.commonService.scrool2Top();
        this.nativeEle.querySelector("#modalBtn").click();
    }    

    deleteCategories(id) {
        if (confirm("Are you sure to delete?")) {
            this.commonService.toggleLoader(true);
            let queryParams = {
                "lang": this.lang
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.categoryService.deleteCategories(id, queryParams).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getCategories();
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
        this.categoryFrm.reset();
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
        this.getCategories();
    }

    get f() { return this.categoryFrm.controls; }

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
        this.categorySearchFrm.setValue({
            specialityId: null,
            categoryName: ""
        });
        this.isFilterApplied = false;
        this.getCategories();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getCategories(
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
            this.getCategories(
                false, false, 1, this.limit
            );
        }        
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}