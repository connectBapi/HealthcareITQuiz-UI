import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from './services/common.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private commonService: CommonService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let currentUser = this.commonService.getCurrentUser(),
            isTokenExpired = this.commonService.isTokenExpired(),
            capability = this.commonService.getCapabilities();

        // console.log(state.url, capability)
        
        if (currentUser && isTokenExpired == false) {
            return true;
        }

        this.router.navigate(['/signin']);
        return false;
    }
}