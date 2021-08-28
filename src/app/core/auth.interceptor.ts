import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AuthInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {        
        let authorization = this.getCookie("oauthtoken"), headerObj: any = {};
        
        if (authorization) {
            headerObj = {
                Authorization: authorization
            };
        }        
        request = request.clone({
            setHeaders: headerObj
        });
        
        return next.handle(request);
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

        return null;
	}
}