import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosAdd } from './todos-add';

describe('TodosAdd', () => {
  let component: TodosAdd;
  let fixture: ComponentFixture<TodosAdd>;

  beforeEach(async () => {
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
