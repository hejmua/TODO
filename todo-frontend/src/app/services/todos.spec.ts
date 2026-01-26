import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Todos } from './todos';

// Basic creation test for the todos service.
describe('Todos', () => {
  let service: Todos;

  beforeEach(() => {
    // Provide HttpClientTestingModule for HTTP-dependent services.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Todos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
