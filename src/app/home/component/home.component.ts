import { Component, OnInit, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from './../../core/services/common.service';

@Component({
    selector: "app-home",
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    nativeEle;
    itemsMainDiv;
    itemsDiv;
    itemWidth;

    constructor(
        private ele: ElementRef, 
        private router: Router,
        private commonService: CommonService
    ) {}

    ngOnInit() {
        // this.nativeEle = this.ele.nativeElement;
        // this.commonService.setCurrentPath();
        // this.commonService.toggleSlider();
        // this.getAllCarsoulItem();        
    }

    getAllCarsoulItem() {
        let featureDiv = this.nativeEle.querySelectorAll(".feature-product"), i;

        for(i=0; i< featureDiv.length; i++) {
            this.initiateCarsoul(featureDiv[i], i+1);
        }
    }

    initiateCarsoul(caursoulEle = null, idx) {
        let i, j = 0;
        this.itemsMainDiv = caursoulEle.querySelector(".multi-carousel");;
        this.itemsDiv = caursoulEle.querySelectorAll(".multi-carousel-inner");;
        this.itemWidth = "";
        var incno = 0;
        var dataItems = ("data-items");
        var itemClass = ('.item');
        var btnParentSb = '';
        var itemsSplit: any = '';
        var sampwidth = this.itemsMainDiv.offsetWidth;
        var bodyWidth = this.nativeEle.parentElement.parentElement.parentElement.offsetWidth;
        for(i in this.itemsDiv) {
            if (i >= 0) {
                var itemNumbers = caursoulEle.querySelectorAll(itemClass).length;
                btnParentSb = this.itemsDiv[i].parentElement.getAttribute(dataItems);
                itemsSplit = btnParentSb.split(',');
                this.itemsDiv[i].parentElement.setAttribute("id", "multi-carousel" + idx);

                if (bodyWidth >= 1200) {
                    incno = itemsSplit[5];
                    this.itemWidth = sampwidth / incno;
                }
                else if (bodyWidth >= 992) {
                    incno = itemsSplit[4];
                    this.itemWidth = sampwidth / incno;
                }
                else if (bodyWidth >= 768) {
                    incno = itemsSplit[3];
                    this.itemWidth = sampwidth / incno;
                } else if (bodyWidth >= 481) {
                    incno = itemsSplit[2];
                    this.itemWidth = sampwidth / incno;
                }  else if (bodyWidth >= 320) {
                    incno = itemsSplit[1];
                    this.itemWidth = sampwidth / incno;
                } else {
                    incno = itemsSplit[0];
                    this.itemWidth = sampwidth / incno;
                }
                this.itemsDiv[i].style.cssText = "transform: translateX(0px); width:"+ (this.itemWidth * itemNumbers)+"px;";
                var  itemClssObj = this.itemsDiv[i].querySelectorAll(itemClass);
                for(j=0; j< itemClssObj.length; j++) {
                    // itemClssObj[j].outerWidth(this.itemWidth);
                    itemClssObj[j].style.width = this.itemWidth+"px";
                }

                caursoulEle.querySelector(".leftLst").classList.add("over");
                caursoulEle.querySelector(".rightLst").classList.remove("over");
                
            }            
        }
    }

    nextPrevCarsoul(evt) {
        let cond = evt.target.classList.contains("leftLst"),
            arrowEle = evt.target,
            parentEleId = arrowEle.parentElement.getAttribute("id"),
            slideDataAttr = this.nativeEle.querySelector("#"+parentEleId).dataset.slide,
            arrowNo = 1,
            caursoulEle = arrowEle.parentElement;
        if (cond) 
            arrowNo = 0;

        this.showNextPrevSlide(arrowNo, parentEleId, slideDataAttr, caursoulEle);
    }

    showNextPrevSlide(arrowNo, el, s=null, caursoulEle) {
        var leftBtn = ('.leftLst');
        var rightBtn = ('.rightLst');
        var translateXval: any = "";
        var multiCarsoulEle = caursoulEle.querySelector(".multi-carousel-inner");
        var divStyle = this.getStyle(multiCarsoulEle, "transform");        
        var values: any = divStyle.match(/-?[\d\.]+/g);
        var xds: any = Math.abs(values[4]);
        var itemWidthVal: any = this.itemWidth * s;
        if (arrowNo == 0) {
            translateXval = parseInt(xds) - parseInt(itemWidthVal);

            this.nativeEle.querySelector("#"+el+" "+rightBtn).classList.remove("over");

            // $(el + ' ' + rightBtn).removeClass("over");

            if (translateXval <= this.itemWidth / 2) {
                translateXval = 0;
                this.nativeEle.querySelector("#"+el+" "+leftBtn).classList.add("over");
                // $(el + ' ' + leftBtn).addClass("over");
            }
        } else if (arrowNo == 1) {
            
            // var itemsCondition = $(el).find(this.itemsDiv).width() - $(el).width();
            var itemsCondition = this.nativeEle.querySelector("#"+el+" .multi-carousel-inner").offsetWidth - this.nativeEle.querySelector("#"+el).offsetWidth;

            translateXval = parseInt(xds) + parseInt(itemWidthVal);

            // $(el + ' ' + leftBtn).removeClass("over");
            this.nativeEle.querySelector("#"+el+" "+leftBtn).classList.remove("over");
            if (translateXval >= itemsCondition - this.itemWidth / 2) {
                translateXval = itemsCondition;
                // $(el + ' ' + rightBtn).addClass("over");
                this.nativeEle.querySelector("#"+el+" "+rightBtn).classList.add("over");
            }
        }
        // $(el + ' ' + this.itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
        this.nativeEle.querySelector("#"+el+" .multi-carousel-inner").style.transform = "translateX(-"+translateXval+"px)";
    }

    getStyle(oElm, strCssRule){
        let strValue = "";

        if(document.defaultView && document.defaultView.getComputedStyle){
            strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        } else if(oElm.currentStyle){
            strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }

    navigateToProductList() {
        this.router.navigateByUrl("/product/list");
    }
}