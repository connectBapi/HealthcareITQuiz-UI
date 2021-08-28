import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// import { CookieService } from 'ngx-cookie-service';
import { Location } from "@angular/common";
import { AppConfigService } from './app-config.service';
import { LocaleConfigService } from './locale-config.service';

@Injectable({ 
	providedIn: 'root' 
})
export class CommonService {
    private config;
    private locale = null;    
    private currentPath;    
    private lang;
    private capability = {};
    private currentuser = null;
    private isLocaleActivated: Boolean = false;
    
    public loader = new BehaviorSubject<any>(false);
    public slider = new BehaviorSubject<any>(false);
    public userMenu = new BehaviorSubject<any>({});
    public categories = new BehaviorSubject<any>([]);
    public localeObserver = new BehaviorSubject<any>(false);
    public scroll2Top = new BehaviorSubject<any>(false);   
    
	
	constructor(
		public jwtHelper: JwtHelperService,
		private route: ActivatedRoute,
        private router: Router,
		private http: HttpClient,
		// private cookieService: CookieService,
		private location: Location
	) {
        this.initiateApp();
    }

    initiateApp() {
        let lang;

        this.route.queryParams.subscribe(params => { 
            if (this.locale !== null) { 
                lang = this.getRequestedLanguage(params);
                this.setLanguage(lang);
                this.setLocaleConfig(lang);
            }            
		});
        this.setConfig();
        this.setLocale();
        this.setCurrentPath();
        this.setLanguage();
        this.setIsLocaleActivated(true);   
        this.setCapabilities();     
    }

    setIsLocaleActivated(isLocaleActivated) {
        this.isLocaleActivated = isLocaleActivated;
    }

    getRequestedLanguage(queryParams = null) {
        let availableLang = ["en", "ar"], lang = this.config.defaultLang;

        if (queryParams.lang) {
            if (queryParams.lang && availableLang.indexOf(queryParams.lang) !== -1) {
                lang = queryParams.lang;
            }
        }

        return lang;
    }
 
    setLocaleConfig(lang) {
        let localeFile = "locale-"+lang+".json";

        const jsonFile = './../../assets/config/'+localeFile;
        this.http.get(jsonFile).subscribe(
            res => {
                this.setLocale(res);
                this.setLocaleObserver(true);
            }, error => {
                alert("Invalid language requested.");
            }
        )
    }

    setLocaleObserver(isLangChanged = false) {
        this.localeObserver.next(isLangChanged);
    }

    setConfig() {
        this.config = AppConfigService.settings
    }

    getConfig() {
        return this.config;
    }

    setLocale(locale = null) {
        this.locale = LocaleConfigService.settings;

        if (locale) {
            this.locale = locale;
        }
    }

    getLocale() {
        return this.locale;
    }

    getRoute() {
        return this.config.routes;
    }   
    
    setCurrentPath() {		
		let path = this.location.path(), pathSplit = null;

		if (path) {
			pathSplit = path.split("?")[0].split("/");
			pathSplit = pathSplit[pathSplit.length-1];
		}		
        
        this.currentPath = (pathSplit) ? pathSplit : "home";
    }

    getCurrentPath() {
        return this.currentPath;
    }
    
    setLanguage(lang = null) {        
        this.lang = this.route.snapshot.queryParams['lang'] ? this.route.snapshot.queryParams['lang'] : this.config.defaultLang;
        
        if (lang) {
            this.lang = lang;
        }
    }
    
    getLanguage() {
		return this.lang;
    }

    setCapabilities() {
        let permissionRes = {}, perVal, assignedPerKey, capabilities,
            decodedToken = this.getDecodeToken(),
            permission = {
                "read": 8,
                "write": 4,
                "update": 2,
                "delete": 1,
                "isRead": false,
                "isWrite":  false,
                "isUpdate": false,
                "isDelete": false
            };

        if (decodedToken) {
            this.setCurrentUser(decodedToken);
            capabilities = decodedToken.roleTasks;
            for(assignedPerKey in capabilities) {
                perVal = capabilities[assignedPerKey];
                permissionRes[assignedPerKey] = {
                    "isRead": ((perVal & permission["read"]) != 0),
                    "isWrite": ((perVal & permission["write"]) != 0),
                    "isUpdate": ((perVal & permission["update"]) != 0),
                    "isDelete": ((perVal & permission["delete"]) != 0)
                };
            }
        }
        
        this.capability = permissionRes;
    }

