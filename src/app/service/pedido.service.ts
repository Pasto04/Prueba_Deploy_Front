import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlatoConCantidad, BebidaConCantidad, PlatoPedido, BebidaPedido, PlatoPedidosEst, BebidaPedidoEst, PedidosLis} from '../models/mesa.models';
import { Observable, of, throwError, forkJoin, catchError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';
import { TarjetaService } from './tarjeta.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private platosPedido: PlatoConCantidad[] = [];
  private bebidasPedido: BebidaConCantidad[] = [];
  private pedidoEnCurso: boolean = false;
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private tarjetaService: TarjetaService
  ) {}

  agregarPlatoAlPedido(plato: PlatoConCantidad): void {
    const platoExistente = this.platosPedido.find(p => p.numPlato === plato.numPlato);
    if (platoExistente) {
      platoExistente.cantidad += 1;
    } else {
      this.platosPedido.push({ ...plato, cantidad: 1 });
    }
  }

  agregarBebidaAlPedido(bebida: BebidaConCantidad): void {
    const bebidaExistente = this.bebidasPedido.find(b => b.codBebida === bebida.codBebida);
    if (bebidaExistente) {
      bebidaExistente.cantidad += 1;
    } else {
      this.bebidasPedido.push({ ...bebida, cantidad: 1 });
    }
  }

  obtenerPedido(): { platos: PlatoConCantidad[], bebidas: BebidaConCantidad[] } {
    return { platos: this.platosPedido, bebidas: this.bebidasPedido };
  }

  obtenerPedidoEnCurso(): Observable<number | null> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    const url = `${this.apiUrl}/${clienteId}/pedidos`;
    return this.http.get<any>(url, {withCredentials: true}).pipe(
      map(response => {
        const pedidos = response.data;
        if (Array.isArray(pedidos)) {
          const pedidoEnCurso = pedidos.find(pedido => pedido.estado === 'en curso');
          return pedidoEnCurso ? pedidoEnCurso.nroPed : null;
        }
        console.error('La propiedad "data" no es un arreglo:', pedidos);
        return null;
      })
    );
  }

  crearPedido(pedidoData: any): Observable<any> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    const url = `${this.apiUrl}/${clienteId}/pedidos`;
    return this.http.post(url, pedidoData, {withCredentials: true});
  }

  confirmarPedido(pedidoData: any, nroPed: number): Observable<any> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    const url = `${this.apiUrl}/${clienteId}/pedidos/${nroPed}`;
    return this.http.patch(url, pedidoData, {withCredentials: true});
  }

  actualizarPedidoEnCurso(nroPed: number, platos: PlatoPedido[], bebidas: BebidaPedido[]): Observable<any> {
    const bebidasData = bebidas.map(bebida => ({
      bebida: bebida.codBebida,
      cantidad: bebida.cantidad || 1,
    }));
    const platosData = platos.map(plato => ({
      plato: plato.numPlato,
      cantidad: plato.cantidad || 1,
    }));

    const requests: Observable<any>[] = [];
    bebidasData.forEach(bebida => {
      requests.push(this.http.post(`${environment.apiUrl}/pedidos/${nroPed}/bebidas`, bebida));
    });
    platosData.forEach(plato => {
      requests.push(this.http.post(`${environment.apiUrl}/pedidos/${nroPed}/platos`, plato));
    });
    return requests.length > 0 ? forkJoin(requests) : of(null);
  }

  obtenerPlatosBebidasPorPedido(pedidoId: number): Observable<{ platos: PlatoConCantidad[], bebidas: BebidaConCantidad[] }> {
    const obtenerPlatos = this.http.get<{ data: PlatoPedidosEst[] }>(`${environment.apiUrl}/pedidos/${pedidoId}/platos`, {withCredentials: true});
    const obtenerBebidas = this.http.get<{ data: BebidaPedidoEst[] }>(`${environment.apiUrl}/pedidos/${pedidoId}/bebidas`, {withCredentials: true});

    return forkJoin([obtenerPlatos, obtenerBebidas]).pipe(
      map(([ResponsePlatoEst, ResponseBebidaEst]) => {
        const platosAdaptados: PlatoConCantidad[] = ResponsePlatoEst.data.map(plato => ({
          numPlato: plato.plato.numPlato,
          descripcion: plato.plato.descripcion,
          tiempo: plato.plato.tiempo,
          precio: plato.plato.precio,
          cantidad: plato.cantidad,
          aptoCeliaco: plato.plato.aptoCeliaco,
          aptoVegetarianos: plato.plato.aptoVegetarianos,
          aptoVeganos: plato.plato.aptoVeganos,
          imagen: plato.plato.imagen,
        }));

        const bebidasAdaptadas: BebidaConCantidad[] = ResponseBebidaEst.data.map(bebida => ({
        codBebida: bebida.bebida.codBebida,
        descripcion: bebida.bebida.descripcion,
        stock: bebida.bebida.stock,
        unidadMedida: bebida.bebida.unidadMedida,
        contenido: bebida.bebida.contenido,
        precio: bebida.bebida.precio,
        alcohol: bebida.bebida.alcohol,
        imagen: bebida.bebida.imagen,
        proveedor: bebida.bebida.proveedor,
        cantidad: bebida.cantidad || 1,
        }));

        return { platos: platosAdaptados, bebidas: bebidasAdaptadas };
      })
    );
  }

