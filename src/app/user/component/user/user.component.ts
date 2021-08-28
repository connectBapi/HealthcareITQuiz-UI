import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';
import { RoleService } from './../../../admin/services/role.service';

declare var $: any;

@Component({
    selector: "app-user",
    templateUrl: "./user.component.html"
})
export class UserComponent implements OnInit, OnDestroy {
    nativeEle
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    userFrm: FormGroup;
    submitted: Boolean = false;
    userSearchFrm: FormGroup;
    roles = [];
    roleId2Name = [];
    sort: any = {
        "roleName": 1 
    };
    isFilterApplied = false;
    noRecordFound = false;

    defaultPassword;
    users = [];    
    roleMs;
    defaultRoleMs;

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
        private userService: UserService,
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

    initiateLocale() {
        this.locale = this.commonService.getLocale()["admin"]["user"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.userFrm = this.fb.group({
            "_id": [""],
            "firstName": ["", [
                    Validators.required
                ]
            ],
            "lastName": ["", [
                    Validators.required
                ],
            ],
            "email": ["", [
                    Validators.required,
                    Validators.email
                ]
            ],            
            "roles": ["", [
                    Validators.required
                ]
            ],
            "defaultRole": ["", [
                    Validators.required
                ]
            ]
        });
    }

    initiateSearchFrm() {
        this.userSearchFrm = this.fb.group({
            "firstName": [""],
            "lastName": [""],
            "email": [""],
            "roles": [null],
            "mobile": [""]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls; 
        this.defaultPassword = this.commonService.getConfig()["defaultPassword"];
        this.commonService.toggleLoader(true);
        this.getRoles();
        this.getUsers();         
    }

    getRoles() {        
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.roleService.getRoles(queryParams).subscribe(
			res => {
                this.roles = res.data;
                this.formatSpecialityIdName();   
                this.createRoleDropDown();
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

        for(i = 0; i < this.roles.length; i++) {
            this.roleId2Name[this.roles[i]._id] = this.roles[i].roleName;
        }
    }

    createRoleDropDown() {
        let i, list = [], obj;

        for(i = 0; i< this.roles.length; i++) {
            obj = {
                id: this.roles[i]._id,
                name: this.roles[i].roleName
            };
            list.push(obj);
        }

        this.initiateMagicSuggest(list);
    }

    initiateMagicSuggest(list) {
        $(() => {
            this.roleMs = $('#roles').magicSuggest({
                placeholder: this.locale.label.roles.placeholder,
                allowFreeEntries: false,
                data: list,
                toggleOnClick: true,
            });
            this.defaultRoleMs = $('#defaultRole').magicSuggest({
                placeholder: this.locale.label.defaultRole.placeholder,
                allowFreeEntries: false,
                data: [],
                toggleOnClick: true,
                maxSelection: 1
            });
            $(this.roleMs).on('selectionchange', (e,m) => {
                this.defaultRoleMs.clear();
                if (JSON.stringify(this.roleMs.getValue()) === "[]") {
                    this.userFrm.get("roles").setValue(null);
                    this.defaultRoleMs.setData([]);                    
                    this.userFrm.get("defaultRole").setValue(null);
                    if (this.submitted) {
                        this.roleMs.makeInvalid();  
                        this.defaultRoleMs.makeInvalid();                      
                    } else {
                        this.defaultRoleMs.makeValid();
                    }                   
                } else {
                    this.roleMs.makeValid();
                    this.userFrm.get("roles").setValue(this.roleMs.getValue());
                    if (this.submitted) {
                        this.defaultRoleMs.makeInvalid();                      
                    } else {
                        this.defaultRoleMs.makeValid();
                    }                    
                    this.defaultRoleMs.setData(
                        this.roleMs.getSelection()
                    );
                    this.userFrm.get("defaultRole").setValue(
                        this.defaultRoleMs.getValue()
                    );
                }
            });
            $(this.defaultRoleMs).on('selectionchange', (e,m) => {
                if (JSON.stringify(this.defaultRoleMs.getValue()) === "[]") {
                    this.userFrm.get("defaultRole").setValue(null);
                    if (this.submitted) {
                        this.defaultRoleMs.makeInvalid();                        
                    }                    
                } else {
                    this.defaultRoleMs.makeValid();
                    this.userFrm.get("defaultRole").setValue(this.defaultRoleMs.getValue());
                }    
            });
        });
    }

    resetMagicSuggest() {
        this.roleMs.clear();
        this.roleMs.makeValid();   
        this.defaultRoleMs.clear();
        this.defaultRoleMs.makeValid();   
    }

    getUsers(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any;

        this.loaded = false;
		if (isSearch === true) {
            this.toggleSearchPanel();
            this.isFilterApplied = true;
            this.commonService.toggleLoader(true);
        }
        queryParams = this.userSearchFrm.value;
        if(queryParams.roles === null || queryParams.roles === "null") {
            queryParams.roles = '';
        }
        queryParams.lang = this.lang;
        queryParams.pageNo = pageNo;
        queryParams.limit = limit;
        queryParams.sort = this.commonService.getQueryString(this.sort);

		this.userService.getUsers(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.noRecordFound = res.data.records.length;
                
                if (isAppend) {
                    this.users = this.users.concat(res.data.records);
                } else {                    
                    this.users = res.data.records;
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
    
    saveUsers() {
        let frmData = this.userFrm.value, queryParams: any;

        this.submitted = true;
		if (this.userFrm.invalid) {
            if (JSON.stringify(this.roleMs.getValue()) === "[]") {
                this.roleMs.makeInvalid();
            }
            if (JSON.stringify(this.defaultRoleMs.getValue()) === "[]") {
                this.defaultRoleMs.makeInvalid();
            }
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;            
		}
		queryParams = {
            "lang": this.lang
        };
        frmData.password = this.defaultPassword;
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.saveUsers(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                $('#app-modal').modal('toggle');
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getUsers();
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
                this.editUsers(trDataSet);
            } else if (classList.contains("delete")) {
                this.deleteUsers(trDataSet);
            }
        }
    }

    editUsers(idx) {
        let formData = this.users[idx];

        formData = {
            "_id": formData._id,
            "firstName": formData.firstName,
            "lastName": formData.lastName,
            "email": formData.email,
            "roles": formData.roles,
            "defaultRole": formData.defaultRole
        }
        this.userFrm.setValue(formData);
        this.resetMagicSuggest();
        this.roleMs.setValue(formData.roles);
        this.defaultRoleMs.setValue([formData.defaultRole]);
        this.commonService.scrool2Top();
        this.nativeEle.querySelector("#modalBtn").click();
    }    

    deleteUsers(_id) {
        if (confirm("Are you sure to delete?")) {
            this.commonService.toggleLoader(true);
            let queryParams = {
                "lang": this.lang,
                "_id": _id
            };
            this.commonService.hideAllError(this.nativeEle);
            this.commonService.toggleLoader(true);
            this.userService.deleteUsers(queryParams).subscribe(
                res => {                    
                    this.commonService.toggleLoader(false);
                    this.commonService.scrool2Top();
                    this.resetFrm();                
                    this.alertSuccess(res.data);
                    this.getUsers();
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

    recover(_id) {
        let frmData = {
            "_id": _id,
            "password": this.defaultPassword
        }, queryParams: any;

		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.recover(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getUsers();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		)
    }

    activate(_id, isActive) {
        let frmData = { "_id": _id, isActive: !isActive }, queryParams: any;

		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.activate(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                this.resetFrm();                
                this.alertSuccess(res.data);
                this.getUsers();
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		)
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    resetFrm() {
        this.submitted = false;
        this.userFrm.reset();
        this.resetMagicSuggest();
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
        this.getUsers();
    }

    get f() { 
        return this.userFrm.controls; 
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
        this.userSearchFrm.setValue({
            firstName: "",
            lastName: "",
            email: "",
            roles: null,
            mobile: ""
        });
        this.isFilterApplied = false;
        this.getUsers();
    }

    loadMore() {
        let productList = this.nativeEle.querySelector(".content"), scrollRemain = ((productList.scrollHeight - productList.scrollTop) - productList.clientHeight);

        if (this.loaded === true && this.remainingCount >= 0  && scrollRemain >= 50) {
            this.getUsers(
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
            this.getUsers(
                false, false, 1, this.limit
            );
        }        
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}