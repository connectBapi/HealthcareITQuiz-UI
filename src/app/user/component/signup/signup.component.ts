import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html"
})
export class SignupComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    localeLang;
    lang;
    footer;
    formCls;
    signupFrm: FormGroup;
    submitted: Boolean = false;
    currentUser;

    constructor(
        private fb: FormBuilder,
        private ele: ElementRef,
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
        this.locale = this.commonService.getLocale()["signup"];
        this.localeLang = this.commonService.getLocale()["language"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    } 
    
    initiateForm() {
        this.signupFrm = this.fb.group({
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
            "password": ["", [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
                ]
            ]
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.currentUser = this.commonService.getCurrentUser();
        this.commonService.toggleLoader(false);
    }

    toggleLang() {
        let lang = this.nativeEle.querySelector(".language .drop-down");
    
        if (lang.classList.contains("show") === false) {
            lang.classList.add("show");
        } else {
            lang.classList.remove("show");
        }
    }

    signup() {
        let frmData = this.signupFrm.value, queryParams: any;        
        
        this.submitted = true;
		if (this.signupFrm.invalid) {
            this.commonService.scrollToElementUser();
			return false;
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.signup(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);                
                this.commonService.scrollToElementUser();
                this.resetForm();
                this.alertSuccess(res.data);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale, false
                );
			}
		)
    }

    resetForm() {
        this.submitted = false;
        this.signupFrm.reset();
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlertStay(msg, this.nativeEle, this.locale);
    }

    get f() { return this.signupFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}