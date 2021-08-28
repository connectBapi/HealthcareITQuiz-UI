import { Injectable } from "@angular/core";
import { Observable, of, timer } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { Route, PreloadingStrategy } from "@angular/router";

@Injectable()
export class CustomPreloadingStrategyService implements PreloadingStrategy {
    preload(route:Route, loadMe: () => Observable<any>):Observable<any>  {
        if (route.data && route.data['preload']) {
            let delay:number = route.data['delay'];
            console.log('preload called on '+route.path+' delay is '+delay);
            return timer(delay).pipe(
                mergeMap( _ => { 
                    console.log("Loading now "+ route.path);
                    return loadMe() ;
                })
            );
          } else {
            console.log('no preload for the path '+ route.path);
            return of(null);
        }
    }
}