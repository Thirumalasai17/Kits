import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KitPreprationComponent } from './kit-prepration/kit-prepration.component';
import { KitVerificationComponent } from './kit-verification/kit-verification.component';
import { SampleAcknowledgementComponent } from './sample-acknowledgement/sample-acknowledgement.component';
import { UploadResultsComponent } from '../central/upload-results/upload-results.component';
import { KitDistributionComponent } from './kit-distribution/kit-distribution.component';
import { SampleCollectionComponent } from './sample-collection/sample-collection.component';

const routes: Routes = [
  {path:'kitPrepration', component:KitPreprationComponent},
  {path:'kitVerification', component:KitVerificationComponent},
  {path:'kitDistribution', component:KitDistributionComponent},
  {path:'sampleCollection', component:SampleCollectionComponent},
  {path:'sampleAcknowledgement', component:SampleAcknowledgementComponent},
  {path:'upload', component:UploadResultsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CentralLabRoutingModule { }
