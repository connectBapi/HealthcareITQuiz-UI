import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./../core/auth.guard";

import { TwoColumnComponent } from "./../shared/component/layout/two-column/two-column.component";

import { SpecialityComponent } from "./component/speciality/speciality.component";
import { CategoryComponent } from "./component/category/category.component";
import { QuestionComponent } from "./component/question/question.component";
import { QuestionSetComponent } from "./component/question-set/question-set.component";
import { QuestionAssignmentComponent } from "./component/question-assignment/question-assignment.component";
import { TakeExamComponent } from "./component/take-exam/take-exam.component";
import { CommenceExamComponent } from "./component/commence-exam/commence-exam.component";
import { ExamResultComponent } from "./component/exam-result/exam-result.component";
import { ExamDetailsComponent } from "./component/exam-details/exam-details.component";
import { ExamReviewComponent } from "./component/exam-review/exam-review.component";

const routes: Routes = [
    {
        path: "admin",
        component: TwoColumnComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: "speciality",
                component: SpecialityComponent
            },
            {
                path: "category",
                component: CategoryComponent
            },
            {
                path: "question",
                component: QuestionComponent
            },
            {
                path: "question-set",
                component: QuestionSetComponent
            },
            {
                path: "question-assignment",
                component: QuestionAssignmentComponent
            },
            {
                path: "take-exam",
                component: TakeExamComponent
            },
            {
                path: "commence-exam",
                component: CommenceExamComponent
            },
            {
                path: "exam-result",
                component: ExamResultComponent
            },
            {
                path: "exam-details",
                component: ExamDetailsComponent
            },
            {
                path: "exam-review",
                component: ExamReviewComponent
            }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MasterRoutingModule {}