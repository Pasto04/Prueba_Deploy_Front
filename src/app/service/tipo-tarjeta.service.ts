import { Injectable } from '@angular/core';
import { NuevoTipotarjeta } from '../models/mesa.models.js';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Tipotarjeta } from '../models/mesa.models.js';
import { ResponseTipotarjeta } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoTarjetaService {
  private readonly apiUrl = `${environment.apiUrl}/tarjetas`;

  constructor(private http: HttpClient) { }

    public crearTipoTarjeta(tipotarjeta: NuevoTipotarjeta ): Observable<NuevoTipotarjeta > {
    const url = this.apiUrl;
    return this.http.post<NuevoTipotarjeta >(url, {
      descTarjeta: tipotarjeta.descTarjeta
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Tipo de tarjeta creado:', response);
        },
        error: (error) => {
          console.error('Error al crear el tipo de tarjeta:', error);
        }
      })
    );
  }

    public getTipoTarjetas(): Observable<ResponseTipotarjeta> {
      return this.http.get<ResponseTipotarjeta>(this.apiUrl, {withCredentials: true}).pipe(
        tap({
          next: (response) => {
            console.log('Tipos de tarjetas obtenidos:', response);
          },
          error: (error) => {
            console.error('Error al obtener tipos de tarjetas:', error);
          }
        })
      );
    }

  public obtenerTipoTarjeta(idTarjeta: number): Observable<Tipotarjeta> {
    const url = `${this.apiUrl}/${idTarjeta}`;
    return this.http.get<Tipotarjeta>(url, {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Tipo de tarjeta obtenido:', response);
        },
        error: (error) => {
          console.error('Error al obtener el tipo de tarjeta:', error);
        }
      })
    );
  }

  public actualizarTipoTarjeta(idTarjeta: number, tipotarjetaActualizado: Partial<Tipotarjeta>): Observable<Tipotarjeta> {
      const url = `${this.apiUrl}/${idTarjeta}`;
      return this.http.patch<Tipotarjeta>(url, {
        ...tipotarjetaActualizado,
        idTarjeta: tipotarjetaActualizado.idTarjeta,
        descTarjeta: tipotarjetaActualizado.descTarjeta
      },
    {withCredentials: true}).pipe(
        tap({
          next: (response) => {
            console.log('Tipo de tarjeta actualizado:', response);
          },
          error: (error) => {
            console.error('Error al actualizar el tipo de tarjeta:', error);
          }
        })
      );
    }

    public eliminarTipoTarjeta(idTarjeta: number): Observable<void> {
    const url = `${this.apiUrl}/${idTarjeta}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Tipo de tarjeta con ID ${idTarjeta} eliminado exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar el tipo de tarjeta con ID ${idTarjeta}:`, error);
        }
      })
    );
  }
}
