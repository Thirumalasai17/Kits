import { Component, OnInit } from '@angular/core';
import { CrosService } from '../cros.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lab-create',
  templateUrl: './lab-create.component.html',
  styleUrls: ['./lab-create.component.css']
})
export class LabCreateComponent {
  public isEdit: boolean = false;
  public id: any = '';
  files1: any;
  file2: any;
  public base64textString: string = '';
  public bas2: string = '';
  labData: any;
  imgDisplay: boolean = false
  editImage: boolean = false
  imageChanged: boolean = true;
  fieldDisplay: boolean = true

  constructor(
    private _cro: CrosService,
    private _activatedRoute: ActivatedRoute,
    private _formbuilder: FormBuilder, private route: Router,
    private messageService: MessageService

  ) {
    this._activatedRoute.params.subscribe((data: any) => {
      if (data.id) {
        this.isEdit = true;
        this.imageChanged = true
        this.id = data.id;
        _cro.getmeterialById(data.id).subscribe((data: any) => {
          this.labData = data
          this.labForm.controls['material'].setValue(this.labData.name)
          this.labForm.controls['size'].setValue(this.labData.size)
          // this.labForm.controls['lab_test'].disable()
          this.editImage = true;
          this.fieldDisplay = false
        });
        console.log(this.id)
      }
    });
  }
  public labForm: FormGroup = new FormGroup({
    material: new FormControl("", [Validators.required]),
    size: new FormControl("", [Validators.required]),
    image: new FormControl(''),
  });

  uploadFile(evt: any, value: boolean) {

    this.files1 = evt.target.files;
    const file = this.files1[0];
    this.file2 = this.files1[0].name;
    const fileSize = this.files1[0].size;
    if (fileSize >= 1084) {
    }
    if (this.files1 && file) {
      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded1.bind(this);
      reader.readAsBinaryString(file);
      this.imageChanged = value
    }
  }

  _handleReaderLoaded1(readerEvt: any) {

    const binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    this.bas2 = 'data:text/html;base64,' + this.base64textString;
    this.bas2 = this.bas2.substring(this.bas2.indexOf(',') + 1);
    this.imgDisplay = true;
    this.editImage = false
    console.log(this.bas2);
  }
  enable() {
    this.editImage = false
    this.fieldDisplay = true
    // this.enable= false
  }
  shouldShowRequired(controlName: string): boolean {
    const control = this.labForm.get(controlName);
    return control?.invalid && (control?.dirty || control?.touched) || false;
  }
  submit() {
    console.log(this.bas2);

    if (this.labForm.invalid) {
      // Mark all form controls as touched to trigger validation
      Object.keys(this.labForm.controls).forEach(key => {
        this.labForm.get(key)?.markAsTouched();
      });
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Please Fill All Mandatory Fields' });

    }
    else {

      const data: any =
      {
        "name": this.labForm.get('material')?.value,
        "size": this.labForm.get('size')?.value,
        "created_by":sessionStorage.getItem('userid')

      }

      if (this.isEdit) {
        if (this.imageChanged == true) {
          data.image = this.labData.image
        }
        else {
          data.image = this.bas2
        }
        // data.material_id = this.id


        this._cro.updateMaterialDetails(this.id, data).subscribe(
          (data: any) => {
            setTimeout(() => {
              this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Material Updated successfully' });

            }, 1000);
            this.route.navigate(['/home/cro/labTestGrid'])
          },
          (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: err.error.message });


          }
        );

      }
      else {
        data.image = this.bas2
        this._cro.createMaterialDetails(data).subscribe(
          (data: any) => {
            setTimeout(() => {
              this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Material Created successfully' });

            }, 1000);

            this.route.navigate(['/home/cro/labTestGrid'])
          },
          (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: err.error.message });

          }
        );
      }
      console.log(this.labForm.value);
    }
  }
}