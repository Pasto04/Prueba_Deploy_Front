import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioLogIn, UsuarioLogOut, UsuarioRegistro, UsuarioResponse } from '../shared/usuarioInterfaces.js';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../shared/usuario.entity.js';
import { AlmacenamientoService } from './almacenamiento.service.js';
import { SideNavService } from './side-nav.service.js';
import { environment } from '../../environments/environment';

const USER_KEY = 'Usuario';
const TOKEN_KEY = 'token'; // Definir la clave para el token

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarioSubject = new BehaviorSubject<Usuario>(this.getUsuarioFromLocalStorage());
  public usuarioObservable: Observable<Usuario> = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private almacenamientoService: AlmacenamientoService,
    private sideNavService: SideNavService
  ) {}

  readonly urlUsuario = `${environment.apiUrl}/usuarios`;

  public registrarUsuario(usuario: UsuarioRegistro) {
    const url = this.urlUsuario + '/registro';
    return this.http.post<UsuarioResponse>(url, usuario);
  }

  public loginUsuario(usuario: UsuarioLogIn) {
    const url = this.urlUsuario + '/login';
    return this.http.post<UsuarioResponse>(url, usuario, { withCredentials: true }).pipe(
      tap({
        next: (response) => {
          const usuario: Usuario = response.data;
          const token = response.token;  // Asegurarse de que el token se obtiene correctamente
          this.setUsuarioToLocalStorage(usuario);
          this.setTokenToLocalStorage(token); // Guardar el token en el localStorage
          this.usuarioSubject.next(usuario);
          this.sideNavService.filtrarFunciones(usuario.tipoUsuario);
        }
      })
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);  // Obtener el token desde 'token'
    console.log('Token obtenido:', token);
    return token;
  }

  public logOutUsuario() {
    const url = this.urlUsuario + '/logout';
    return this.http.post<UsuarioLogOut>(url, null, { withCredentials: true }).pipe(
      tap({
        next: () => {
          this.usuarioSubject.next(new Usuario());
          this.removeUsuarioFromLocalStorage();
          this.removeTokenFromLocalStorage(); // Eliminar el token al hacer logout
        }
      })
    );
  }

  private setUsuarioToLocalStorage(usuario: Usuario): void {
    this.almacenamientoService.setItem(USER_KEY, JSON.stringify(usuario));
  }

  private getUsuarioFromLocalStorage(): Usuario {
    const usuario = this.almacenamientoService.getItem(USER_KEY);
    if (usuario) {
      return JSON.parse(usuario);
    } else {
      return new Usuario();
    }
  }

  private removeUsuarioFromLocalStorage(): void {
    this.almacenamientoService.removeItem(USER_KEY);
  }

  private setTokenToLocalStorage(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);  // Guardar el token en localStorage
  }

  private removeTokenFromLocalStorage(): void {
    localStorage.removeItem(TOKEN_KEY);  // Eliminar el token al hacer logout
  }

  public obtenerUsuarioActual(): Usuario {
    return this.usuarioSubject.value;
  }

  public actualizarUsuario(usuario: Usuario): void {
    this.setUsuarioToLocalStorage(usuario);
    this.usuarioSubject.next(usuario);
  }

  public showTipoUsuario(): string {
    return this.usuarioSubject.value.tipoUsuario;
  }
///hola esteban quito
}

