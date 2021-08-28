import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { RoleService } from './../../services/role.service';

declare var $: any;

@Component({
    selector: "app-role",
    templateUrl: "./role.component.html"
})
export class RoleComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    roleFrm: FormGroup;    
    submitted: Boolean = false;
    roleSearchFrm: FormGroup;
    roles = [];
    sort: any = {
        "roleName": 1 
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
        private roleService: RoleService
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

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }   

    initiateLocale() {
        this.locale = this.commonService.getLocale()["admin"]["role"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.roleFrm = this.fb.group({
            "_id": [""],
            "roleName": ["", [
                    Validators.required
                ]
            ],
            "code": [""]
        });
    }

    initiateSearchFrm() {
        this.roleSearchFrm = this.fb.group({
            "roleName": [""],
            "code": [""]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.getRoles();
    }

    getRoles(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;        
        
        this.loaded = false;
        if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.roleSearchFrm.value;
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        queryParams.sort = this.commonService.getQueryString(this.sort);

		this.roleService.getRoles(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                if (isAppend) {
                    this.roles = this.roles.concat(res.data.records);
                } else {                    
                    this.roles = res.data.records;
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

    saveRole() {
        let frmData = this.roleFrm.value, queryParams: any;

        this.submitted = true;
		if (this.roleFrm.invalid) {
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;           
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.roleService.saveRoles(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getRoles();
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
                this.editRoles(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteRoles(trDataSet);
            }
        }
    }

    editRoles(idx) {
        let formData:any = {};
        
        Object.assign(formData, this.roles[idx]);
        
        if (formData.hasOwnProperty("createdDate")) {
            delete formData.createdDate;
        }
        this.roleFrm.setValue(formData);
        this.commonService.scrool2Top();
        this.nativeEle.querySelector("#modalBtn").click();
    }    

    deleteRoles(id) {
        if (confirm("Are you sure to delete?")) {
            this.commonService.toggleLoader(true);
            let queryParams = {
                "lang": this.lang
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.roleService.deleteRoles(id, queryParams).subscribe(
                res => {
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getRoles();
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
        this.roleFrm.reset();
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
        this.getRoles();
    }

    get f() { return this.roleFrm.controls; }

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
        this.roleSearchFrm.setValue({
            roleName: "",
            code: ""
        });
        this.isFilterApplied = false;
        this.getRoles();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getRoles(
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
            this.start = this.pageNo;
            this.end = this.limit;
            if(this.totalCount <= this.limit) {
                this.end = this.totalCount;
            }
            if (this.totalCount === 0) {
                this.start = 0;
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
            this.getRoles(
                false, false, 1, this.limit
            );
        }        
    }
}