import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from './../../../core/services/common.service';
import { DashboardService } from './../../services/dashboard.service';
// import Chart from 'chart.js/auto';

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html"
})
export class DashboardComponent implements OnInit, OnDestroy {
    categoryFrm: FormGroup;
    locale;
    breadCumb;
    lang: String;
    footer;
    nativeEle;
    categories;
    formCls;
    data = [];
    capability;
    isAdmin = false;

    constructor(
        private formBuilder: FormBuilder,
        private ele: ElementRef,
        private commonService: CommonService,
        private dashboardService: DashboardService
    ) {}

    ngOnInit() {
        this.categoryFrm = this.formBuilder.group({
            id: [""],
            categoryName: ["", Validators.required]
        });
        this.locale = this.commonService.getLocale()["admin"]["dashboard"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
        this.nativeEle = this.ele.nativeElement;
        
        this.commonService.toggleSlider();
        this.capability = this.commonService.getCapabilities();
        if (this.capability && this.capability.cmr && this.capability.cmr.isRead) {
            this.isAdmin = true;            
        }
        this.getDashboard();
    }

    initiateChart() {
        // let ctx = this.nativeEle.querySelector('#myChart');

        // new Chart(ctx, {
        //     type: 'line',
        //     data: {
        //         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        //         datasets: [{
        //           label: 'My First Dataset',
        //           data: [65, 59, 80, 81, 56, 55],
        //           fill: false,
        //           borderColor: 'rgb(75, 192, 192)',
        //           tension: 0.1
        //         }]
        //       },
        // });
    }

    getDashboard(isSearch = false, isAppend = false, pageNo = 1, limit = 10) {
        let queryParams: any = {};        
        
            this.commonService.toggleLoader(true);

		this.dashboardService.getDashBoard(queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false); 
                this.data = res.data;            
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    ngOnDestroy() {
        
    }
}