marcarPlatoComoRecibido(nroPed: number, numPlato: number): Observable<any> {
  return this.http.get<{ data: PlatoPedidosEst[] }>(`${environment.apiUrl}/pedidos/${nroPed}/platos`, {withCredentials: true}).pipe(
    switchMap(ResponsePlatoEst => {
      const plato = ResponsePlatoEst.data.find(p => p.plato.numPlato === numPlato);
      if (plato) {
        const url = `${environment.apiUrl}/pedidos/${nroPed}/platos/${numPlato}/fecha/${plato.fechaSolicitud}/hora/${plato.horaSolicitud}`;
        const platoData = { cantidad: plato.cantidad, recibido: true };
        return this.http.put(url, platoData, {withCredentials: true});
      } else {
        return of(null);
      }
    })
  );
}

marcarBebidaComoRecibida(nroPed: number, codBebida: number): Observable<any> {
  return this.http.get<{ data: BebidaPedidoEst[] }>(`${environment.apiUrl}/pedidos/${nroPed}/bebidas`, {withCredentials: true}).pipe(
    switchMap(ResponseBebidaEst => {
      const bebida = ResponseBebidaEst.data.find(b => b.bebida.codBebida === codBebida);
      if (bebida) {
        const fechaSolicitud = bebida.fechaSolicitud;
        const horaSolicitud = bebida.horaSolicitud;

        return this.http.put(
          `${environment.apiUrl}/pedidos/${nroPed}/bebidas/${codBebida}/fecha/${fechaSolicitud}/hora/${horaSolicitud}`,
          {}
        );
      } else {
        return of(null);
      }
    })
  );
}

  finalizarPedido(nroPed: number,platos: PlatoPedido[],bebidas: BebidaPedido[],totalImporte: number,tarjetaSeleccionada: any): Observable<any> {
  console.log('Tarjeta seleccionada:', tarjetaSeleccionada);

  const clientePedidoUrl = `${this.apiUrl}/pedidos/${nroPed}`;

  return this.http.get(`${this.apiUrl}/pedidos/${nroPed}`, {withCredentials: true}).pipe(
    switchMap((pedidoActualizado: any) => {
      if (!pedidoActualizado.pago) {
        if (!tarjetaSeleccionada?.idTarjeta) {
          return throwError(() => new Error('Debe seleccionar una tarjeta para finalizar el pedido.'));
        }

        const nuevoPago = { tarjetaCliente: tarjetaSeleccionada.idTarjeta };
        const postUrl = `${environment.apiUrl}/pedidos/${nroPed}/pagos`;

        return this.http.post(postUrl, nuevoPago, {withCredentials: true}).pipe(
          switchMap(pagoCreado => {
            const actualizarPedido = { ...pedidoActualizado, pago: true, platos, bebidas, totalImporte };
            return this.http.put(clientePedidoUrl, actualizarPedido, {withCredentials: true}).pipe(
              map(() => pagoCreado)
            );
          })
        );
      } else {
        return this.http.put(clientePedidoUrl, pedidoActualizado, {withCredentials: true}).pipe(
          map(() => pedidoActualizado)
        );
      }
    })
  );
}

  actualizarCantidadPlato(numPlato: number, nuevaCantidad: number): void {
    const plato = this.platosPedido.find(p => p.numPlato === numPlato);
    if (plato) {
      plato.cantidad = nuevaCantidad;
      if (plato.cantidad === 0) {
        this.platosPedido = this.platosPedido.filter(p => p.numPlato !== numPlato);
      }
    }
  }

  actualizarCantidadBebida(codBebida: number, nuevaCantidad: number): void {
    const bebida = this.bebidasPedido.find(b => b.codBebida === codBebida);
    if (bebida) {
      bebida.cantidad = nuevaCantidad;
      if (bebida.cantidad === 0) {
        this.bebidasPedido = this.bebidasPedido.filter(b => b.codBebida !== codBebida);
      }
    }
  }

