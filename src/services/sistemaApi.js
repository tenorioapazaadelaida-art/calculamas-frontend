import { api } from 'boot/axios'

export const catalogoApi = {
  listarCategorias: () => api.get('/categorias'),
  crearCategoria: (datos) =>
    api.post(
      '/categorias',
      datos,
      datos instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined,
    ),
  actualizarCategoria: (id, datos) => api.put(`/categorias/${id}`, datos),
  cambiarEstadoCategoria: (id, activo) =>
    api.patch(`/categorias/${id}/estado`, { activo }),
  listarProductos: () => api.get('/productos'),
  crearProducto: (datos) =>
    api.post(
      '/productos',
      datos,
      datos instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined,
    ),
  actualizarProducto: (id, datos) => {
    if (datos instanceof FormData) datos.append('_method', 'PUT')
    return api.post(
      `/productos/${id}`,
      datos,
      datos instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined,
    )
  },
  desactivarProducto: (id) => api.delete(`/productos/${id}`),
}

export const operacionesApi = {
  listarNotificaciones: () => api.get('/notificaciones'),
  leerNotificacion: (id) => api.patch(`/notificaciones/${id}/leer`),
  leerTodasNotificaciones: () => api.patch('/notificaciones/leer-todas'),
  listarTiposUtilidad: () => api.get('/tipos-utilidad'),
  listarOpcionesUtilidad: () => api.get('/tipos-utilidad-opciones'),
  listarUtilidadEnCompras: () => api.get('/tipos-utilidad-compras'),
  crearTipoUtilidad: (datos) => api.post('/tipos-utilidad', datos),
  actualizarTipoUtilidad: (id, datos) =>
    api.put(`/tipos-utilidad/${id}`, datos),
  cambiarEstadoTipoUtilidad: (id, activo) =>
    api.patch(`/tipos-utilidad/${id}/estado`, { activo }),
  listarCompras: () => api.get('/compras'),
  obtenerCompra: (id) => api.get(`/compras/${id}`),
  crearCompra: (datos) => api.post('/compras', datos),
  actualizarCompra: (id, datos) => api.put(`/compras/${id}`, datos),
  anularCompra: (id) => api.delete(`/compras/${id}`),
  registrarDevolucionCompra: (id, datos) => api.post(`/compras/${id}/devoluciones`, datos),
  listarDevolucionesCompra: (id) => api.get(`/compras/${id}/devoluciones`),
  descargarComprobanteDevolucionCompra: (compraId, devolucionId) =>
    api.get(`/compras/${compraId}/devoluciones/${devolucionId}/comprobante-pdf`, { responseType: 'blob' }),
  descargarComprobanteCompra: (id) =>
    api.get(`/compras/${id}/comprobante-pdf`, { responseType: 'blob' }),
  listarVentas: () => api.get('/ventas'),
  obtenerVenta: (id) => api.get(`/ventas/${id}`),
  crearVenta: (datos) => api.post('/ventas', datos),
  actualizarVenta: (id, datos) => api.put(`/ventas/${id}`, datos),
  anularVenta: (id) => api.delete(`/ventas/${id}`),
  registrarDevolucionVenta: (id, datos) => api.post(`/ventas/${id}/devoluciones`, datos),
  descargarComprobanteDevolucion: (ventaId, devolucionId) =>
    api.get(`/ventas/${ventaId}/devoluciones/${devolucionId}/comprobante-pdf`, { responseType: 'blob' }),
  descargarComprobanteVenta: (id) =>
    api.get(`/ventas/${id}/comprobante-pdf`, { responseType: 'blob' }),
  listarInventario: () => api.get('/inventario'),
  obtenerKardexGeneral: () => api.get('/kardex'),
  descargarKardexPdf: () => api.get('/kardex/pdf', { responseType: 'blob' }),
  obtenerKardex: (productoId) => api.get(`/kardex/${productoId}`),
  listarCategoriasGastos: () => api.get('/categorias-gastos'),
  crearCategoriaGasto: (datos) => api.post('/categorias-gastos', datos),
  actualizarCategoriaGasto: (id, datos) =>
    api.put(`/categorias-gastos/${id}`, datos),
  cambiarEstadoCategoriaGasto: (id) => api.delete(`/categorias-gastos/${id}`),
  listarGastos: () => api.get('/gastos'),
  crearGasto: (datos) => api.post('/gastos', datos),
  obtenerGasto: (id) => api.get(`/gastos/${id}`),
  actualizarGasto: (id, datos) => api.put(`/gastos/${id}`, datos),
  anularGasto: (id) => api.delete(`/gastos/${id}`),
}

export const administracionApi = {
  listarAuditorias: () => api.get('/auditorias'),
  listarUsuarios: () => api.get('/usuarios'),
  crearUsuario: (datos) => api.post('/usuarios', datos),
  actualizarUsuario: (id, datos) => api.put(`/usuarios/${id}`, datos),
  desactivarUsuario: (id) => api.delete(`/usuarios/${id}`),
  listarRoles: () => api.get('/roles'),
  listarPermisos: () => api.get('/permisos'),
  asignarPermisos: (id, permisos) =>
    api.put(`/roles/${id}/permisos`, { permisos }),
  obtenerPermisosUsuario: (id) => api.get(`/usuarios/${id}/permisos`),
  actualizarPermisosUsuario: (id, permisos) =>
    api.put(`/usuarios/${id}/permisos`, { permisos }),
}

export const reportesApi = {
  dashboard: () => api.get('/dashboard'),
  utilidad: (params) => api.get('/reportes/utilidad', { params }),
  impuestos: (params) => api.get('/impuestos/resumen', { params }),
  impuestosPorProducto: (params) => api.get('/impuestos/productos', { params }),
  configuracionImpuestos: () => api.get('/impuestos/configuracion'),
  guardarConfiguracionImpuestos: (datos) =>
    api.put('/impuestos/configuracion', datos),
  cerrarPeriodoImpuestos: (datos) => api.post('/impuestos/cerrar', datos),
  iueEstimado: (gestion) => api.get('/impuestos/iue', { params: { gestion } }),
}
