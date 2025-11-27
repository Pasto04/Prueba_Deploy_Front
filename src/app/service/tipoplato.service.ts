import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tipoplato } from '../models/mesa.models.js';
import { Observable, tap } from 'rxjs';
import { ResponseTipoplato } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoplatoService {
  private readonly apiUrl = `${environment.apiUrl}/platos/tipos`;

  constructor(private http: HttpClient) {}

  public crearTipoPlato(tipoPlato: Tipoplato): Observable<Tipoplato> {
    const url = this.apiUrl;
    return this.http.post<Tipoplato>(url, {
      numPlato: tipoPlato.numPlato,
      descTPlato: tipoPlato.descTPlato
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Tipo de plato creado:', response);
        },
        error: (error) => {
          console.error('Error al crear el tipo de plato:', error);
        }
      })
    );
  }

  public getTipoPlatos(): Observable<ResponseTipoplato> {
    return this.http.get<ResponseTipoplato>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          console.log('Tipos de platos obtenidos:', response);
        },
        error: (error) => {
          console.error('Error al obtener tipos de platos:', error);
        }
      })
    );
  }

  public obtenerTipoPlato(numPlato: number): Observable<Tipoplato> {
    const url = `${this.apiUrl}/${numPlato}`;
    return this.http.get<Tipoplato>(url).pipe(
      tap({
        next: (response) => {
          console.log('Tipo de plato obtenido:', response);
        },
        error: (error) => {
          console.error('Error al obtener el tipo de plato:', error);
        }
      })
    );
  }

  public actualizarTipoPlato(numPlato: number, tipoPlatoActualizado: Partial<Tipoplato>): Observable<Tipoplato> {
    const url = `${this.apiUrl}/${numPlato}`;
    return this.http.patch<Tipoplato>(url, {
      ...tipoPlatoActualizado,
      numPlato: tipoPlatoActualizado.numPlato,
      descTPlato: tipoPlatoActualizado.descTPlato
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Tipo de plato actualizado:', response);
        },
        error: (error) => {
          console.error('Error al actualizar el tipo de plato:', error);
        }
      })
    );
  }

  public eliminarTipoPlato(numPlato: number): Observable<void> {
    const url = `${this.apiUrl}/${numPlato}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Tipo de plato con ID ${numPlato} eliminado exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar el tipo de plato con ID ${numPlato}:`, error);
        }
      })
    );
  }
}
