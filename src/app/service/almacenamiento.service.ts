import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AlmacenamientoService {

  private almacenamientoEnMemoria: {[key: string]: string} = {};

  // Inyectamos el ID de la plataforma para saber si estamos en el navegador o servidor
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    } else {
      this.almacenamientoEnMemoria[key] = value;
    }
  }

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    } else {
      return this.almacenamientoEnMemoria[key] || null;
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    } else {
      delete this.almacenamientoEnMemoria[key];
    }
  }
}