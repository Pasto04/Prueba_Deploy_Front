import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,tap,catchError,throwError,map } from 'rxjs';
import { PlatoIngrediente } from '../models/mesa.models.js';
import { Ingrediente } from '../models/mesa.models.js';
import { Plato } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElaboracionplatoService {
  private apiUrl = `${environment.apiUrl}/platos`;

  constructor(private http: HttpClient) {}

  obtenerIngrediente(numPlato: number, ingrediente: string): Observable<any> {
    const url = `${this.apiUrl}/${numPlato}/ingredientes/${ingrediente}`;
    return this.http.get<any>(url);
  }

public actualizarIngrediente(numPlato: number, ingrediente: string, cantidadNecesaria: number): Observable<any> {
  const url = `${this.apiUrl}/${numPlato}/ingredientes/${ingrediente}`;
  return this.http.patch<any>(url, {
    cantidadNecesaria
  },
{withCredentials: true}).pipe(
    tap({
      next: (response) => {
        console.log('Ingrediente actualizado en el plato:', response);
      },
      error: (error) => {
        console.error('Error al actualizar ingrediente:', error);
      }
    })
  );
}

  agregarIngrediente(numPlato: number, ingrediente: number, cantidadNecesaria: number): Observable<any> {
    const url = `${this.apiUrl}/${numPlato}/ingredientes`;
    return this.http.post(url, { ingrediente, cantidadNecesaria }, {withCredentials: true});
  }

  public eliminarIngrediente(numPlato: number, ingrediente: string): Observable<void> {
  const url = `${this.apiUrl}/${numPlato}/ingredientes/${ingrediente}`;
  return this.http.delete<void>(url, {withCredentials: true}).pipe(
    tap({
      next: () => {
        console.log(`Ingrediente ${ingrediente} del plato ${numPlato} eliminado exitosamente.`);
      },
      error: (error) => {
        console.error(`Error al eliminar el ingrediente ${ingrediente} del plato ${numPlato}:`, error);
      }
    })
  );
}

getElaboraciones(numPlato: number): Observable<PlatoIngrediente[]> {
  const url = `${this.apiUrl}/${numPlato}/ingredientes`;
  return this.http.get<any>(url).pipe(
    map((response: any) => {
      if (response?.data) {
        return response.data.map((item: { ingrediente: Ingrediente; plato: Plato; cantidadNecesaria: number }) => ({
          ingrediente: item.ingrediente,
          plato: item.plato,
          cantidadNecesaria: item.cantidadNecesaria
        }));
      }
      return [];
    }),
    catchError(error => {
      console.error('Error obteniendo elaboraciones:', error);
      return throwError(() => new Error('Error al obtener los datos.'));
    })
  );
}
}


