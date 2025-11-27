import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mesa } from '../models/mesa.models.js';
import { Observable, tap } from 'rxjs';
import { ResponseMesas } from '../models/mesa.models.js';
import { ResponseMesa } from '../models/mesa.models.js';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private readonly apiUrl = `${environment.apiUrl}/mesas`;

  constructor(private http: HttpClient) {}

  public crearMesa(mesa: Mesa): Observable<Mesa> {
    const url = this.apiUrl;
    return this.http.post<Mesa>(url, {
      estado: mesa.estado,
      cantPersonasMax: mesa.cant_personas_max,
      nro_mesa: mesa.nro_mesa
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Mesa creada:', response);
        },
        error: (error) => {
          console.error('Error al crear la mesa:', error);
        }
      })
    );
  }

  public getMesas(): Observable<ResponseMesas> {
    return this.http.get<ResponseMesas>(this.apiUrl, {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Mesas obtenidas:', response);
        },
        error: (error) => {
          console.error('Error al obtener mesas:', error);
        }
      })
    );
  }

  public obtenerMesa(mesaId: number): Observable<Mesa> {
    const url = `${this.apiUrl}/${mesaId}`;
    return this.http.get<Mesa>(url, {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Mesa obtenida:', response);
        },
        error: (error) => {
          console.error('Error al obtener la mesa:', error);
        }
      })
    );
  }

  public actualizarMesa(mesaId: number, mesaActualizada: Partial<Mesa>): Observable<Mesa> {
    const url = `${this.apiUrl}/${mesaId}`;
    return this.http.patch<Mesa>(url, {
      ...mesaActualizada,
      cantPersonasMax: mesaActualizada.cant_personas_max,
      nro_mesa: mesaActualizada.nro_mesa
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Mesa actualizada:', response);
        },
        error: (error) => {
          console.error('Error al actualizar la mesa:', error);
        }
      })
    );
  }

  public actualizarEstadoMesa(mesaId: number, nuevoEstado: string): Observable<any> {
    const url = `${this.apiUrl}/${mesaId}`;
    const body = { estado: nuevoEstado };
    return this.http.patch(url, body, {withCredentials: true});
  }

  public eliminarMesa(mesaId: number): Observable<void> {
    const url = `${this.apiUrl}/${mesaId}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Mesa con ID ${mesaId} eliminada exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar la mesa con ID ${mesaId}:`, error);
        }
      })
    );
  }

public verificarMesaDisponible(mesaId: number): Observable<boolean> {
  const url = `${this.apiUrl}/${mesaId}`;
  return this.http.get<ResponseMesa>(url, {withCredentials: true}).pipe(
    map(response => {
      console.log('Respuesta del servidor:', response);
      const mesa = response?.data;
      console.log('Mesa encontrada:', mesa);
      return mesa ? mesa.estado === 'Disponible' : false;
    }),
    catchError((error) => {
      console.error('Error al verificar la mesa:', error);
      return of(false);
    })
  );
}
}

