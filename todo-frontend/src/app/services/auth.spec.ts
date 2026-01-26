import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

// Basic creation test for the auth service.
describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    // Minimal TestBed setup for injectable services.
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
