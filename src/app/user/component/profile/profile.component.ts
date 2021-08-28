import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html"
})
export class ProfileComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;    
    profileFrm: FormGroup;
    submitted: Boolean = false;
    currentUser;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService, 
        private userService: UserService
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
        this.initiateComponent();
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["admin"]["profile"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.profileFrm = this.fb.group({
            "firstName": ["", [
                    Validators.required
                ]
            ],
            "lastName": ["", [
                    Validators.required
                ]
            ],
            "email": ["", [
                    Validators.required,
                    Validators.email
                ]
            ],
            "mobile": ["", [
                    Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)
                ]
            ]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.currentUser = this.commonService.getCurrentUser(); 
        this.getUserDetails();
        console.log(this.currentUser)
    }  
    
    getUserDetails(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any = {}; 

        queryParams.id = this.currentUser._id;
		this.userService.getUserDetails(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.currentUser = res.data;   
                this.setFormData();             
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    setFormData() {
        let mobile = '';

        if(this.currentUser.mobile) {
            mobile = this.currentUser.mobile;
        }
        this.profileFrm.setValue({
            "firstName": this.currentUser.firstName,
            "lastName": this.currentUser.lastName,
            "email": this.currentUser.email,
            "mobile": mobile
        });
    }

    saveProfile() {
        let frmData = this.profileFrm.value, queryParams: any;

        this.submitted = true;
		if (this.profileFrm.invalid) {
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;            
		}
		queryParams = {
            "lang": this.lang,
            "id": this.currentUser._id
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.saveProfile(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                // this.resetFrm();                
                this.alertSuccess(res.data);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    resetFrm() {
        this.submitted = false;
        this.profileFrm.reset();
    }

    get f() { return this.profileFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}