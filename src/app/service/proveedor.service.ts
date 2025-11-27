import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proveedor } from '../models/mesa.models.js';
import { Observable, tap, map } from 'rxjs';
import { ResponseProveedores } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  public crearProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const url = this.apiUrl;
    return this.http.post<Proveedor>(url, {
      cuit: proveedor.cuit,
      razonSocial: proveedor.razonSocial,
      direccion: proveedor.direccion,
      ciudad: proveedor.ciudad,
      provincia: proveedor.provincia,
      pais: proveedor.pais,
      telefono: proveedor.telefono,
      email: proveedor.email
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Proveedor creado:', response);
        },
        error: (error) => {
          console.error('Error al crear el proveedor:', error);
        }
      })
    );
  }

  getProveedores(): Observable<ResponseProveedores> {
  return this.http.get<ResponseProveedores>(this.apiUrl).pipe(
    tap({
      next: (response) => {
        console.log('Proveedores obtenidos:', response);
      },
      error: (error) => {
        console.error('Error al obtener proveedores:', error);
      }
    })
  );
}

  public obtenerProveedor(proveedorId: number): Observable<Proveedor> {
    const url = `${this.apiUrl}/${proveedorId}`;
    return this.http.get<Proveedor>(url, {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Proveedor obtenido:', response);
        },
        error: (error) => {
          console.error('Error al obtener el proveedor:', error);
        }
      })
    );
  }

  public actualizarProveedor(proveedorId: number, proveedorActualizado: Partial<Proveedor>): Observable<Proveedor> {
    const url = `${this.apiUrl}/${proveedorId}`;
    return this.http.patch<Proveedor>(url, {
      ...proveedorActualizado,
      cuit: proveedorActualizado.cuit,
      razonSocial: proveedorActualizado.razonSocial,
      direccion: proveedorActualizado.direccion,
      ciudad: proveedorActualizado.ciudad,
      provincia: proveedorActualizado.provincia,
      pais: proveedorActualizado.pais,
      telefono: proveedorActualizado.telefono,
      email: proveedorActualizado.email
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Proveedor actualizado:', response);
        },
        error: (error) => {
          console.error('Error al actualizar el proveedor:', error);
        }
      })
    );
  }

  public eliminarProveedor(proveedorId: number): Observable<void> {
    const url = `${this.apiUrl}/${proveedorId}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Proveedor con ID ${proveedorId} eliminado exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar el proveedor con ID ${proveedorId}:`, error);
        }
      })
    );
  }
}
