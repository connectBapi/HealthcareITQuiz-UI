import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../core/auth.guard";

import { TwoColumnComponent } from "./../shared/component/layout/two-column/two-column.component";

import { SigninComponent } from "./component/signin/signin.component";
import { SignupComponent } from "./component/signup/signup.component";
import { ResetComponent } from "./component/reset/reset.component";
import { RecoverComponent } from "./component/recover/recover.component";
import { ActivateComponent } from "./component/activate/activate.component";

import { ProfileComponent } from "./component/profile/profile.component";
import { ChangePasswordComponent } from "./component/change-password/change-password.component";
import { UserComponent } from "./component/user/user.component";

const routes: Routes = [ 
    {
        path: "signin",
        component: SigninComponent
    },
    {
        path: "signup",
        component: SignupComponent
    },
    {
        path: "reset",
        component: ResetComponent
    },
    {
        path: "recover",
        component: RecoverComponent
    },
    {
        path: "activate",
        component: ActivateComponent
    },
    {
        path: "admin",
        component: TwoColumnComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: "profile",
                component: ProfileComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "change-password",
                component: ChangePasswordComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "user",
                component: UserComponent
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class UserRoutingModule {}