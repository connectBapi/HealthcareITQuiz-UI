import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-signin",
    templateUrl: "./signin.component.html"
})
export class SigninComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    localeLang;
    lang;
    footer;
    formCls;
    signinFrm: FormGroup;
    submitted: Boolean = false;
    currentUser;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private router: Router,
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
        this.locale = this.commonService.getLocale()["signin"];
        this.localeLang = this.commonService.getLocale()["language"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.signinFrm = this.fb.group({
            "email": ["", [
                    Validators.required,
                    Validators.email
                ]
            ],
            "password": ["", [
                    Validators.required
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

    signin() {
        let frmData = this.signinFrm.value, queryParams: any;        
        
        this.submitted = true;
		if (this.signinFrm.invalid) {
            this.commonService.scrollToElementUser();
            return false;  
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.signin(frmData, queryParams).subscribe(
			user => {
                this.setUserToken(user.data);
				this.commonService.setCapabilities();
				this.commonService.toggleLoader(false);
                this.router.navigate(["/admin/dashboard"]);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale, false
                );
			}
		);
    }

	setUserToken(user) {
		this.commonService.clearLocalStorage();
		if (user) {
			this.commonService.setCookie(
				'oauthtoken', user.token, 
				{
					"expires": 29030400
				}
			);
			this.commonService.setCookie(
				'reftoken', user.token, 
				{
					"expires": 29030400
				}
			);
		}
	}

    toggleLang() {
        let lang = this.nativeEle.querySelector(".language .drop-down");
    
        if (lang.classList.contains("show") === false) {
            lang.classList.add("show");
        } else {
            lang.classList.remove("show");
        }
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    get f() { return this.signinFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}