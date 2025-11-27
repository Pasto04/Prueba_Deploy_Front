import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Bebida } from '../models/mesa.models.js';
import { ResponseBebidas } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BebidaService {
  private readonly apiUrl = `${environment.apiUrl}/bebidas`;

  constructor(private http: HttpClient) {}

  public crearBebida(bebida: Bebida): Observable<Bebida> {
    return this.http.post<Bebida>(this.apiUrl, {
      descripcion: bebida.descripcion,
      stock:bebida.stock,
      unidadMedida: bebida.unidadMedida,
      contenido: bebida.contenido,
      precio: bebida.precio,
      alcohol: bebida.alcohol,
      imagen: bebida.imagen,
      proveedor: bebida.proveedor
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Bebida creada:', response);
        },
        error: (error) => {
          console.error('Error al crear la bebida:', error);
        }
      })
    );
  }

  public getBebidas(): Observable<ResponseBebidas> {
    return this.http.get<ResponseBebidas>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          console.log('Bebidas obtenidas:', response);
        },
        error: (error) => {
          console.error('Error al obtener bebidas:', error);
        }
      })
    );
  }

  public obtenerBebida(bebidaId: number): Observable<Bebida> {
    const url = `${this.apiUrl}/${bebidaId}`;
    return this.http.get<Bebida>(url).pipe(
      tap({
        next: (response) => {
          console.log('Bebida obtenida:', response);
        },
        error: (error) => {
          console.error('Error al obtener la bebida:', error);
        }
      })
    );
  }

  public actualizarBebida(bebidaId: number, bebidaActualizada: Partial<Bebida>): Observable<Bebida> {
    const url = `${this.apiUrl}/${bebidaId}`;
    return this.http.patch<Bebida>(url, {
      ...bebidaActualizada
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Bebida actualizada:', response);
        },
        error: (error) => {
          console.error('Error al actualizar la bebida:', error);
        }
      })
    );
  }

  private eliminarDependenciasDeBebida(codBebida: number, proveedor: number): Observable<void> {
    const url = `${this.apiUrl}/${codBebida}/proveedores/${proveedor}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Dependencias de la bebida con código ${codBebida} eliminadas.`);
        },
        error: (error) => {
          console.error(`Error al eliminar dependencias de la bebida con código ${codBebida}:`, error);
        }
      })
    );
  }

  public eliminarBebidaConDependencias(codBebida: number, proveedor: number): Observable<void> {
    return this.eliminarDependenciasDeBebida(codBebida, proveedor).pipe(
      tap({
        next: () => {
          this.eliminarBebida(codBebida).subscribe({
            next: () => {
              console.log('Bebida eliminada exitosamente con dependencias');
            },
            error: (error) => {
              console.error('Error al eliminar la bebida:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error al eliminar dependencias de la bebida:', error);
        }
      })
    );
  }

  public eliminarBebida(codBebida: number): Observable<void> {
    const url = `${this.apiUrl}/${codBebida}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Bebida con código ${codBebida} eliminada exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar la bebida con código ${codBebida}:`, error);
        }
      })
    );
  }
}
