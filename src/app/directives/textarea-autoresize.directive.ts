import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[autoresize]',
  host: {
    '(input)': 'onInput($event)',
    '(keyup)': 'onPressEnter($event)'
  }
})
export class TextareaAutoresizeDirective implements OnInit {

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    if (this.elementRef.nativeElement.scrollHeight) {
      const _t = setTimeout(() => (this.resize(), clearTimeout(_t)));
    }
  }

  onInput() { 
    this.resize();
  }

  onPressEnter($event) { 
    if ($event?.code?.toLowerCase() !== 'enter') {
      return;
    }
    $event.preventDefault();
  }

  resize() {
    const el = this.elementRef.nativeElement.querySelector("textarea");
    if(!el) return;
    if (el.value.length === 0) {
      el.style.height = '34px';
      return;
    }
    el.style.height = '0';
    el.style.height = el.scrollHeight + 'px';
  }
}