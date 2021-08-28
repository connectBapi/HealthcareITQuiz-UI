import { NgModule, Optional, SkipSelf } from '@angular/core';
// import { CookieService as CoreCookieService } from 'ngx-cookie-service';
import { CommonService } from './services/common.service';
import { LoggerService } from './services/logger.service';
import { JwtService } from './services/jwt.service';
// import { CookieService } from './services/cookie.service';
import { AuthGuard } from './auth.guard';

@NgModule({
    imports: [
       
    ],
    providers: [  
        // CoreCookieService, 
        CommonService,
        LoggerService,
        JwtService,
        // CookieService,
        AuthGuard
    ]
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() core:CoreModule ){
        if (core) {
            throw new Error("You should import core module only in the root module")
        }
    }
}