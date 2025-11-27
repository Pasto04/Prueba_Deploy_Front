import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Ingrediente, ResponseIngredientes } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {

  private readonly apiUrl = `${environment.apiUrl}/ingredientes`;

  constructor(private http: HttpClient) { }

  public crearIngrediente(ingrediente: Ingrediente): Observable<Ingrediente> {
    const url = this.apiUrl;
    return this.http.post<Ingrediente>(url, {
      descIngre: ingrediente.descIngre,
      puntoDePedido: ingrediente.puntoDePedido,
      stock: ingrediente.stock,
      unidadMedida: ingrediente.unidadMedida,
      aptoCeliacos: ingrediente.aptoCeliacos,
      aptoVegetarianos: ingrediente.aptoVegetarianos,
      aptoVeganos: ingrediente.aptoVeganos,
      proveedor: ingrediente.proveedor,
    },
  {withCredentials: true}).pipe(
      tap({
        next: (response) => {
          console.log('Ingrediente creado:', response);
        },
        error: (error) => {
          console.error('Error al crear el ingrediente:', error);
        }
      })
    );
  }

  getIngredientes(): Observable<ResponseIngredientes> {
  return this.http.get<ResponseIngredientes>(this.apiUrl, {withCredentials: true}).pipe(
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

  public obtenerIngrediente(codIngrediente: number): Observable<Ingrediente> {
    const url = `${this.apiUrl}/${codIngrediente}`;
    return this.http.get<Ingrediente>(url).pipe(
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

   public actualizarIngrediente(codIngrediente: number, ingredienteActualizado: Partial<Ingrediente>): Observable<Ingrediente> {
    const url = `${this.apiUrl}/${codIngrediente}`;
    return this.http.patch<Ingrediente>(url, {
      ...ingredienteActualizado,
      descIngre: ingredienteActualizado.descIngre,
      puntoDePedido: ingredienteActualizado.puntoDePedido,
      stock: ingredienteActualizado.stock,
      unidadMedida: ingredienteActualizado.unidadMedida,
      aptoCeliacos: ingredienteActualizado.aptoCeliacos,
      aptoVegetarianos: ingredienteActualizado.aptoVegetarianos,
      aptoVeganos: ingredienteActualizado.aptoVeganos,
      proveedor: ingredienteActualizado.proveedor
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

    public eliminarIngrediente(codIngrediente: number): Observable<void> {
    const url = `${this.apiUrl}/${codIngrediente}`;
    return this.http.delete<void>(url, {withCredentials: true}).pipe(
      tap({
        next: () => {
          console.log(`Ingrediente con codigo ${codIngrediente} eliminado exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al eliminar el ingrediente con codigo  ${codIngrediente}:`, error);
        }
      })
    );
  }
}
