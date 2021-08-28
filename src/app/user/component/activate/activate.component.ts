import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonService } from './../../../core/services/common.service';
import { UserService } from './../../services/user.services';

@Component({
    selector: "app-activate",
    templateUrl: "./activate.component.html"
})
export class ActivateComponent implements OnInit, OnDestroy {
    
    nativeEle;
    locale;
    localeLang;
    lang;
    footer;
    formCls;
    currentUser;
    activationKey;
    isActivated = false;
    isInvalidLink = false;

    constructor(
        private ele: ElementRef,
        private route: ActivatedRoute,        
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
            if (params.hasOwnProperty("activation-key")) {
                this.activationKey = params["activation-key"];                
            }
        });
        this.initiateLocale();
        this.initiateComponent(); 

        
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["activate"];
        this.localeLang = this.commonService.getLocale()["language"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
        
    }

    initiateComponent() {        
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls;
        this.currentUser = this.commonService.getCurrentUser();
        this.commonService.toggleLoader(true);
        this.activate();
    }

    activate() {
        let frmData = { "activationKey": this.activationKey }, queryParams: any;

		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.userService.activate(frmData, queryParams).subscribe(
			res => {
                this.isInvalidLink = false;
                this.isActivated = true;
                this.commonService.toggleLoader(false);
			},
			err => {
                this.isActivated = false;
                this.isInvalidLink = true;
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

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    }
}