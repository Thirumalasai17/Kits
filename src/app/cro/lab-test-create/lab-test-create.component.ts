import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminService } from 'src/app/applicationadmin/admin.service';
import { CrosService } from '../cros.service';

@Component({
  selector: 'app-lab-test-create',
  templateUrl: './lab-test-create.component.html',
  styleUrls: ['./lab-test-create.component.css']
})
export class LabTestCreateComponent implements OnInit {
  myData: any;
  classifications = [];
  public isEdit: boolean = false;
  public id: any = '';
  getcroData: any;
  mobile: any;
  view: boolean = false;
  constructor(private cro: CrosService, private admin: AdminService,
    private _activatedRoute: ActivatedRoute, private router: Router, private http:HttpClient,
    private messageService: MessageService
  ) {
    this._activatedRoute.params.subscribe((data: any) => {
      if (data.id) {
        this.isEdit = true;
        this.id = data.id;
        cro.getLabById(data.id).subscribe((data: any) => {
          this.getcroData = data
          this.labTestCreateForm.patchValue(data)
          this.labTestCreateForm.controls['cro_code'].disable()
          // this.labTestCreateForm.controls['cro_name'].disable()
          // this.labTestCreateForm.controls['legal_cro_name'].disable()
          // this.labTestCreateForm.controls['email'].disable()

        });
        if(data.val == 'view'){
          this.view = true
          this.labTestCreateForm.disable()
          
        }
        else{
       
        }

      }
    });
    this.admin.country().subscribe((resp: any) => {
      const countries = [];
      for (let i = 0; i < resp.length; ++i) {
          const country = resp[i];
          countries.push({ text: country.text, value: country.value });
      }
      this.myData = countries;
  });
  }

  public labTestCreateForm: FormGroup = new FormGroup({
    cro_code: new FormControl("", [Validators.required]),
    cro_name: new FormControl("", [Validators.required]),
    legal_cro_name: new FormControl("", [Validators.required]),
    address_1: new FormControl("", [Validators.required]),
    address_2: new FormControl(""),
    classification: new FormControl(""),
    city: new FormControl("", [Validators.required]),
     district: new FormControl(""),
    region: new FormControl("", [Validators.required]),
    zip_code: new FormControl("", [Validators.required]),
    country: new FormControl("", [Validators.required]),
    office_telephone: new FormControl(""),
    extension: new FormControl(""),
    email: new FormControl(''),
    website:new FormControl(''),
    mobile_telephone:new FormControl(''),
      // Validators.required,
      // Validators.email,
      // this.emailDomainValidator.bind(this)

    // website: new FormControl('', [
    //   Validators.required,
    //   Validators.minLength(3),
    //   Validators.pattern(
    //     /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
    //   ) // Regular expression pattern for URL validation
    // ]),

    // mobile_telephone: new FormControl('', [
    //   Validators.required,
    //   Validators.pattern('[0-9]{10}')
    // ]),
  });

  emailDomainValidator(control: FormControl): ValidationErrors | null {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const [_, domain] = email.split('@');
      if (!['gmail.com'].includes(domain)) {
        return { invalidDomain: true };
      }
    }
    return null; // Return null for valid email format
  }

  ngOnInit(): void {
   

  }


  shouldShowRequired(controlName: string): boolean {
    const control = this.labTestCreateForm.get(controlName);
    return control?.invalid && (control?.dirty || control?.touched) || false;
  }

  shouldShowLengthError(controlName: any): boolean {

    const control = this.labTestCreateForm.get(controlName);
    return control?.invalid && (control?.errors?.['minlength'] || control?.errors?.['maxlength']) && (control?.dirty || control?.touched) || false;
  }
  shouldShowPatternError(controlName: string): boolean {
    const control = this.labTestCreateForm.get(controlName);
    return control?.touched && control?.errors?.['pattern'];
  }
  shouldShowUrlError(controlName: string): boolean {
    const control = this.labTestCreateForm.get(controlName);
    return !!control?.hasError('pattern') && !!control?.value && (control?.dirty || control?.touched);
  }

  submit() {
    if (this.labTestCreateForm.controls['mobile_telephone'].value === '' || this.labTestCreateForm.controls['mobile_telephone'].value === null) {
      this.mobile = ''
    }
    else {
      this.mobile = this.labTestCreateForm.controls['mobile_telephone'].value.toString()
    }
   
    
      if (this.labTestCreateForm.invalid) {
        // Mark all form controls as touched to trigger validation
        Object.keys(this.labTestCreateForm.controls).forEach(key => {
          this.labTestCreateForm.get(key)?.markAsTouched();
        });
        this.messageService.add({severity:'error', summary:'Error Message', detail:'Please Fill All Mandatory Fields'});
      
        
      }
    else {
      const obj: any = {
        "cro_code": this.labTestCreateForm.controls['cro_code'].value,
        "cro_name": this.labTestCreateForm.controls['cro_name'].value,
        "legal_cro_name": this.labTestCreateForm.controls['legal_cro_name'].value,
        "address_1": this.labTestCreateForm.controls['address_1'].value,
        "address_2": this.labTestCreateForm.controls['address_2'].value,
        "city": this.labTestCreateForm.controls['city'].value,
        "district": this.labTestCreateForm.controls['district'].value,
        "region": this.labTestCreateForm.controls['region'].value,
        "zip_code": this.labTestCreateForm.controls['zip_code'].value,
        "country": this.labTestCreateForm.controls['country'].value,
        "office_telephone": this.labTestCreateForm.controls['office_telephone'].value,
        "mobile_telephone": this.mobile,
        "extension": this.labTestCreateForm.controls['extension'].value,
        "email": this.labTestCreateForm.controls['email'].value,
        "website": this.labTestCreateForm.controls['website'].value
      }
      if (this.isEdit) {
        obj.cro_id = this.id
        this.cro.updateLabDetails(obj).subscribe(
          (data: any) => {
            setTimeout(() => {
              this.messageService.add({severity:'success', summary:'Success Message', detail:'Lab Updated Successfully'});
             }, 1000);
               

            this.router.navigate(['/home/cro/labGrid'])
          },
          (err: any) => {
            this.messageService.add({severity:'error', summary:'Error Message', detail:err.error.message});
          }
        );
      }
      else {
        this.cro.CreateLabDetails(obj).subscribe(
          (data: any) => {
         setTimeout(() => {
          this.messageService.add({severity:'success', summary:'Success Message', detail:'Lab Created Successfully'});
         }, 1000);
           
            this.router.navigate(['/home/cro/labGrid'])
          },
          (err: any) => {
            this.messageService.add({severity:'error', summary:'Error Message', detail:err.error.message});
          }
        )
      }
    }
  }
  validateMobileNumber(input: any, phone: any) {
    let inputValue = input.value.trim();
    
    // Remove non-numeric characters
    let numericValue = inputValue.replace(/\D/g, '');

    if(phone ==='mobile'){
    if (numericValue.length > 12) {
        numericValue = numericValue.slice(0, 12);
    }
  }
  else{
    if (numericValue.length > 16) {
      numericValue = numericValue.slice(0, 16);
  }
  }
    
    input.value = numericValue;
  
}

}



