import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Plato } from '../models/mesa.models.js';
import { ResponsePlato } from '../models/mesa.models.js';
import { Plato1 } from '../models/mesa.models.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {
  private readonly apiUrl = `${environment.apiUrl}/platos`;

  constructor(private http: HttpClient) {}

  public crearPlato(plato: Plato1): Observable<Plato1> {
    return this.http.post<Plato1>(this.apiUrl, {
      descripcion: plato.descripcion,
      tiempo: plato.tiempo,
      precio: plato.precio,
      aptoCeliaco: plato.aptoCeliaco,
      aptoVegetarianos: plato.aptoVegetarianos,
      aptoVeganos: plato.aptoVeganos,
      imagen: plato.imagen,
      tipoPlato: plato.tipoPlato,
      ingredientes: plato.ingredientes
    },
  {withCredentials: true}).pipe(
      tap(response => console.log('Plato creado:', response))
    );
  }

  public getPlatos(): Observable<ResponsePlato> {
    return this.http.get<ResponsePlato>(this.apiUrl).pipe(
      tap(response => console.log('Platos obtenidos:', response))
    );
  }

  public obtenerPlato(numPlato: number): Observable<Plato1> {
    return this.http.get<Plato1>(`${this.apiUrl}/${numPlato}`).pipe(
      tap(response => console.log('Plato obtenido:', response))
    );
  }

public actualizarPlato(numPlato: number, platoActualizado: Partial<Plato1>): Observable<Plato1> {
  return this.http.patch<Plato1>(`${this.apiUrl}/${numPlato}`, platoActualizado, {withCredentials: true}).pipe(
    tap(response => console.log('Plato actualizado:', response))
  );
}

  private eliminarDependenciasDePlato(numPlato: number, tipoPlato: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numPlato}/tipo/${tipoPlato}`, {withCredentials: true}).pipe(
      tap(() => console.log(`Dependencias del plato ${numPlato} eliminadas.`))
    );
  }

  public eliminarPlatoConDependencias(numPlato: number, tipoPlato: number): Observable<void> {
    return this.eliminarDependenciasDePlato(numPlato, tipoPlato).pipe(
      switchMap(() => this.eliminarPlato(numPlato)),
      tap(() => console.log(`Plato ${numPlato} eliminado exitosamente con dependencias`))
    );
  }

  public eliminarPlato(numPlato: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numPlato}`, {withCredentials: true}).pipe(
      tap(() => console.log(`Plato ${numPlato} eliminado.`))
    );
  }
}