	getCapabilities() {
		return this.capability;
    }

    getToken() {
		return this.getCookie('oauthtoken');
	}

	getDecodeToken() {
		return this.jwtHelper.decodeToken(
			this.getToken()
		);
	}

	isTokenExpired() {
		return this.jwtHelper.isTokenExpired(
			this.getToken()
		);
    }
    
    setCurrentUser(currentuser) {
        this.currentuser = currentuser;
    }

    getCurrentUser() {
        return this.currentuser;
    }

    setLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    getLocalStorage(key) {
        return localStorage.getItem(key);
    }

    clearLocalStorage() {
        localStorage.clear();
    }
    
    toggleLoader(flag = false) {
        this.loader.next(flag);
    }

	toggleSlider() {
		let isEnableSlider = true, pageName = this.getCurrentPath();

		if (pageName !== "home") {
			isEnableSlider = false;
		}

		this.slider.next(isEnableSlider);
    }
    
    toggleScroll2Top(flag = false) {
        this.scroll2Top.next(flag);
    }
	
	showHideUserMenu(menuParams) {
		this.userMenu.next(menuParams);
    }

    updateCategories(categoryList) {
		this.categories.next(categoryList);
    }
    
    setCookie(name, value, options:any = {}) {
        options = {
            path: '/',
            // add other defaults here if necessary
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
	}

    getCookie(cname) {
		let name = cname + "=", i,
            ca = document.cookie.split(';'), c;

        for(i = 0; i < ca.length; i++) {
            c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return "";
	}

	deleteCookie(name) {
		this.setCookie(name, "", {
            'max-age': -1
        })
    }
    
    deleteAllCookie() {
		// this.cookieService.deleteAll();
    }

	logOut() {
        this.clearUserInfo();
    }

    clearUserInfo() {        
        this.deleteCookie("oauthtoken");
        this.deleteCookie("reftoken");
        this.setCurrentPath();
        this.setCapabilities();
        this.setCurrentUser(null);
        this.toggleLoader(false);
        this.toggleSlider();
	}

    showServerValidationError(error, formCls, pageEle, locale, isScroll = true, errCls = 'alert-danger') {
		let idx, fieldId, memssage, serverErrror;

		this.hideAllError(pageEle);
		if (error.error.type === "fieldLevel") {			
			for(idx in  error.error.data) {
				fieldId = error.error.data[idx].name;
                memssage = error.error.data[idx].message;
                
                serverErrror = pageEle.querySelector("."+formCls+" ."+fieldId).parentElement.querySelector(".server-error");

                if (serverErrror) {
                    if (locale.error[fieldId]) {
                        serverErrror.innerHTML = locale.error[fieldId][memssage];
                        serverErrror.style.display = "block";
                        if (parseInt(idx) === (error.error.data.length -1)) {
                            if (isScroll === true) {
                                this.scrollToElement(error.error.data[0].name, pageEle);
                            } else {
                                this.scrollToElementUser();
                            }
                        }                                     
                    } else {
                        console.debug("locale key '"+fieldId+"' missing in locale.error[fieldId]");
                    }                    
                }  else {
                    console.debug("."+formCls+" ."+fieldId+" .server-error element not found in template.");
                }				
            }            
		} else if (error.error.type === "common") {	
            this.showDangerAlert(
                error.error.data[0].message, pageEle, locale, isScroll, errCls
            );
        }
    }   
    
    hideAllError(pageEle) {
		this.hideValidationError(
            pageEle.querySelectorAll("div.error")
        );
        this.hideSuccessAlert(pageEle);
        this.hideSuccessStayAlert(pageEle);
    }

    hideValidationError(errorEle) {
		let i;
        
        if (errorEle) {
            for(i = 0; i < errorEle.length; i++) {
                if (errorEle[i]) {
                    errorEle[i].style.display = "none";
                }			
            }
        } else {
            console.debug(".error element not found in template.")
        }		
    }

    showDangerAlert(key, pageEle, locale, isScroll = true, errCls) {
        let alertDan = pageEle.querySelector("."+errCls);
        
        if (alertDan) {
            if (locale.error.api[key]) {
                if (isScroll === true) {
                    this.scrool2Top();
                } else {
                    this.scrollToElementUser();
                }                
                alertDan.innerHTML = locale.error.api[key];
                if (errCls === "alert-danger") {
                    if (alertDan.classList.contains("show") === false) {
                        alertDan.classList.add("show");
                    }
                } else {
                    alertDan.style.display = 'block';
                }
            } else {
                console.debug("config key "+'"'+key+'"'+" not found in locale.error.api[key].")
            }            
        } else {
            console.debug(".alert-danger element not found in template.")
        }       
    }

    scrollToElement(errors, nativeEle) {
        let field, elementPosFromTop,
            contentPosFromTop: any = this.findPos(document.querySelector(".content"));

        if (typeof(errors) === 'string') {
            if (nativeEle.querySelector("."+errors)) {
                elementPosFromTop = this.findPos(nativeEle.querySelector("."+errors));
                if (elementPosFromTop) {
                    document.querySelector('.content').scrollTop = ((parseInt(elementPosFromTop[0])) - parseInt(contentPosFromTop[0]+20));
                }
            }            
        } else {
            for(field in errors) {
                if (errors[field].errors) {
                    if (nativeEle.querySelector("."+field)) { 
                        elementPosFromTop = this.findPos(nativeEle.querySelector("."+field));
                        if (elementPosFromTop) {
                            document.querySelector('.modal').scrollTop = ((parseInt(elementPosFromTop[0])) - (parseInt(contentPosFromTop[0])-10));
                            break;
                        }                        
                    }                
                }
            }
        }        
    }

    scrollToElementUser() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    scrool2Top() {
        document.querySelector('.content').scrollTop = 0;
    }

    findPos(obj) {
        let curtop = 0;
    
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            
            return [curtop];
        }
    }

    showAllError(pageEle) {
        this.showValidationError(
            pageEle.querySelectorAll(".error")
        );
    }

    showValidationError(errorEle) {
		let i;
        
        if (errorEle) {
            for(i = 0; i < errorEle.length; i++) {
                if (errorEle[i]) {
                    errorEle[i].style.display = "block";
                }			
            }
        } else {
            console.debug(".error element not found in template.")
        }		
	}

    showSuccessAlert(key, pageEle, locale) {
        let alertSuc = pageEle.querySelector(".content-middle .middle-header .alert-success");

        if (alertSuc) {
            alertSuc.innerHTML = locale.success.api[key];
            if (alertSuc.classList.contains("show") === true) {
                alertSuc.classList.remove("show");
            }
            alertSuc.classList.add("show");
        } else {
            console.debug(".alert-success element not found in template.")
        }        
    } 
    
    showSuccessAlertStay(key, pageEle, locale) {
        let alertSuc = pageEle.querySelector(".alert-success");

        if (alertSuc) {
            alertSuc.innerHTML = locale.success.api[key];
            if (alertSuc.classList.contains("show") === false) {
                alertSuc.classList.add("show");
            }
        } else {
            console.debug(".alert-success element not found in template.")
        }        
    } 

    hideSuccessAlert(pageEle) {
        let alertSuc = pageEle.querySelector(".alert-success");

        if (alertSuc) {
            if (alertSuc.classList.contains("show") === true) {
                alertSuc.classList.remove("show");
            }
        }
    }

    hideSuccessStayAlert(pageEle) {
        let alertSuc = pageEle.querySelector(".alert-success-stay");

        if (alertSuc) {
            if (alertSuc.classList.contains("show") === true) {
                alertSuc.classList.remove("show");
            }
        }
    }
    
    markFormGroupTouched(formGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsTouched();
    
            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }
    
    markFormGroupUnTouched(formGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            control.markAsUntouched();
    
            if (control.controls) {
                this.markFormGroupUnTouched(control);
            }
        });
    }

    clearFormArray(formArray) {
        while (formArray.length !== 0) {
            formArray.removeAt(0)
        }
    }

    modifyFormDataProp(trDataSet) {
        let prop, propPart, i, tmpProp, finalParam = {}, tmpNm;

        if (trDataSet) {
            for (prop in trDataSet) {
                if (prop === "id") {
                    finalParam[prop] = trDataSet[prop];
                } else {
                    propPart = prop.split('_');  
                    tmpNm = '';              
                    for(i = 0; i < propPart.length; i++) {
                        if (i === 0) { 
                            tmpNm += propPart[i];
                        } else {
                            tmpProp = this.capitalizeFirstLetter(propPart[i]);
                            tmpNm += tmpProp;                            
                        }
                    }
                    finalParam[tmpNm] = trDataSet[prop];
                }                                
            }
        }        

        return finalParam;
    }

    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getCurrentDate(dateToFormat = null) {
        let today = new Date(), dd, mm, yyyy, currentDt;
        if (dateToFormat) {
            today = new Date(dateToFormat);
        }
        dd = String(today.getDate()).padStart(2, '0');
        mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        yyyy = today.getFullYear();

        currentDt = yyyy + '-' + mm + '-' + dd;

        return currentDt;
    }

    

    getQueryString(obj) {
        let field, res = "";

        if (obj) {
            for(field in obj) {
                res += field+":"+ obj[field]+ "$";      
            }
        } 
        if (res) {
            res = res.substring(0, res.length-1);
        }       

        return res;
    }

    setPaginationFlag() {
        // if (this.pageNo === 1) {
        //     this.start = this.pageNo;
        //     if(this.totalCount <= this.limit) {
        //         this.end = this.totalCount;
        //     }
        // } else {
        //     this.start = ((this.pageNo-1)*this.limit)+1;
        //     this.end = this.start+this.limit;
        //     if(this.totalCount <= this.end) {
        //         this.end = this.totalCount;
        //     }
        // }        
    }

    getQueryParams(obj) {
        let field, res = "";
    
        if (obj) {
            for(field in obj) {
                if (!obj[field]) {
                    obj[field] = "";
                }
                res += field+"="+obj[field]+"&";            
            }
        } 
        if (res !== "") {
            res = res.substr(0, (res.length-1));
        }       
    
        return res;
    }

    titleCaseWord(word: string) {
        if (!word) { 
            return word;
        }

        return word[0].toUpperCase() + word.substr(1).toLowerCase();
      }















	replaceAll(str, mapObj){
		var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

		return str.replace(re, function(matched){
			return mapObj[matched];
		});
	}

	parseJwt(type = 'oauthtoken') {
        var base64;

        try {
            base64 = this.getCookie(type);
            if (base64 != '' && base64 != null) {
                return JSON.parse(atob(base64.split('.')[1]));
            }

            return '';
        } catch (e) {
            console.log(e);
        }
	}
	
	escapeString(str) {
        var tempDv = document.createElement('div');
        tempDv.innerText = str;
        str = tempDv.innerHTML;
        tempDv.style.display = 'none';

        return str;
	}
	
	stripHtml(html) {
        var temporalDivElement = document.createElement('div');
        temporalDivElement.innerHTML = html;
        return temporalDivElement.textContent || temporalDivElement.innerText || '';
	}

	convertNumberToWords(config, requestedLocale, amount) {
        let words, value, n_array, received_n_array, i, atemp, number, n_length,
            words_string, j;

        words = config[requestedLocale].numberToWords;
        amount = amount.toString();
        atemp = amount.split(".");
        number = atemp[0].split(",").join("");
        n_length = number.length;
        words_string = "";
        if (n_length <= 9) {
            n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            received_n_array = new Array();
            for (i = 0; i < n_length; i++) {
                received_n_array[i] = number.substr(i, 1);
            }
            for (i = 9 - n_length, j = 0; i < 9; i++, j++) {
                n_array[i] = received_n_array[j];
            }
            for (i = 0, j = 1; i < 9; i++, j++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    if (n_array[i] == 1) {
                        n_array[j] = 10 + parseInt(n_array[j]);
                        n_array[i] = 0;
                    }
                }
            }
            value = "";
            for (i = 0; i < 9; i++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    value = n_array[i] * 10;
                } else {
                    value = n_array[i];
                }
                if (value != 0) {
                    words_string += words[value] + " ";
                }
                if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += config[requestedLocale].numberToWords.crores;
                }
                if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += config[requestedLocale].numberToWords.lakhs;
                }
                if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += config[requestedLocale].numberToWords.thousand;
                }
                if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                    words_string += config[requestedLocale].numberToWords.hundred_and;
                } else if (i == 6 && value != 0) {
                    words_string += config[requestedLocale].numberToWords.hundred;
                }
            }
            words_string = words_string.split("  ").join(" ");
        }
        return words_string;
    }
}