import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LocaleConfigService {
    
    static settings;

    constructor(private http: HttpClient){}

    matchExact(r, str) {
        let match = str.match(r);

        return match && str === match[0];
    }

    load() {
        let searchArr = location.search.split("&"), i,
        queryArr, availableLang = ["en", "ar"], lang = "en", localeFile;
        
        for(i = 0; i < searchArr.length; i++) {
            if (searchArr[i]) {
                searchArr[i] = searchArr[i].replace("?", "");
                queryArr = searchArr[i].split("=");
                if (queryArr[0] === "lang" && availableLang.indexOf(queryArr[1]) !== -1) {
                    lang = queryArr[1];
                }            
            }            
        }

        localeFile = "locale-"+lang+".json";

        const jsonFile = './../../assets/config/'+localeFile;
        
        return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).toPromise()
            .then((response: any) => {
                LocaleConfigService.settings = response;
                resolve();
            }).catch((response: any) => {
                console.log(response)
                reject('Failed to load locale config file');
            });
        });
    }
}