import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonService } from './core/services/common.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	nativeEle;

	constructor(
		private ele: ElementRef,		
		private commonService: CommonService
	) {
		
	}

	ngOnInit() {
		this.commonService.toggleLoader(true);
		this.nativeEle = this.ele.nativeElement;
		this.commonService.loader.subscribe(
			isLoaderShown => {
				let ldr;
				if (this.nativeEle.querySelector('.loading-overlay')) {
					ldr = this.nativeEle.querySelector(
						'.loading-overlay'
					);
					ldr.classList.add("ds-9");
					if (isLoaderShown === true) {
						ldr.classList.remove("ds-9");
					}
				}
			}
		);
	}
}