import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {    
    static settings;

    constructor(private http: HttpClient){}

    load() {
        const jsonFile = './../../assets/config/config.json';

        return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).toPromise()
            .then((response: any) => {
                AppConfigService.settings = response;
                resolve();
            }).catch((response: any) => {
                reject('Failed to load the config file');
            });
        });
    }
}