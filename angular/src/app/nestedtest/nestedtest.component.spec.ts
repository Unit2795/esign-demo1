import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedtestComponent } from './nestedtest.component';

describe('NestedtestComponent', () => {
  let component: NestedtestComponent;
  let fixture: ComponentFixture<NestedtestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestedtestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
