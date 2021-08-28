import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from './../../../../core/services/common.service';
import { Router } from "@angular/router";

@Component({
    selector: "app-two-column",
    templateUrl: "./two-column.component.html"
})
export class TwoColumnComponent implements OnInit, OnDestroy {
    nativeEle;
    locale;
    lang;
    footer;
    capability;
    currentUser;

	constructor(
        private ele: ElementRef,
        private commonService: CommonService,
        private router: Router
    ) {
		
    }

    ngOnInit() {
        this.nativeEle = this.ele.nativeElement;
        this.commonService.localeObserver.subscribe(
			isLangChanged => {
				if (isLangChanged) {
                    this.setComponentLocale();
				}
			}
        );
        this.commonService.scroll2Top.subscribe(
			flag => {
                if (flag) {
                    this.commonService.scrollToElement("server-scroll-top", this.nativeEle);
				}
			}
		);
        this.setComponentLocale();
        this.capability = this.commonService.getCapabilities();
        this.currentUser = this.commonService.getCurrentUser();
        setTimeout(() => { this.expandSubMenu()}, 0);
    }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
        // this.commonService.scroll2Top.unsubscribe();
    }
    
    setComponentLocale() {
        this.locale = this.commonService.getLocale();
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    navigatePageByLocale(lang) {
        let url = "/admin/"+this.commonService.getCurrentPath();
        
        this.router.navigate([url], { 
            queryParams: {lang: lang},
            queryParamsHandling: 'merge',
            preserveFragment: true 
        });
    }

	toggleNavMenu() {
		let bodyEle = this.nativeEle.parentElement.parentElement;

        if (bodyEle.offsetWidth <= 992) {
            if (bodyEle.classList.contains("trans-toggle-100") === true) {
                bodyEle.classList.remove("trans-toggle-100");
            }
            if (bodyEle.classList.contains("trans-toggle-0") === true) {
                bodyEle.classList.remove("trans-toggle-0");
            } else {
                bodyEle.classList.add("trans-toggle-0");
            }        
        }  else {
            if (bodyEle.classList.contains("trans-toggle-0") === true) {
                bodyEle.classList.remove("trans-toggle-0");
            }
            if (bodyEle.classList.contains("trans-toggle-100") === true) {
                bodyEle.classList.remove("trans-toggle-100");
            } else {
                bodyEle.classList.add("trans-toggle-100");
            }
        }
    }
    
    toggleNavMenuWin() {
        let bodyEle = this.nativeEle.parentElement.parentElement;
    
        if (bodyEle.offsetWidth > 992) {
            if (bodyEle.classList.contains("trans-toggle-0") === true) {
                bodyEle.classList.remove("trans-toggle-0");
            }        
        } 
    }

	toggleLeftNavMenu(e) {
        let targetEle = e.target, navMenuI, navSubMenu;

        if (targetEle.classList.contains("nav-menu-i-right") === true || targetEle.parentElement.querySelector(".nav-sub-menu")) {
            if (targetEle.classList.contains("nav-menu-i-right") === true) {
                navMenuI = targetEle,
                navSubMenu = targetEle.parentElement.parentElement.querySelector(".nav-sub-menu");
            } else {
                navMenuI = targetEle.querySelector(".nav-menu-i-right"),
                navSubMenu = targetEle.parentElement.querySelector(".nav-sub-menu");
            }
    
            navSubMenu.classList.toggle("ds-9");
            if (navSubMenu.classList.contains("ds-9") === true) {
                navMenuI.classList.remove("fa-angle-up");
                navMenuI.classList.add("fa-angle-down");
            } else {
                navMenuI.classList.remove("fa-angle-down");
                navMenuI.classList.add("fa-angle-up");
            }
        }  
    }

    expandSubMenu() {
        let currentUrl = this.router.url, adminMenu = ["/admin/role", "/admin/role-task", "/admin/task", "/admin/user"], masterMenu = ["/admin/speciality", "/admin/category", "/admin/question"], builderMenu = ["/admin/question-set"], assignerMenu = ["/admin/question-assignment"], professionalMenu = ["/admin/take-exam", "/admin/exam-details", "/admin/exam-review"];
    
        if (adminMenu.indexOf(currentUrl) !== -1 && this.nativeEle.querySelector(".nav-sub-menu.admin")) {
            this.nativeEle.querySelector(".nav-sub-menu.admin").classList.toggle("ds-9");
        } else if (masterMenu.indexOf(currentUrl) !== -1 && this.nativeEle.querySelector(".nav-sub-menu.master")) {
            this.nativeEle.querySelector(".nav-sub-menu.master").classList.toggle("ds-9");
        } else if (builderMenu.indexOf(currentUrl) !== -1 && this.nativeEle.querySelector(".nav-sub-menu.builder")) {
            this.nativeEle.querySelector(".nav-sub-menu.builder").classList.toggle("ds-9");
        } else if (assignerMenu.indexOf(currentUrl) !== -1 && this.nativeEle.querySelector(".nav-sub-menu.assigner")) {
            this.nativeEle.querySelector(".nav-sub-menu.assigner").classList.toggle("ds-9");
        } else if (professionalMenu.indexOf(currentUrl) !== -1 && this.nativeEle.querySelector(".nav-sub-menu.professional")) {
            this.nativeEle.querySelector(".nav-sub-menu.professional").classList.toggle("ds-9");
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

    toggleNotification() {
        let lang = this.nativeEle.querySelector(".notification .drop-down");
    
        if (lang.classList.contains("show") === false) {
            lang.classList.add("show");
        } else {
            lang.classList.remove("show");
        }
    }

    toggleMyAccount() {
        let myAccount = this.nativeEle.querySelector(".drop-down.my-account");
    
        if (myAccount.classList.contains("show") === false) {
            myAccount.classList.add("show");
        } else {
            myAccount.classList.remove("show");
        }
    }

    logout() {
        this.commonService.logOut();
        this.router.navigate(["/signin"]);
    }
}