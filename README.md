[![CircleCI](https://circleci.com/gh/scaljeri/angular-route-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-route-xxl)

### Old
    @Component({
        selector: 'app-contacts',
        templateUrl: './contacts.component.html',
        styleUrls: ['./contacts.component.scss'
    })
    export class ContactsComponent implements OnInit {
        contacts$: Observable<Contact[]>;
        contactId$: Observable<string>;
        
        constructor(private route: ActivatedRoute) {}
        
        ngOnInit() {
            this.contacts$ = this.route.parent.parent.parent.parent.data.map(data => data['contacts']);
            this.contactId$ = this.route.parent.parent.parent.params.map(params => params['contactId']);
        }
    }

### New
    @Component({
        selector: 'app-contacts',
        templateUrl: './contacts.component.html',
        styleUrls: ['./contacts.component.scss'
    })
    export class ContactsComponent {
        @RouteData('contacts') contacts$: Observable<Contact[]>;
        @RouteParams('contactId') contactId$: Observable<string>;
        constructor(private route: ActivatedRoute) {}
    }
