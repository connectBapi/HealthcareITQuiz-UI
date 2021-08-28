import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";

import { AppConfigService } from './core/services/app-config.service';
import { LocaleConfigService } from './core/services/locale-config.service';
import { CustomPreloadingStrategyService } from "./core/services/custom-preloading-strategy";
import { GlobalErrorHandlerService } from "./core/services/global-error-handlr.service";
import { GlobalHttpInterceptorService } from "./core/services/global-http-interceptor.service";
import { AuthInterceptor } from './core/auth.interceptor';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { HomeModule } from './home/home.module';
import { AdminModule } from './admin/admin.module';
import { MasterModule } from './master/master.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

export function initializeAppConfig(appConfigService: AppConfigService) {
	return (): Promise<any> => {
		return appConfigService.load();
	}
}
export function initializeLocaleConfig(localeConfigService: LocaleConfigService) {
	return (): Promise<any> => {
		return localeConfigService.load();
	}
}
export function tokenGetter() {
    return localStorage.getItem("access_token");
}

@NgModule({
	declarations: [
    	AppComponent
  	],
  	imports: [
		BrowserModule,
        JwtModule.forRoot({
            config: {
              tokenGetter: tokenGetter,
              whitelistedDomains: ["example.com"],
              blacklistedRoutes: ["http://example.com/examplebadroute/"]
            }
        }),
		CoreModule,	
		SharedModule,	
		UserModule,
		HomeModule,
		AdminModule,
		MasterModule,
		AppRoutingModule,
  	],
	providers: [		
		AppConfigService,
		{
			provide: APP_INITIALIZER, 
			useFactory: initializeAppConfig, 
			deps: [AppConfigService], 
			multi: true
		},
		LocaleConfigService,
		{
			provide: APP_INITIALIZER, 
			useFactory: initializeLocaleConfig, 
			deps: [LocaleConfigService], 
			multi: true
		},
		CustomPreloadingStrategyService,
		// {
        //     provide: ErrorHandler,
        //     useClass: GlobalErrorHandlerService
		// },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: GlobalHttpInterceptorService,
			multi: true
		},
		{
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}