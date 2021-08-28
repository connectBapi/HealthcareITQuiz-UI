import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-change-password",
    templateUrl: "./change-password.component.html"
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    changePasswordFrm: FormGroup;
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
        this.locale = this.commonService.getLocale()["admin"]["changePassword"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.changePasswordFrm = this.fb.group({
            "password": ["", [
                    Validators.required
                ]
            ],
            "newPassword": ["", [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(16),
                    Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
                ]
            ],
            "confirmPassword": ["", [
                    Validators.required
                ]
            ]
        },{
            validator: this.mustMatch('newPassword', 'confirmPassword')
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;        
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.currentUser = this.commonService.getCurrentUser();
        console.log(this.currentUser)
        this.commonService.toggleLoader(false);
    }

    mustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];
    
            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                return false;
            }

            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        }
    }

    changePassword() {
        let frmData = this.changePasswordFrm.value, queryParams: any;

        this.submitted = true;
		if (this.changePasswordFrm.invalid) {
            // this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;           
		}
		queryParams = {
            "lang": this.lang,
            "id": this.currentUser._id
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.userService.changePassword(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                this.resetFrm();                
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
        this.changePasswordFrm.reset();
    }

    get f() { return this.changePasswordFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}