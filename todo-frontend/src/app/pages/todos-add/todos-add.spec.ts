import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosAdd } from './todos-add';

// Basic creation test for the todos add component.
describe('TodosAdd', () => {
  let component: TodosAdd;
  let fixture: ComponentFixture<TodosAdd>;

  beforeEach(async () => {
    // Configure standalone component for testing.
    await TestBed.configureTestingModule({
      imports: [TodosAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodosAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