eliminarPlatoDelPedido(nroPed: number, numPlato: number): Observable<any> {
  return this.http.get<{ data: PlatoPedidosEst[] }>(`${environment.apiUrl}/pedidos/${nroPed}/platos`, {withCredentials: true}).pipe(
    switchMap(ResponsePlatoEst => {
      const plato = ResponsePlatoEst.data.find(p => p.plato.numPlato === numPlato);
      if (plato) {
        const fecha = plato.fechaSolicitud;
        const hora = plato.horaSolicitud;
        const url = `${environment.apiUrl}/pedidos/${nroPed}/platos/${numPlato}/fecha/${fecha}/hora/${hora}`;
        return this.http.delete(url).pipe(
          catchError(error => {
            console.error('Error al eliminar el plato', error);
            return throwError(() => new Error('Error al eliminar el plato del pedido.'));
          })
        );
      } else {
        return of(null);
      }
    })
  );
  }



eliminarBebidaDelPedido(nroPed: number, codBebida: number): Observable<any> {
  return this.http.get<{ data: BebidaPedidoEst[] }>(`${environment.apiUrl}/pedidos/${nroPed}/bebidas`).pipe(
    switchMap(ResponseBebidaEst => {
      const bebida = ResponseBebidaEst.data.find(b => b.bebida.codBebida === codBebida);
      if (bebida) {
        const fecha = bebida.fechaSolicitud;
        const hora = bebida.horaSolicitud;
        const url = `${environment.apiUrl}/pedidos/${nroPed}/bebidas/${codBebida}/fecha/${fecha}/hora/${hora}`;
        return this.http.delete(url).pipe(
          catchError(error => {
            console.error('Error al eliminar la bebida', error);
            return throwError(() => new Error('Error al eliminar la bebida del pedido.'));
          })
        );
      } else {
        return of(null);
      }
    })
  );
}

  cancelarPedido(pedidoId: number): Observable<any> {
    const url = `${this.apiUrl}/pedidos/${pedidoId}/cancelar`;
    const body = { estado: 'cancelado' };
    return this.http.put(url, body);
  }

  obtenerPedidos(): Observable<PedidosLis[]> {
    const clienteId = this.usuarioService.obtenerUsuarioActual().id;
    const url = `${this.apiUrl}/${clienteId}/pedidos`;
    return this.http.get<{ data: PedidosLis[] }>(url).pipe(
      map(response => response.data),
      catchError(error => throwError(() => new Error('No se pudieron obtener los pedidos del cliente')))
    );
  }

  obtenerPlatosDelPedido(pedidoId: number): Observable<PlatoConCantidad[]> {
    return this.http.get<PlatoConCantidad[]>(`${environment.apiUrl}/pedidos/${pedidoId}/platos`);
  }
}
