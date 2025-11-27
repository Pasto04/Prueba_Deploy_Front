import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseResenas } from '../models/mesa.models.js';
import { UsuarioService } from './usuario.service.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
  ) {}

  obtenerResenas(): Observable<ResponseResenas> {
    return this.http.get<ResponseResenas>(`${environment.apiUrl}/resenas`);
  }

  crearResena(nroPed: number, resena: { cuerpo: string; puntaje: number }): Observable<any> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    return this.http.post(`${this.apiUrl}/${clienteId}/pedidos/${nroPed}/resena`, resena, {withCredentials: true});
  }

  modificarResena(nroPed: number, resena: { cuerpo: string; puntaje: number }): Observable<any> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    return this.http.put(`${this.apiUrl}/${clienteId}/pedidos/${nroPed}/resena`, resena, {withCredentials: true});
  }

  eliminarResena(nroPed: number): Observable<any> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    return this.http.delete(`${this.apiUrl}/${clienteId}/pedidos/${nroPed}/resena`, {withCredentials: true});
  }
}



