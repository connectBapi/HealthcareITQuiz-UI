import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Layout */
import { TwoColumnComponent } from "./component/layout/two-column/two-column.component";

/* 404 */
import { PageNotFoundComponent } from './component/error/page-not-found/page-not-found.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule
    ],
    declarations: [
        TwoColumnComponent,
        PageNotFoundComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        TwoColumnComponent,
        PageNotFoundComponent
    ]
})
export class SharedModule {}