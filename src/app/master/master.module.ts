import { NgModule } from "@angular/core";
import { SharedModule } from "./../shared/shared.module";
import { MasterRoutingModule } from "./master.routing.module";

import { SpecialityService } from "./services/speciality.service";
import { CategoryService } from "./services/category.service";
import { QuestionService } from "./services/question.service";
import { QuestionSetService } from "./services/question-set.service";
import { QuestionSetAssignmentService } from "./services/question-set-assignment.service";
import { TakeExamService } from "./services/take-exam.service";

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

@NgModule({
    declarations: [
        SpecialityComponent,
        CategoryComponent,
        QuestionComponent,
        QuestionSetComponent,
        QuestionAssignmentComponent,
        TakeExamComponent,
        CommenceExamComponent,
        ExamResultComponent,
        ExamDetailsComponent,
        ExamReviewComponent
    ],
    imports: [
        SharedModule,
        MasterRoutingModule        
    ],
    providers: [
        SpecialityService,
        CategoryService,
        QuestionService,
        QuestionSetService,
        QuestionSetAssignmentService,
        TakeExamService
    ]
})
export class MasterModule {}