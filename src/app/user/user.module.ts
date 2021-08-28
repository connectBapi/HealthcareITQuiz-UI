import { NgModule } from '@angular/core';
import { SharedModule } from "./../shared/shared.module";

import { UserRoutingModule } from "./user.routing.module";

import { UserService } from './services/user.services';

import { SignupComponent } from "./component/signup/signup.component";
import { SigninComponent } from "./component/signin/signin.component";
import { ResetComponent } from "./component/reset/reset.component";
import { RecoverComponent } from "./component/recover/recover.component";
import { ActivateComponent } from "./component/activate/activate.component";

import { ProfileComponent } from "./component/profile/profile.component";
import { ChangePasswordComponent } from "./component/change-password/change-password.component";
import { UserComponent } from "./component/user/user.component";

import { SettingComponent } from "./component/setting/setting.component";

@NgModule({
    declarations: [
        SignupComponent,
        SigninComponent,
        ResetComponent,  
        RecoverComponent,
        ActivateComponent,
        ProfileComponent,
        ChangePasswordComponent,
        UserComponent,
        SettingComponent
    ],
    imports: [
        SharedModule,
        UserRoutingModule        
    ],
    providers: [
        UserService
    ]
})
export class UserModule {}