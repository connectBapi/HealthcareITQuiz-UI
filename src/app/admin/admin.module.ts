import { NgModule } from "@angular/core";
import { SharedModule } from "./../shared/shared.module";
import { AdminRoutingModule } from "./admin.routing.module";

import { RoleService } from "./services/role.service";
import { TaskService } from "./services/task.service";
import { RoleTaskService } from "./services/role-task.service";
import { DashboardService } from "./services/dashboard.service";

import { DashboardComponent } from "./component/dashboard/dashboard.component";
import { RoleComponent } from "./component/role/role.component";
import { TaskComponent } from "./component/task/task.component";
import { RoleTaskComponent } from "./component/role-task/role-task.component";

@NgModule({
    declarations: [
        DashboardComponent,
        RoleComponent,
        TaskComponent,
        RoleTaskComponent
    ],
    imports: [
        SharedModule,
        AdminRoutingModule        
    ],
    providers: [
        RoleService,
        TaskService,
        RoleTaskService,
        DashboardService
    ]
})
export class AdminModule {}