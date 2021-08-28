import { Injectable, Injector, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";
import { throwError } from 'rxjs';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
    constructor(private injector: Injector) {}

    handleError(error) {        
        let router = this.injector.get(Router);
        console.log('URL: ' + router.url);
        console.error('An error occurred:', error.stack);
        throwError(error);
        // router.navigate(["/page-not-found"]);        
    }
}