import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../core/auth.guard";

import { TwoColumnComponent } from "./../shared/component/layout/two-column/two-column.component";

import { DashboardComponent } from "./component/dashboard/dashboard.component";
import { RoleComponent } from "./component/role/role.component";
import { TaskComponent } from "./component/task/task.component";
import { RoleTaskComponent } from "./component/role-task/role-task.component";

const routes: Routes = [
    {
        path: "admin",
        component: TwoColumnComponent,
        // canActivate: [AuthGuard],
        children: [
            {
                path: "dashboard",
                component: DashboardComponent
            },
            {
                path: "role",
                component: RoleComponent
            },
            {
                path: "task",
                component: TaskComponent
            },
            {
                path: "role-task",
                component: RoleTaskComponent
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}