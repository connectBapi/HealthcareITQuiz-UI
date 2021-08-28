import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from '../../../core/services/common.service';
import { RoleService } from '../../services/role.service';
import { TaskService } from '../../services/task.service';
import { RoleTaskService } from '../../services/role-task.service';

@Component({
    selector: "app-role-task",
    templateUrl: "./role-task.component.html"
})
export class RoleTaskComponent implements OnInit, OnDestroy {    
    nativeEle;
    locale;
    breadCumb;
    lang;
    footer;
    formCls;
    roleTaskFrm;
    submitted: Boolean = false;
    roles;
    tasks;
    roleTasks = [];
    isFormReady = false;
    access;
    formatedRoleTasks = {};

    constructor(
        private ele: ElementRef,
        private fb: FormBuilder,        
        private commonService: CommonService,
        private roleService: RoleService,
        private taskService: TaskService,
        private roleTaskService: RoleTaskService
    ) {}

    ngOnInit() {
        this.commonService.localeObserver.subscribe(
			isLangChanged => {
				if (isLangChanged) {
                    this.initiateLocale();
				}
			}
        );
        this.initiateLocale();
        this.initiateForm();
        this.initiateComponent();
    }

    initiateLocale() {
        this.locale = this.commonService.getLocale()["admin"]["roleTask"];
        this.breadCumb = this.commonService.getLocale()["admin"]["breadComb"];
        this.lang = this.commonService.getLanguage();
        this.footer = this.commonService.getLocale()["footer"];
    }

    initiateForm() {
        this.roleTaskFrm = this.fb.group({
            _id: this.fb.control(""),
            roleId: this.fb.control(null, Validators.required),
            taskAccess: this.fb.array([])
        });
    }

    initiateComponent() {
        this.nativeEle = this.ele.nativeElement;
        this.formCls = this.locale.label.formCls;
        this.commonService.toggleLoader(true);
        this.getRoles();  
        // this.getRoleTasks();
    }

    getRoles() {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.roleService.getRoles(queryParams).subscribe(
			res => {
                this.roles = res.data;
                this.commonService.toggleLoader(false);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    getRoleTasks(roleId) {
        let queryParams: any;

        if (roleId === "null") {
            this.resetFrm();
            return false;
        }
		queryParams = {
            "lang": this.lang,
            "roleId": roleId,
            "type": "dropdown"
        };        		
        this.commonService.toggleLoader(true);
		this.roleTaskService.getRoleTasksByRoleId(queryParams).subscribe(
			res => {              
                this.roleTaskFrm.removeControl("taskAccess");
                this.roleTaskFrm.addControl("taskAccess", this.fb.array([]));  
                this.roleTasks = res.data;  
                if (this.roleTasks) {
                    this.roleTaskFrm.get("_id").setValue(this.roleTasks["_id"]);
                    this.formatRoleTasks(); 
                } else {
                    this.roleTaskFrm.get("_id").setValue("");
                    this.formatedRoleTasks = {};
                    this.getTasks(roleId);
                }              
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }  
    
    formatRoleTasks() {
        let i, roleId, roleTasks:any = this.roleTasks;

        roleId = roleTasks.roleId;
        this.formatedRoleTasks[roleId] = {};
        for(i in roleTasks.taskAccess) {            
            this.formatedRoleTasks[roleId][roleTasks.taskAccess[i]["taskId"]] = roleTasks.taskAccess[i]["access"];
        }
        this.getTasks(roleId);
    }

    getTasks(roleId) {
        let queryParams: any;

		queryParams = {
            "lang": this.lang,
            "type": "dropdown"
        };        		
		this.taskService.getTasks(queryParams).subscribe(
			res => {
                this.tasks = res.data;
                this.createFormArr(roleId);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    createFormArr(roleId) {
        let j, taskAccessArr, taskAccessArrGrp, accesFrmArr;

        taskAccessArr = this.roleTaskFrm.get("taskAccess") as FormArray
        if (this.tasks) {
            for(j = 0; j< this.tasks.length; j++) {
                taskAccessArrGrp = this.fb.group({});
                taskAccessArrGrp.addControl(
                    "taskId", this.fb.control(this.tasks[j]._id)
                );
                accesFrmArr = this.getAccessFrmArray(
                    roleId, this.tasks[j]._id
                );
                taskAccessArrGrp.addControl("access", accesFrmArr);
                taskAccessArr.push(taskAccessArrGrp);
            }
        } 
        this.isFormReady = true;       
        this.commonService.toggleLoader(false);
    }

    getAccessFrmArray(roleId, taskId) {
        let access = [], currentRoleAccess = 0,
            accessFrmArr = this.fb.array([]), i;

        if (this.formatedRoleTasks[roleId] && this.formatedRoleTasks[roleId][taskId]) {
            currentRoleAccess = this.formatedRoleTasks[roleId][taskId];
        };
        access.push(
            ((currentRoleAccess & 8) !== 0),
            ((currentRoleAccess & 12) !== 0),
            ((currentRoleAccess & 14) !== 0),
            ((currentRoleAccess & 15) !== 0)
        );

        for(i = 0; i < access.length; i++) {
            accessFrmArr.push(
                this.fb.control(access[i])
            );
        }

        return accessFrmArr;
    }

    saveRoleTasks() {        
        let frmData = this.formatRoleAccessValue(), queryParams: any;

        this.submitted = true;
		if (this.roleTaskFrm.invalid) {
            this.commonService.scrollToElement(this.f, this.nativeEle);
            return false;           
		}
		queryParams = {
            "lang": this.lang
        };
        this.commonService.hideAllError(this.nativeEle);
		this.commonService.toggleLoader(true);
		this.roleTaskService.saveRoleTasks(frmData, queryParams).subscribe(
			res => {
                this.commonService.toggleLoader(false);
                this.commonService.scrool2Top();
                this.resetFrm();                
                this.alertSuccess(res.data);
			},
			err => {
				this.commonService.toggleLoader(false);
				this.commonService.showServerValidationError(
                    err, this.formCls, this.nativeEle, this.locale
                );
			}
		);
    }

    formatRoleAccessValue() {
        let i, j, roleTaskFrmVal = this.roleTaskFrm.value,
            taskId, access, roleAccessValueMap = this.locale.label.roleAccessValue, accessVal, finalAccessArr = [],  temproleTaskFrmVal:any = {};
            temproleTaskFrmVal.roleId = roleTaskFrmVal.roleId;
        finalAccessArr = [];

        for(i = 0; i < roleTaskFrmVal.taskAccess.length; i++) {
            taskId = roleTaskFrmVal.taskAccess[i].taskId;
            access = roleTaskFrmVal.taskAccess[i].access;
            accessVal = 0;
            access.forEach((item, idx) => {
                if (item === true) {
                    accessVal = roleAccessValueMap[idx];
                }
            });
            if (accessVal > 0) {
                finalAccessArr.push({
                    "taskId": taskId,
                    "access": accessVal
                });
            }         
        }
        temproleTaskFrmVal.taskAccess = finalAccessArr;
        temproleTaskFrmVal._id = roleTaskFrmVal._id;

        return temproleTaskFrmVal;
    }

    resetFrm() {
        this.submitted = false;
        this.roleTaskFrm.reset();
        this.isFormReady = false;
    }

    alertSuccess(msg) {
        this.commonService.showSuccessAlert(msg, this.nativeEle, this.locale);
    }

    get f() { return this.roleTaskFrm.controls; }

    ngOnDestroy() {
        // this.commonService.localeObserver.unsubscribe();
    } 
}