import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {
    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error) => {
                this.handleHttpError(error);
                return throwError(error.error);
            })
        );
    }

    handleHttpError(error) {
        if (error instanceof HttpErrorResponse) {
            if (error.error instanceof ErrorEvent) {
                console.error("Error Event occured");
            } else {
                switch (error.status) {
                    case 400:                        
                        throwError(error.error);
                        break;

                    case 401:
                        // alert("Please login to continue.");
                        throwError(error.error);
                        break;

                    case 403:
                        // alert("You are unauthorized to see this page.");
                        throwError(error.error);
                        break;

                    case 500:
                        alert("Something went wrong.");
                        break;

                    default:
                        alert("Please contact support.");
                }
            } 
        } else {
            console.error("some thing else happened");
        }
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
}