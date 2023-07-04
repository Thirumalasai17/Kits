import { Component, OnInit } from '@angular/core';
import { ProtocolService } from '../protocol-registration/protocol-registration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-protocol-grid',
  templateUrl: './protocol-grid.component.html',
  styleUrls: ['./protocol-grid.component.css']
})
export class ProtocolGridComponent implements OnInit {

  protocolDetails: any[]= [];
  allprotocolDetails: any[] = [];
  page = 1;
  totalCount = 0
  pageSize = 10;
  p = 1;
  searchText= ''

  constructor(private route: Router, private protocol: ProtocolService) { }

  ngOnInit(): void {
  this.getProtocolDetails();
  }

  siteCreate(){
    this.route.navigate(['/home/cro/protocol'])
  }
  view(id:string){

    
    this.route.navigate(['/home/cro/protocolView',id])
  }
  edit(id:string){
    this.route.navigate(['/home/cro/protocolUpdate',id])
  }
  pCreate(){
    this.route.navigate(['/home/cro/protocolRegistration'])
  }
  getProtocolDetails(){
   this.protocol.getProtocol().subscribe((data:any)=>{
      console.log(data)
      this.protocolDetails = data
      this.allprotocolDetails = data
    })

  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    if (filterValue === '') {
      this.protocolDetails = this.allprotocolDetails;
    }
    else {
      this.protocolDetails = this.allprotocolDetails.filter(
        (siteData: any) =>
          (siteData.protocol_id && siteData.protocol_id.toLowerCase().includes(filterValue)) ||
          (siteData.protocol_name && siteData.protocol_name.toLowerCase().includes(filterValue)) ||
          (siteData.email && siteData.email.toLowerCase().includes(filterValue))
      );
    }
  }
  pageChange(event: number) {
    this.page = event;
    this.getProtocolDetails()
  }
}
