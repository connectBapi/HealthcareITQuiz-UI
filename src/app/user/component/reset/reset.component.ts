import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-reset",
    templateUrl: "./reset.component.html"
})
export class ResetComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    localeLang;
    lang;
    footer;
    formCls;
    resetFrm: FormGroup;
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
        this.locale = this.commonService.getLocale()["reset"];
        this.localeLang = this.commonService.getLocale()["language"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.resetFrm = this.fb.group({
            "email": ["", [
                    Validators.required,
                    Validators.email
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

    reset() {
        let frmData = this.resetFrm.value, queryParams: any;        
        
        this.submitted = true;
		if (this.resetFrm.invalid) {
            this.commonService.scrollToElementUser();
            return false;  
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.reset(frmData, queryParams).subscribe(
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

    toggleLang() {
        let lang = this.nativeEle.querySelector(".language .drop-down");
    
        if (lang.classList.contains("show") === false) {
            lang.classList.add("show");
        } else {
            lang.classList.remove("show");
        }
    }

    resetForm() {
        this.submitted = false;
        this.resetFrm.reset();
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlertStay(msg, this.nativeEle, this.locale);
    }

    get f() { return this.resetFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}