import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-recover",
    templateUrl: "./recover.component.html"
})
export class RecoverComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    localeLang;
    lang;
    footer;
    formCls;
    recoverFrm: FormGroup;
    submitted: Boolean = false;
    resetKey;
    currentUser;

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private route:ActivatedRoute,
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
        this.route.queryParams.subscribe(params => {
            if (params.hasOwnProperty("reset-key")) {
                this.resetKey = params["reset-key"];
            }
        });
        this.initiateLocale();
        this.initiateForm();
        this.initiateComponent();
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["recover"];
        this.localeLang = this.commonService.getLocale()["language"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.recoverFrm = this.fb.group({
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

    recover() {
        let frmData = this.recoverFrm.value, queryParams: any;        
        
        this.submitted = true;
		if (this.recoverFrm.invalid) {
            this.commonService.scrollToElementUser();
            return false; 
		}
		queryParams = {
            "lang": this.lang
        };
        frmData.resetKey = this.resetKey;
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.recover(frmData, queryParams).subscribe(
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
        this.recoverFrm.reset();
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlertStay(msg, this.nativeEle, this.locale);
    }

    get f() { return this.recoverFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}