<template>
  <q-page
    ><div class="page-shell">
      <div class="row justify-between items-center q-mb-lg">
        <div>
          <div class="page-title">Ventas</div>
          <div class="page-subtitle">
            Vende varios productos a un cliente y descuenta el inventario
            automáticamente.
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-if="esAdministrador"
            outline
            color="primary"
            icon="percent"
            label="Utilidad por producto"
            @click="abrirUtilidadesProducto"
          /><q-btn
            v-if="auth.can('ventas.crear')"
            color="primary"
            icon="add"
            label="Nueva venta"
            @click="abrirRegistro"
          />
        </div>
      </div>
      <q-card class="surface-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="filter_alt" color="primary" /> Filtrar ventas
          </div>
          <div class="row q-col-gutter-md">
            <q-input
              class="col-12 col-sm-6 col-md-3"
              v-model="filtroNumero"
              outlined
              dense
              clearable
              label="Número de venta"
              ><template #prepend><q-icon name="tag" /></template
            ></q-input>
            <q-input
              class="col-12 col-sm-6 col-md-3"
              v-model="filtroCliente"
              outlined
              dense
              clearable
              label="Cliente"
              ><template #prepend><q-icon name="person_search" /></template
            ></q-input>
            <q-input
              class="col-12 col-sm-6 col-md-3 filtro-fecha"
              :model-value="fechaFiltroVisible(filtroFecha)"
              outlined
              dense
              readonly
              label="Fecha"
              placeholder="DD/MM/AAAA"
            >
              <template #prepend
                ><q-icon name="event" color="primary"
              /></template>
              <template #append
                ><q-icon
                  v-if="filtroFecha"
                  name="close"
                  class="cursor-pointer q-mr-sm"
                  @click.stop="filtroFecha = ''"
                  ><q-tooltip>Limpiar fecha</q-tooltip></q-icon
                ><q-icon
                  name="calendar_month"
                  color="primary"
                  class="cursor-pointer"
                  ><q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ><q-date
                      v-model="filtroFecha"
                      mask="YYYY-MM-DD"
                      color="primary"
                      today-btn
                      ><div
                        class="row items-center justify-end q-gutter-sm q-pa-sm"
                      >
                        <q-btn
                          flat
                          label="Limpiar"
                          color="grey-7"
                          @click="filtroFecha = ''"
                          v-close-popup
                        /><q-btn
                          flat
                          label="Aceptar"
                          color="primary"
                          v-close-popup
                        /></div></q-date></q-popup-proxy></q-icon
              ></template>
            </q-input>
            <q-input
              class="col-12 col-sm-6 col-md-3"
              v-model="filtroProducto"
              outlined
              dense
              clearable
              label="Producto o código"
              ><template #prepend><q-icon name="inventory_2" /></template
            ></q-input>
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          class="tabla-ventas"
          flat
          :rows="ventasFiltradas"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="p"
            ><q-td :props="p"
              ><div class="acciones-venta">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="visibility"
                  @click="verVenta(p.row)"
                  ><q-tooltip>Ver venta</q-tooltip></q-btn
                ><q-btn
                  flat
                  round
                  color="primary"
                  icon="picture_as_pdf"
                  @click="descargarComprobante(p.row)"
                  ><q-tooltip>Descargar comprobante PDF</q-tooltip></q-btn
                ><q-btn
                  v-if="auth.can('ventas.devolver') && p.row.estado !== 'anulada' && p.row.estado !== 'devuelta_total'"
                  flat round color="orange-8" icon="assignment_return"
                  @click="abrirDevolucion(p.row)"
                  ><q-tooltip>Registrar devolución</q-tooltip></q-btn
                ><q-btn
                  v-if="auth.can('ventas.editar') && p.row.estado === 'confirmada' && !(p.row.devoluciones || []).length"
                  flat
                  round
                  color="secondary"
                  icon="edit"
                  @click="abrirEdicion(p.row)"
                  ><q-tooltip>Editar venta</q-tooltip></q-btn
                ><q-btn
                  v-if="auth.can('ventas.anular') && p.row.estado === 'confirmada' && !(p.row.devoluciones || []).length"
                  flat
                  round
                  color="negative"
                  icon="cancel"
                  @click="confirmarAnulacion(p.row)"
                  ><q-tooltip>Anular venta</q-tooltip></q-btn
                >
              </div></q-td
            ></template
          >
          <template #body-cell-estado="p"
            ><q-td :props="p"
              ><q-badge
                :color="colorEstado(p.row.estado)"
                >{{ estadoVisible(p.row.estado) }}</q-badge
              ></q-td
            ></template
          >
          <template #item="p"
            ><div class="q-pa-sm col-12">
              <q-card flat bordered class="venta-movil"
                ><q-card-section
                  ><div class="venta-movil__cabecera">
                    <div class="venta-movil__datos">
                      <div class="text-caption text-grey-7">
                        Venta Nº {{ p.row.id }} ·
                        {{ fechaVisible(p.row.fecha) }}
                      </div>
                      <div class="text-subtitle1 text-weight-bold">
                        {{ p.row.cliente_nombre || 'Consumidor final' }}
                      </div>
                    </div>
                    <q-badge
                      :color="colorEstado(p.row.estado)"
                      >{{ estadoVisible(p.row.estado) }}</q-badge
                    >
                  </div>
                  <div class="venta-movil__pie">
                    <div>
                      <strong class="text-primary"
                        >Bs {{ Number(p.row.total).toFixed(2) }}</strong
                      >
                      <div class="text-caption text-grey-7">
                        Pago: {{ formaPagoVisible(p.row.metodo_pago) }}
                      </div>
                    </div>
                    <div class="acciones-venta">
                      <q-btn
                        flat
                        round
                        color="primary"
                        icon="visibility"
                        @click="verVenta(p.row)"
                        ><q-tooltip>Ver</q-tooltip></q-btn
                      ><q-btn
                        flat
                        round
                        color="primary"
                        icon="picture_as_pdf"
                        @click="descargarComprobante(p.row)"
                        ><q-tooltip>Descargar comprobante</q-tooltip></q-btn
                      ><q-btn
                        v-if="auth.can('ventas.devolver') && p.row.estado !== 'anulada' && p.row.estado !== 'devuelta_total'"
                        flat round color="orange-8" icon="assignment_return"
                        @click="abrirDevolucion(p.row)"
                        ><q-tooltip>Devolver</q-tooltip></q-btn
                      ><q-btn
                        v-if="
                          auth.can('ventas.editar') &&
                          p.row.estado === 'confirmada' && !(p.row.devoluciones || []).length
                        "
                        flat
                        round
                        color="secondary"
                        icon="edit"
                        @click="abrirEdicion(p.row)"
                        ><q-tooltip>Editar</q-tooltip></q-btn
                      ><q-btn
                        v-if="
                          auth.can('ventas.anular') &&
                          p.row.estado === 'confirmada' && !(p.row.devoluciones || []).length
                        "
                        flat
                        round
                        color="negative"
                        icon="cancel"
                        @click="confirmarAnulacion(p.row)"
                        ><q-tooltip>Anular</q-tooltip></q-btn
                      >
                    </div>
                  </div></q-card-section
                ></q-card
              >
            </div></template
          >
          <template #no-data
            ><div class="full-width text-center q-pa-xl text-grey-6">
              <q-icon name="point_of_sale" size="45px" />
              <div class="q-mt-sm">Aún no registraste ventas</div>
            </div></template
          >
        </q-table></q-card
      >

      <q-dialog v-model="dialogo" persistent
        ><q-card class="venta-dialog">
          <q-card-section class="row items-center no-wrap venta-header"
            ><q-avatar
              color="primary"
              text-color="white"
              icon="point_of_sale" />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bold">
                {{ editandoId ? 'Editar venta' : 'Nueva venta' }}
              </div>
              <div class="text-caption text-grey-7">
                Completa los datos siguiendo el orden del formulario.
              </div>
            </div>
            <q-space /><q-btn
              flat
              round
              dense
              icon="close"
              @click="cerrarFormulario" /></q-card-section
          ><q-separator />
          <q-card-section class="row q-col-gutter-md venta-form">
            <div class="col-12 seccion-form">
              <q-badge color="primary" label="1" />
              <div>
                <strong>Datos de la venta</strong>
                <div class="text-caption text-grey-7">
                  Fecha y cliente de esta operación.
                </div>
              </div>
            </div>
            <q-input
              class="col-12 col-sm-4"
              v-model="form.fecha"
              type="date"
              outlined
              stack-label
              label="Fecha *"
            />
            <q-input
              class="col-12 col-sm-8"
              v-model="form.cliente_nombre"
              outlined
              label="Cliente (opcional)"
              @update:model-value="normalizarCliente"
            />

            <div class="col-12 seccion-form justify-between">
              <div class="row items-center q-gutter-sm">
                <q-badge color="primary" label="2" />
                <div>
                  <strong>Productos de la venta</strong>
                  <div class="text-caption text-grey-7">
                    Agrega lo que comprará el cliente.
                  </div>
                </div>
              </div>
              <q-btn
                flat
                color="primary"
                icon="add"
                label="Agregar producto"
                @click="agregarDetalle"
              />
            </div>
            <div
              v-for="(detalle, indice) in form.detalles"
              :key="detalle.clave"
              class="col-12"
            >
              <q-card flat bordered class="detalle-card"
                ><q-card-section class="row q-col-gutter-md">
                  <div class="col-12 row items-center justify-between">
                    <strong>Producto {{ indice + 1 }}</strong
                    ><q-btn
                      v-if="form.detalles.length > 1"
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete_outline"
                      @click="quitarDetalle(indice)"
                      ><q-tooltip>Quitar producto</q-tooltip></q-btn
                    >
                  </div>
                  <q-select
                    class="col-12"
                    v-model="detalle.producto_id"
                    :options="opcionesPara(detalle)"
                    option-value="id"
                    :option-label="
                      (p) =>
                        `ID ${p.id} · ${p.nombre} · Disponible: ${numero(p.stock_actual)}`
                    "
                    emit-value
                    map-options
                    outlined
                    :loading="cargandoProductos"
                    :disable="cargandoProductos"
                    label="Producto disponible"
                    hint="Solo aparecen productos con stock"
                    @update:model-value="() => productoCambiado(detalle)"
                  />
                  <q-input
                    :class="
                      esAdministrador ? 'col-12 col-sm-2' : 'col-12 col-sm-4'
                    "
                    v-model.number="detalle.cantidad"
                    type="number"
                    min="1"
                    :max="stockDisponibleDe(detalle)"
                    :rules="[
                      (valor) => Number(valor) > 0 || 'La cantidad debe ser mayor a cero',
                      (valor) =>
                        Number(valor) <= stockDisponibleDe(detalle) ||
                        `Stock insuficiente. Solo hay ${numero(stockDisponibleDe(detalle))} disponible(s)`,
                    ]"
                    outlined
                    label="Cantidad"
                    bottom-slots
                    @update:model-value="() => recalcularDetalle(detalle)"
                  />
                  <q-input
                    v-if="esAdministrador"
                    class="col-12 col-sm-2"
                    :model-value="costoDe(detalle).toFixed(2)"
                    readonly
                    prefix="Bs"
                    outlined
                    label="Precio de costo"
                  />
                  <q-input
                    v-if="esAdministrador"
                    class="col-12 col-sm-3"
                    :model-value="Number(detalle.utilidad).toFixed(2)"
                    readonly
                    suffix="%"
                    outlined
                    label="Utilidad del producto"
                  />
                  <q-input
                    :class="
                      esAdministrador ? 'col-12 col-sm-5' : 'col-12 col-sm-8'
                    "
                    :model-value="Number(detalle.precio_unitario).toFixed(2)"
                    readonly
                    prefix="Bs"
                    outlined
                    :label="
                      form.con_factura
                        ? 'Precio con factura'
                        : 'Precio de venta'
                    "
                  />
                  <q-banner
                    v-if="esAdministrador && detalle.producto_id"
                    dense
                    class="col-12 utilidad-origen rounded-borders"
                    ><template #avatar
                      ><q-icon name="info" color="primary" /></template
                    >{{ explicacionUtilidad(detalle) }}</q-banner
                  >
                  <div
                    v-if="form.con_factura && esAdministrador"
                    class="col-12"
                  >
                    <q-card flat class="calculo-producto">
                      <q-card-section>
                        <div class="text-weight-bold q-mb-sm">
                          <q-icon name="calculate" color="primary" /> Cálculo de
                          factura para
                          {{ productoDe(detalle)?.nombre }}
                        </div>
                        <div class="pasos-producto">
                          <div class="paso">
                            <span>1. Precio de costo</span
                            ><strong
                              >Bs {{ costoDe(detalle).toFixed(2) }}</strong
                            >
                          </div>
                          <div class="paso">
                            <span
                              >2. PV = costo × (1 +
                              {{
                                Number(detalle.utilidad || 0).toFixed(2)
                              }}%)</span
                            ><strong
                              >Bs
                              {{ precioVentaDe(detalle).toFixed(2) }}</strong
                            >
                          </div>
                          <div class="formula-producto">
                            <span
                              >Bs {{ precioVentaDe(detalle).toFixed(2) }}</span
                            ><span>÷</span><span>0,87</span
                            ><q-icon name="arrow_forward" /><strong
                              >Bs
                              {{ precioFacturaDe(detalle).toFixed(2) }}</strong
                            >
                          </div>
                          <div class="paso iva-producto">
                            <span>IVA incluido por unidad (13%)</span
                            ><strong
                              >Bs
                              {{ ivaUnitarioDe(detalle).toFixed(2) }}</strong
                            >
                          </div>
                          <div class="paso subtotal-producto">
                            <span
                              >{{ Number(detalle.cantidad || 0) }} × Bs
                              {{ precioFacturaDe(detalle).toFixed(2) }}</span
                            ><strong
                              >Subtotal: Bs
                              {{ subtotalDetalle(detalle).toFixed(2) }}</strong
                            >
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div
                    v-if="!form.con_factura || !esAdministrador"
                    class="col-12 subtotal-venta"
                  >
                    <span>Subtotal del producto</span>
                    <strong>Bs {{ subtotalDetalle(detalle).toFixed(2) }}</strong>
                  </div>
                </q-card-section></q-card
              >
            </div>

            <div class="col-12 seccion-form">
              <q-badge color="primary" label="3" />
              <div>
                <strong>Forma de pago</strong>
                <div class="text-caption text-grey-7">
                  Indica cómo pagó el cliente.
                </div>
              </div>
            </div>
            <div
              class="col-12 opciones-pago"
              role="radiogroup"
              aria-label="Forma de pago"
            >
              <button
                type="button"
                class="opcion-pago"
                :class="{ 'opcion-pago--activa': form.metodo_pago === 'efectivo' }"
                role="radio"
                :aria-checked="form.metodo_pago === 'efectivo'"
                @click="form.metodo_pago = 'efectivo'"
              >
                <span class="opcion-pago__icono">
                  <q-icon name="payments" size="30px" />
                </span>
                <span class="opcion-pago__texto">
                  <strong>Efectivo</strong>
                  <small>El cliente paga con dinero en efectivo.</small>
                </span>
                <q-icon
                  class="opcion-pago__seleccion"
                  :name="
                    form.metodo_pago === 'efectivo'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  size="24px"
                />
              </button>

              <button
                type="button"
                class="opcion-pago"
                :class="{ 'opcion-pago--activa': form.metodo_pago === 'qr' }"
                role="radio"
                :aria-checked="form.metodo_pago === 'qr'"
                @click="form.metodo_pago = 'qr'"
              >
                <span class="opcion-pago__icono">
                  <q-icon name="qr_code_2" size="30px" />
                </span>
                <span class="opcion-pago__texto">
                  <strong>Pago por QR</strong>
                  <small>El cliente paga mediante un código QR.</small>
                </span>
                <q-icon
                  class="opcion-pago__seleccion"
                  :name="
                    form.metodo_pago === 'qr'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  size="24px"
                />
              </button>
            </div>

            <div class="col-12 seccion-form">
              <q-badge color="primary" label="4" />
              <div>
                <strong>Factura e IVA</strong>
                <div class="text-caption text-grey-7">
                  Actívalo solamente si emitirás factura.
                </div>
              </div>
            </div>
            <q-toggle
              class="col-12"
              v-model="form.con_factura"
              :disable="!datosVentaCompletos"
              label="¿Se emitirá factura?"
              @update:model-value="recalcularTodos"
            />
            <q-input
              v-if="form.con_factura"
              class="col-12"
              v-model="form.numero_factura"
              outlined
              clearable
              maxlength="80"
              label="Número de factura *"
              hint="Escribe el número impreso o generado en la factura"
              ><template #prepend><q-icon name="receipt_long" /></template
            ></q-input>
            <div class="col-12 seccion-form">
              <q-badge color="primary" label="5" />
              <div><strong>Resumen de la venta</strong></div>
            </div>
            <q-card
              v-if="form.con_factura && esAdministrador"
              flat
              bordered
              class="col-12 iva-resumen"
              ><q-card-section>
                <div class="row items-center no-wrap q-gutter-sm q-mb-md">
                  <q-icon name="receipt_long" color="primary" size="26px" />
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      Cálculo automático de la factura
                    </div>
                    <div class="text-caption text-grey-7">
                      Se calcula sobre todos los productos de esta venta.
                    </div>
                  </div>
                </div>
                <div class="fila-calculo">
                  <span>Venta antes de aplicar factura (PV)</span
                  ><strong>Bs {{ totalPrecioVenta.toFixed(2) }}</strong>
                </div>
                <div class="formula-iva">
                  PV ÷ (1 − 13%) <q-icon name="arrow_forward" />
                  <strong>Bs {{ totalVenta.toFixed(2) }}</strong>
                </div>
                <div class="fila-calculo debito">
                  <span>Débito fiscal IVA de esta venta</span
                  ><strong>Bs {{ debitoFiscalEstimado.toFixed(2) }}</strong>
                </div>
                <q-separator class="q-my-md" />
                <div class="fila-calculo total">
                  <span>Total que pagará el cliente (incluye IVA)</span
                  ><strong>Bs {{ totalVenta.toFixed(2) }}</strong>
                </div>
              </q-card-section></q-card
            >
            <q-card
              v-if="!form.con_factura || !esAdministrador"
              flat
              bordered
              class="col-12 resumen-simple"
              ><q-card-section class="fila-calculo total"
                ><span>{{
                  form.con_factura
                    ? 'Total con factura'
                    : 'Total que pagará el cliente'
                }}</span
                ><strong>Bs {{ totalVenta.toFixed(2) }}</strong></q-card-section
              ></q-card
            >
          </q-card-section>
          <q-separator /><q-card-actions
            align="right"
            class="q-pa-md venta-footer"
            ><q-btn flat label="Cancelar" @click="cerrarFormulario" /><q-btn
              color="primary"
              icon="save"
              :label="editandoId ? 'Guardar cambios' : 'Confirmar venta'"
              :loading="guardando"
              :disable="!datosVentaCompletos"
              @click="guardar"
          /></q-card-actions> </q-card
      ></q-dialog>
      <q-dialog v-model="dialogoVer"
        ><q-card class="venta-detalle-dialog"
          ><q-card-section class="row items-center"
            ><q-avatar color="primary" text-color="white" icon="receipt_long" />
            <div class="q-ml-md">
              <div class="text-h6">Venta N.º {{ ventaSeleccionada?.id }}</div>
              <div class="text-caption">
                {{ fechaVisible(ventaSeleccionada?.fecha) }}
                <span v-if="ventaSeleccionada?.created_at">
                  · {{ horaRegistro(ventaSeleccionada.created_at) }}
                </span>
              </div>
              <div class="text-caption text-grey-7">
                Referencia: {{ ventaSeleccionada?.numero }}
              </div>
            </div>
            <q-space /><q-btn
              flat
              round
              icon="close"
              v-close-popup /></q-card-section
          ><q-separator /><q-card-section v-if="ventaSeleccionada"
            ><div class="q-mb-md">
              <span class="text-grey-7">Cliente: </span
              >{{ ventaSeleccionada.cliente_nombre || 'Consumidor final' }}
            </div>
            <div class="q-mb-md">
              <span class="text-grey-7">Forma de pago: </span>
              <q-chip
                dense
                color="blue-grey-1"
                text-color="primary"
                :icon="ventaSeleccionada.metodo_pago === 'qr' ? 'qr_code_2' : 'payments'"
              >
                {{ formaPagoVisible(ventaSeleccionada.metodo_pago) }}
              </q-chip>
            </div>
            <q-list bordered separator
              ><q-item v-for="d in ventaSeleccionada.detalles" :key="d.id"
                ><q-item-section
                  ><q-item-label>{{ d.producto?.nombre }}</q-item-label
                  ><q-item-label caption
                    >{{ Number(d.cantidad) }} × Bs
                    {{ Number(d.precio_unitario).toFixed(2) }}</q-item-label
                  ></q-item-section
                ><q-item-section side
                  >Bs {{ Number(d.subtotal).toFixed(2) }}</q-item-section
                ></q-item
              ></q-list
            >
            <div class="text-right q-mt-md">
              <div v-if="ventaSeleccionada.con_factura">
                Factura: {{ ventaSeleccionada.numero_factura }}
              </div>
              <div class="text-h6 text-primary">
                Total: Bs {{ Number(ventaSeleccionada.total).toFixed(2) }}
              </div>
            </div>
            <div v-if="ventaSeleccionada.devoluciones?.length" class="q-mt-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Historial de devoluciones</div>
              <q-list bordered separator>
                <q-item v-for="devolucion in ventaSeleccionada.devoluciones" :key="devolucion.id">
                  <q-item-section>
                    <q-item-label>{{ devolucion.numero }}</q-item-label>
                    <q-item-label caption>{{ fechaVisible(devolucion.fecha) }} · {{ devolucion.motivo }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div>Bs {{ Number(devolucion.total).toFixed(2) }}</div>
                    <q-btn flat round dense color="primary" icon="picture_as_pdf"
                      @click="descargarComprobanteDevolucion(ventaSeleccionada, devolucion)">
                      <q-tooltip>Descargar comprobante</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-if="ventaSeleccionada.devoluciones?.length" class="text-right q-mt-md text-weight-bold">
              Total neto: Bs {{ totalNetoVenta(ventaSeleccionada).toFixed(2) }}
            </div>
            </q-card-section
          ></q-card
        ></q-dialog
      >
      <q-dialog v-model="dialogoDevolucion" persistent>
        <q-card class="venta-detalle-dialog">
          <q-card-section class="row items-center">
            <q-avatar color="orange-8" text-color="white" icon="assignment_return" />
            <div class="q-ml-md">
              <div class="text-h6">Registrar devolución</div>
              <div class="text-caption">Venta {{ ventaDevolucion?.numero }}</div>
            </div>
            <q-space /><q-btn flat round icon="close" @click="dialogoDevolucion = false" />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input outlined type="date" v-model="devolucionForm.fecha" label="Fecha de la devolución *" />
            <q-list bordered separator>
              <q-item v-for="linea in devolucionForm.detalles" :key="linea.detalle_venta_id">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ linea.nombre }}</q-item-label>
                  <q-item-label caption>Disponible para devolver: {{ numero(linea.disponible) }}</q-item-label>
                  <div class="row q-col-gutter-sm q-mt-xs">
                    <q-input class="col-12 col-sm-5" outlined dense type="number" min="0" :max="linea.disponible"
                      v-model.number="linea.cantidad" label="Cantidad a devolver" />
                    <q-toggle class="col-12 col-sm-7" v-model="linea.reintegrar_stock"
                      label="Reintegrar al stock" :disable="!Number(linea.cantidad)" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <q-input class="q-mt-md" outlined v-model="devolucionForm.motivo" label="Motivo de la devolución *" maxlength="500" />
            <q-select class="q-mt-md" outlined emit-value map-options v-model="devolucionForm.metodo_reembolso"
              :options="opcionesPago" label="Medio del reembolso *" />
            <div v-if="ventaDevolucion?.con_factura" class="q-mt-md">
              <q-banner class="bg-amber-1 text-brown-9 rounded-borders q-mb-md">
                Esta venta tiene factura. Emite la Nota de Crédito–Débito en el SIAT y registra aquí su número.
              </q-banner>
              <q-input outlined v-model="devolucionForm.numero_nota_credito_debito"
                label="Número de Nota de Crédito–Débito *" maxlength="80" />
              <div class="text-caption text-grey-7 q-mt-xs">
                Factura original: {{ ventaDevolucion.numero_factura }} · Ajuste IVA estimado: Bs {{ (totalDevolucion * 0.13).toFixed(2) }}
              </div>
            </div>
            <q-banner class="bg-blue-grey-1 text-primary q-mt-md rounded-borders">
              Los productos marcados se reintegrarán al inventario y aparecerán como devolución en el Kardex.
            </q-banner>
            <div class="text-h6 text-primary text-right q-mt-md">Reembolso: Bs {{ totalDevolucion.toFixed(2) }}</div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps label="Cancelar" @click="dialogoDevolucion = false" />
            <q-btn unelevated no-caps color="primary" icon="save" label="Confirmar devolución"
              :loading="guardandoDevolucion" :disable="!devolucionValida" @click="guardarDevolucion" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="dialogoUtilidades">
        <q-card class="venta-dialog">
          <q-card-section class="row items-center">
            <div>
              <div class="text-h6 text-weight-bold">Utilidad por producto</div>
              <div class="text-caption text-grey-7">
                Registra o modifica el porcentaje de cada producto.
              </div>
            </div>
            <q-space /><q-btn
              flat
              round
              icon="close"
              v-close-popup
            /> </q-card-section
          ><q-separator />
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-12 col-sm-8"
              v-model.number="tipoForm.porcentaje_general"
              type="number"
              min="0"
              suffix="%"
              outlined
              label="Utilidad general *"
              hint="Se aplicará automáticamente a los productos sin porcentaje propio."
            />
            <q-toggle
              class="col-12 col-sm-4"
              v-model="tipoForm.activo"
              color="positive"
              :label="
                tipoForm.activo
                  ? 'Configuración activa'
                  : 'Configuración inactiva'
              "
            />
            <div
              class="col-12 text-caption"
              :class="tipoForm.activo ? 'text-positive' : 'text-negative'"
            >
              {{
                tipoForm.activo
                  ? 'Los porcentajes activos se aplicarán automáticamente en las ventas.'
                  : 'Esta configuración no se aplicará en las ventas.'
              }}
            </div>
            <q-banner class="col-12 utilidad-origen rounded-borders"
              ><template #avatar
                ><q-icon name="lightbulb" color="primary" /></template
              >Primero se busca la utilidad específica del producto. Si no
              existe, se utiliza la utilidad general de
              {{
                Number(tipoForm.porcentaje_general || 0).toFixed(2)
              }}%.</q-banner
            >
            <div class="col-12">
              <strong>Utilidades diferentes por producto</strong>
              <div class="text-caption text-grey-7">
                Opcional: agrega aquí solamente los productos que no usarán el
                porcentaje general.
              </div>
            </div>
            <q-card flat bordered class="col-12 utilidad-rapida"
              ><q-card-section class="row q-col-gutter-sm items-start">
                <q-select
                  class="col-12 col-sm-8"
                  v-model="productoUtilidad.producto_id"
                  :options="productosUtilidadFiltrados"
                  option-value="id"
                  :option-label="
                    (p) => `ID ${p.id} · ${p.nombre} · ${p.codigo}`
                  "
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  clearable
                  outlined
                  label="Buscar producto"
                  @filter="filtrarProductosUtilidad"
                  ><template #prepend><q-icon name="search" /></template
                  ><template #no-option
                    ><q-item
                      ><q-item-section class="text-grey-7"
                        >No se encontró el producto</q-item-section
                      ></q-item
                    ></template
                  ></q-select
                >
                <q-input
                  class="col-8 col-sm-2"
                  v-model.number="productoUtilidad.porcentaje"
                  type="number"
                  min="0"
                  suffix="%"
                  outlined
                  label="Utilidad"
                />
                <q-btn
                  class="col-4 col-sm-2"
                  color="primary"
                  icon="add"
                  label="Agregar"
                  :disable="!productoUtilidad.producto_id"
                  @click="agregarProductoUtilidad"
                /> </q-card-section
            ></q-card>
            <div v-if="tipoForm.productos.length" class="col-12">
              <q-list bordered separator class="lista-utilidades"
                ><q-item
                  v-for="(item, indice) in tipoForm.productos"
                  :key="item.clave"
                  ><q-item-section avatar
                    ><q-avatar color="primary" text-color="white">{{
                      item.producto_id
                    }}</q-avatar></q-item-section
                  ><q-item-section
                    ><q-item-label>{{
                      nombreProductoUtilidad(item.producto_id)
                    }}</q-item-label
                    ><q-item-label caption
                      >ID {{ item.producto_id }} ·
                      {{
                        codigoProductoUtilidad(item.producto_id)
                      }}</q-item-label
                    ></q-item-section
                  ><q-item-section side class="utilidad-edicion"
                    ><q-input
                      v-model.number="item.porcentaje"
                      type="number"
                      min="0"
                      suffix="%"
                      dense
                      outlined
                      label="Utilidad" /></q-item-section
                  ><q-item-section side class="utilidad-estado"
                    ><q-toggle
                      v-model="item.activo"
                      color="positive"
                      :label="item.activo ? 'Activo' : 'Inactivo'"
                    /></q-item-section
                  ><q-item-section side
                    ><q-btn
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      @click="quitarProductoUtilidad(indice)"
                      ><q-tooltip>Quitar</q-tooltip></q-btn
                    ></q-item-section
                  ></q-item
                ></q-list
              >
            </div>
            <q-banner
              v-else
              class="col-12 bg-grey-2 text-grey-8 rounded-borders"
              ><template #avatar
                ><q-icon name="info" color="primary" /></template
              >Aún no configuraste utilidad para ningún producto.</q-banner
            >
            <div class="col-12 row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" v-close-popup /><q-btn
                color="primary"
                icon="save"
                label="Guardar cambios"
                @click="guardarTipoUtilidad"
              />
            </div> </q-card-section
          ><q-separator />
        </q-card>
      </q-dialog></div
  ></q-page>
</template>

<script setup>
import { auth } from 'src/services/auth'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { catalogoApi, operacionesApi } from 'src/services/sistemaApi'
import { fechaHoyBolivia, ZONA_HORARIA_BOLIVIA } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const ventas = ref([]),
  productos = ref([]),
  tiposUtilidad = ref([]),
  dialogoUtilidades = ref(false),
  filtroNumero = ref(''),
  filtroCliente = ref(''),
  filtroFecha = ref(''),
  filtroProducto = ref(''),
  cargando = ref(false),
  cargandoProductos = ref(false),
  guardando = ref(false),
  dialogo = ref(false),
  dialogoVer = ref(false),
  dialogoDevolucion = ref(false),
  guardandoDevolucion = ref(false),
  ventaDevolucion = ref(null),
  ventaSeleccionada = ref(null),
  editandoId = ref(null)
const tipoEditandoId = ref(null)
let siguienteProductoUtilidad = 1
const tipoForm = reactive({
  nombre: '',
  porcentaje_general: 0,
  predeterminada: false,
  activo: true,
  productos: [],
})
const productoUtilidad = reactive({ producto_id: null, porcentaje: 0 })
const productosUtilidadFiltrados = ref([])
const esAdministrador = computed(() =>
  auth.usuario?.roles?.some((rol) => rol.identificador === 'administrador'),
)
const numero = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', {
    maximumFractionDigits: 4,
  })
let siguienteClave = 1
const nuevoDetalle = () => ({
  clave: siguienteClave++,
  producto_id: null,
  tipo_utilidad_id: null,
  cantidad: 1,
  utilidad: 0,
  precio_unitario: 0,
})
const form = reactive({
  fecha: fechaHoyBolivia(),
  cliente_nombre: '',
  metodo_pago: 'efectivo',
  con_factura: false,
  numero_factura: '',
  detalles: [nuevoDetalle()],
})
const devolucionForm = reactive({ fecha: fechaHoyBolivia(), motivo: '', metodo_reembolso: 'efectivo', numero_nota_credito_debito: '', detalles: [] })
const opcionesPago = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Crédito', value: 'credito' },
]
const totalDevolucion = computed(() => devolucionForm.detalles.reduce(
  (total, linea) => total + Number(linea.cantidad || 0) * Number(linea.precio_unitario || 0), 0,
))
const devolucionValida = computed(() => Boolean(devolucionForm.motivo.trim()) &&
  Boolean(devolucionForm.fecha) &&
  (!ventaDevolucion.value?.con_factura || Boolean(devolucionForm.numero_nota_credito_debito.trim())) &&
  devolucionForm.detalles.some((linea) => Number(linea.cantidad) > 0) &&
  devolucionForm.detalles.every((linea) => Number(linea.cantidad || 0) <= Number(linea.disponible)))
const productosDisponibles = computed(() => {
  const seleccionados = new Set(form.detalles.map((d) => d.producto_id))
  return productos.value.filter(
    (p) => p.activo && (Number(p.stock_actual) > 0 || seleccionados.has(p.id)),
  )
})
const tiposActivos = computed(() => tiposUtilidad.value.filter((t) => t.activo))
const totalVenta = computed(() =>
  form.detalles.reduce((suma, d) => suma + subtotalDetalle(d), 0),
)
const totalPrecioVenta = computed(() =>
  form.detalles.reduce(
    (suma, d) => suma + precioVentaDe(d) * Number(d.cantidad || 0),
    0,
  ),
)
const debitoFiscalEstimado = computed(() =>
  form.con_factura ? Math.round(totalVenta.value * 13) / 100 : 0,
)
const datosVentaCompletos = computed(
  () =>
    Boolean(form.fecha) &&
    form.detalles.length > 0 &&
    form.detalles.every(
      (d) =>
        productoDe(d) &&
        Number(d.cantidad) > 0 &&
        Number(d.cantidad) <= stockDisponibleDe(d) &&
        Number(d.precio_unitario) > 0,
    ) &&
    new Set(form.detalles.map((d) => d.producto_id)).size ===
      form.detalles.length,
)
const ventasFiltradas = computed(() => {
  const numero = filtroNumero.value.trim().toLocaleLowerCase('es')
  const cliente = filtroCliente.value.trim().toLocaleLowerCase('es')
  const producto = filtroProducto.value.trim().toLocaleLowerCase('es')
  return ventas.value.filter((venta) => {
    const fechaVenta = String(venta.fecha || '').slice(0, 10)
    const coincideNumero =
      !numero ||
      [venta.id, venta.numero].some((valor) =>
        String(valor || '')
          .toLocaleLowerCase('es')
          .includes(numero),
      )
    const coincideCliente =
      !cliente ||
      String(venta.cliente_nombre || 'Consumidor final')
        .toLocaleLowerCase('es')
        .includes(cliente)
    const coincideFecha = !filtroFecha.value || fechaVenta === filtroFecha.value
    const coincideProducto =
      !producto ||
      (venta.detalles || []).some((detalle) =>
        [detalle.producto?.nombre, detalle.producto?.codigo]
          .filter(Boolean)
          .some((valor) =>
            String(valor).toLocaleLowerCase('es').includes(producto),
          ),
      )
    return (
      coincideNumero && coincideCliente && coincideFecha && coincideProducto
    )
  })
})

const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  { name: 'numero', label: 'Número', field: (r) => r.id, align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (r) => fechaVisible(r.fecha) },
  {
    name: 'cliente',
    label: 'Cliente',
    field: (r) => r.cliente_nombre || 'Consumidor final',
  },
  {
    name: 'total',
    label: 'Total',
    field: (r) => `Bs ${Number(r.total).toFixed(2)}`,
  },
  {
    name: 'metodo_pago',
    label: 'Forma de pago',
    field: (r) => formaPagoVisible(r.metodo_pago),
  },
  { name: 'estado', label: 'Estado', field: 'estado' },
]
const formaPagoVisible = (metodo) => (metodo === 'qr' ? 'QR' : 'Efectivo')
const fechaVisible = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(fecha))
    : ''
const horaRegistro = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: ZONA_HORARIA_BOLIVIA,
      }).format(new Date(fecha))
    : ''
const fechaFiltroVisible = (fecha) =>
  fecha ? fecha.split('-').reverse().join('/') : ''
function productoDe(detalle) {
  return productosDisponibles.value.find((p) => p.id === detalle.producto_id)
}
function stockDisponibleDe(detalle) {
  return (
    Number(productoDe(detalle)?.stock_actual || 0) +
    Number(detalle.cantidad_original || 0)
  )
}
function costoDe(detalle) {
  return Number(productoDe(detalle)?.costo_promedio || 0)
}
function precioVentaDe(detalle) {
  if (!esAdministrador.value)
    return Number(productoDe(detalle)?.precio_venta_calculado || 0)
  return (
    Math.round(
      costoDe(detalle) * (1 + Number(detalle.utilidad || 0) / 100) * 100,
    ) / 100
  )
}
function precioFacturaDe(detalle) {
  return Math.round((precioVentaDe(detalle) / (1 - 0.13)) * 100) / 100
}
function ivaUnitarioDe(detalle) {
  return (
    Math.round((precioFacturaDe(detalle) - precioVentaDe(detalle)) * 100) / 100
  )
}
function subtotalDetalle(detalle) {
  return Number(detalle.cantidad || 0) * Number(detalle.precio_unitario || 0)
}
function opcionesPara(detalle) {
  const usados = new Set(
    form.detalles.filter((d) => d !== detalle).map((d) => d.producto_id),
  )
  return productosDisponibles.value.filter((p) => !usados.has(p.id))
}
function productoCambiado(detalle) {
  const predeterminada =
    tiposActivos.value.find((t) => t.predeterminada) || tiposActivos.value[0]
  detalle.tipo_utilidad_id = esAdministrador.value
    ? predeterminada?.id || null
    : productoDe(detalle)?.tipo_utilidad_id || predeterminada?.id || null
  utilidadCambiada(detalle)
}
function utilidadCambiada(detalle) {
  const tipo = tiposActivos.value.find((t) => t.id === detalle.tipo_utilidad_id)
  const especifica = tipo?.productos?.find(
    (p) => p.id === detalle.producto_id && p.pivot?.activo !== false,
  )
  detalle.utilidad = Number(
    especifica?.pivot?.porcentaje ?? tipo?.porcentaje_general ?? 0,
  )
  recalcularDetalle(detalle)
}
function explicacionUtilidad(detalle) {
  const producto = productoDe(detalle)
  const tipo = tiposActivos.value.find((t) => t.id === detalle.tipo_utilidad_id)
  const especifica = tipo?.productos?.find(
    (p) => p.id === detalle.producto_id && p.pivot?.activo !== false,
  )
  return especifica
    ? `Producto ID ${producto?.id}: se aplicó su utilidad específica de ${Number(especifica.pivot.porcentaje).toFixed(2)}%.`
    : `Producto ID ${producto?.id}: no tiene utilidad específica; se aplicó la utilidad general de ${Number(tipo?.porcentaje_general || 0).toFixed(2)}%.`
}
function recalcularDetalle(detalle) {
  detalle.precio_unitario = form.con_factura
    ? precioFacturaDe(detalle)
    : precioVentaDe(detalle)
}
function recalcularTodos() {
  form.detalles.forEach(recalcularDetalle)
}
function agregarDetalle() {
  const detalle = nuevoDetalle()
  form.detalles.push(detalle)
  const predeterminada =
    tiposActivos.value.find((t) => t.predeterminada) || tiposActivos.value[0]
  detalle.tipo_utilidad_id = predeterminada?.id || null
  utilidadCambiada(detalle)
  if (!datosVentaCompletos.value) {
    form.con_factura = false
    recalcularTodos()
  }
}
function quitarDetalle(indice) {
  form.detalles.splice(indice, 1)
  recalcularTodos()
}
async function abrirRegistro() {
  await cargarCatalogoVenta()
  editandoId.value = null
  const detalle = nuevoDetalle()
  Object.assign(form, {
    fecha: fechaHoyBolivia(),
    cliente_nombre: '',
    metodo_pago: 'efectivo',
    con_factura: false,
    numero_factura: '',
    detalles: [detalle],
  })
  const predeterminada =
    tiposActivos.value.find((t) => t.predeterminada) || tiposActivos.value[0]
  detalle.tipo_utilidad_id = predeterminada?.id || null
  utilidadCambiada(detalle)
  dialogo.value = true
}
function cerrarFormulario() {
  dialogo.value = false
  editandoId.value = null
}
function verVenta(venta) {
  ventaSeleccionada.value = venta
  dialogoVer.value = true
}
function cantidadDevuelta(venta, detalleId) {
  return (venta.devoluciones || []).reduce((total, devolucion) => total +
    (devolucion.detalles || []).filter((linea) => linea.detalle_venta_id === detalleId)
      .reduce((suma, linea) => suma + Number(linea.cantidad), 0), 0)
}
function abrirDevolucion(venta) {
  ventaDevolucion.value = venta
  devolucionForm.motivo = ''
  devolucionForm.fecha = fechaHoyBolivia()
  devolucionForm.metodo_reembolso = venta.metodo_pago || 'efectivo'
  devolucionForm.numero_nota_credito_debito = ''
  devolucionForm.detalles = venta.detalles.map((detalle) => ({
    detalle_venta_id: detalle.id,
    nombre: detalle.producto?.nombre || 'Producto',
    precio_unitario: Number(detalle.precio_unitario),
    disponible: Math.max(0, Number(detalle.cantidad) - cantidadDevuelta(venta, detalle.id)),
    cantidad: 0,
    reintegrar_stock: true,
  })).filter((linea) => linea.disponible > 0)
  dialogoDevolucion.value = true
}
async function guardarDevolucion() {
  guardandoDevolucion.value = true
  try {
    await operacionesApi.registrarDevolucionVenta(ventaDevolucion.value.id, {
      motivo: devolucionForm.motivo,
      fecha: devolucionForm.fecha,
      metodo_reembolso: devolucionForm.metodo_reembolso,
      numero_nota_credito_debito: devolucionForm.numero_nota_credito_debito || null,
      detalles: devolucionForm.detalles.filter((linea) => Number(linea.cantidad) > 0).map((linea) => ({
        detalle_venta_id: linea.detalle_venta_id,
        cantidad: Number(linea.cantidad),
        reintegrar_stock: Boolean(linea.reintegrar_stock),
      })),
    })
    dialogoDevolucion.value = false
    await cargar()
    $q.notify({ type: 'positive', message: 'Devolución registrada correctamente' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message ||
      Object.values(e.response?.data?.errors || {})[0]?.[0] || 'No se pudo registrar la devolución' })
  } finally {
    guardandoDevolucion.value = false
  }
}
async function descargarComprobanteDevolucion(venta, devolucion) {
  try {
    const { data } = await operacionesApi.descargarComprobanteDevolucion(venta.id, devolucion.id)
    descargarArchivo(data, `comprobante-devolucion-${devolucion.numero}.pdf`)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'No se pudo descargar el comprobante.' })
  }
}
function totalNetoVenta(venta) {
  return Number(venta.total) - (venta.devoluciones || []).reduce((suma, devolucion) => suma + Number(devolucion.total), 0)
}
function estadoVisible(estado) {
  return ({ confirmada: 'Confirmada', anulada: 'Anulada', devuelta_parcial: 'Devuelta parcialmente', devuelta_total: 'Devuelta totalmente' })[estado] || estado
}
function colorEstado(estado) {
  return estado === 'anulada' ? 'negative' : estado.startsWith('devuelta') ? 'orange-8' : 'positive'
}
function abrirEdicion(venta) {
  editandoId.value = venta.id
  form.fecha = String(venta.fecha).slice(0, 10)
  form.cliente_nombre = venta.cliente_nombre || ''
  form.metodo_pago = venta.metodo_pago === 'qr' ? 'qr' : 'efectivo'
  form.con_factura = Boolean(venta.con_factura)
  form.numero_factura = venta.numero_factura || ''
  form.detalles = venta.detalles.map((d) => {
    const costo = Number(d.costo_unitario || 0),
      base = venta.con_factura
        ? Number(d.precio_unitario) * 0.87
        : Number(d.precio_unitario)
    return {
      clave: siguienteClave++,
      producto_id: d.producto_id,
      tipo_utilidad_id: d.tipo_utilidad_id,
      cantidad: Number(d.cantidad),
      cantidad_original: Number(d.cantidad),
      utilidad:
        d.porcentaje_utilidad == null
          ? costo > 0
            ? Math.max(0, Math.round((base / costo - 1) * 10000) / 100)
            : 0
          : Number(d.porcentaje_utilidad),
      precio_unitario: Number(d.precio_unitario),
    }
  })
  dialogo.value = true
}
async function descargarComprobante(venta) {
  try {
    const { data } = await operacionesApi.descargarComprobanteVenta(venta.id)
    descargarArchivo(data, `comprobante-venta-${venta.id}.pdf`)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.message || 'No se pudo descargar el comprobante.',
    })
  }
}
function descargarArchivo(datos, nombre) {
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(new Blob([datos], { type: 'application/pdf' }))
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}
function confirmarAnulacion(venta) {
  $q.dialog({
    title: 'Anular venta',
    message: `Se devolverán al inventario los productos de la venta ${venta.numero}. ¿Deseas continuar?`,
    cancel: { flat: true, label: 'Cancelar' },
    ok: { color: 'negative', label: 'Sí, anular' },
    persistent: true,
  }).onOk(async () => {
    try {
      await operacionesApi.anularVenta(venta.id)
      await cargar()
      $q.notify({
        type: 'positive',
        message: 'Venta anulada y stock restaurado',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message:
          e.response?.data?.message ||
          Object.values(e.response?.data?.errors || {})[0]?.[0] ||
          'No se pudo anular la venta',
      })
    }
  })
}
function normalizarCliente(valor) {
  const texto = String(valor || '')
  form.cliente_nombre = texto
    .toLocaleLowerCase('es')
    .replace(
      /(^|[\s'-])([a-záéíóúüñ])/g,
      (_, s, l) => s + l.toLocaleUpperCase('es'),
    )
}
function filtrarProductosUtilidad(valor, actualizar) {
  actualizar(() => {
    const busqueda = valor.trim().toLocaleLowerCase('es')
    const usados = new Set(tipoForm.productos.map((p) => p.producto_id))
    productosUtilidadFiltrados.value = productos.value.filter(
      (p) =>
        p.activo &&
        !usados.has(p.id) &&
        (!busqueda ||
          [p.id, p.nombre, p.codigo].some((dato) =>
            String(dato || '')
              .toLocaleLowerCase('es')
              .includes(busqueda),
          )),
    )
  })
}
function agregarProductoUtilidad() {
  if (!productoUtilidad.producto_id) return
  tipoForm.productos.push({
    clave: siguienteProductoUtilidad++,
    producto_id: productoUtilidad.producto_id,
    porcentaje: Number(productoUtilidad.porcentaje || 0),
    activo: true,
  })
  Object.assign(productoUtilidad, {
    producto_id: null,
    porcentaje: Number(tipoForm.porcentaje_general || 0),
  })
  productosUtilidadFiltrados.value = productosParaUtilidad()
}
function quitarProductoUtilidad(indice) {
  tipoForm.productos.splice(indice, 1)
}
function productosParaUtilidad() {
  const usados = new Set(tipoForm.productos.map((p) => p.producto_id))
  return productos.value.filter((p) => p.activo && !usados.has(p.id))
}
function nombreProductoUtilidad(id) {
  return productos.value.find((p) => p.id === id)?.nombre || 'Producto'
}
function codigoProductoUtilidad(id) {
  return productos.value.find((p) => p.id === id)?.codigo || 'Sin código'
}
function limpiarTipoUtilidad() {
  tipoEditandoId.value = null
  Object.assign(tipoForm, {
    nombre: '',
    porcentaje_general: 0,
    predeterminada: false,
    activo: true,
    productos: [],
  })
  Object.assign(productoUtilidad, { producto_id: null, porcentaje: 0 })
  productosUtilidadFiltrados.value = productosParaUtilidad()
}
function editarTipoUtilidad(tipo) {
  tipoEditandoId.value = tipo.id
  Object.assign(tipoForm, {
    nombre: tipo.nombre,
    porcentaje_general: Number(tipo.porcentaje_general),
    predeterminada: Boolean(tipo.predeterminada),
    activo: Boolean(tipo.activo),
    productos: (tipo.productos || []).map((p) => ({
      clave: siguienteProductoUtilidad++,
      producto_id: p.id,
      porcentaje: Number(p.pivot.porcentaje),
      activo: Boolean(Number(p.pivot.activo)),
    })),
  })
  Object.assign(productoUtilidad, {
    producto_id: null,
    porcentaje: Number(tipo.porcentaje_general),
  })
  productosUtilidadFiltrados.value = productosParaUtilidad()
}
function abrirUtilidadesProducto() {
  const configuracion =
    tiposUtilidad.value.find((t) => t.predeterminada) || tiposUtilidad.value[0]
  if (configuracion) editarTipoUtilidad(configuracion)
  else {
    limpiarTipoUtilidad()
    Object.assign(tipoForm, {
      nombre: 'Utilidad por producto',
      porcentaje_general: 0,
      predeterminada: true,
      activo: true,
    })
  }
  dialogoUtilidades.value = true
}
async function guardarTipoUtilidad() {
  if (
    tipoForm.productos.some((p) => !p.producto_id || Number(p.porcentaje) < 0)
  ) {
    $q.notify({
      type: 'warning',
      message: 'Completa el producto y su porcentaje de utilidad.',
    })
    return
  }
  try {
    const datos = {
      nombre: tipoForm.nombre,
      porcentaje_general: Number(tipoForm.porcentaje_general),
      predeterminada: tipoForm.predeterminada,
      activo: tipoForm.activo,
      productos: tipoForm.productos.map((p) => ({
        producto_id: p.producto_id,
        porcentaje: Number(p.porcentaje),
        activo: p.activo !== false,
      })),
    }
    if (tipoEditandoId.value)
      await operacionesApi.actualizarTipoUtilidad(tipoEditandoId.value, datos)
    else await operacionesApi.crearTipoUtilidad(datos)
    dialogoUtilidades.value = false
    limpiarTipoUtilidad()
    tiposUtilidad.value = (await operacionesApi.listarTiposUtilidad()).data
    recalcularTodos()
    $q.notify({
      type: 'positive',
      message: 'Utilidades por producto guardadas correctamente',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})[0]?.[0] ||
        'No se pudo guardar el tipo de utilidad',
    })
  }
}
async function cargar() {
  cargando.value = true
  try {
    const [resultadoVentas] = await Promise.allSettled([
      operacionesApi.listarVentas(),
      cargarCatalogoVenta({ notificar: false }),
    ])

    if (resultadoVentas.status === 'fulfilled') {
      ventas.value = resultadoVentas.value.data
    } else {
      $q.notify({
        type: 'negative',
        message:
          resultadoVentas.reason?.response?.data?.message ||
          'No se pudo cargar la lista de ventas.',
      })
    }
  } finally {
    cargando.value = false
  }
}

async function cargarCatalogoVenta({ notificar = true } = {}) {
  cargandoProductos.value = true

  try {
    const respuesta = await catalogoApi.listarProductos()
    productos.value = Array.isArray(respuesta.data) ? respuesta.data : []
    productosUtilidadFiltrados.value = productosParaUtilidad()
  } catch (errorCatalogo) {
    productos.value = []
    productosUtilidadFiltrados.value = []
    cargandoProductos.value = false

    if (notificar) {
      $q.notify({
        type: 'negative',
        message:
          errorCatalogo.response?.data?.message ||
          'No se pudieron cargar los productos disponibles.',
      })
    }

    return false
  }

  try {
    let respuestaUtilidades = null

    if (esAdministrador.value) {
      respuestaUtilidades = await operacionesApi.listarTiposUtilidad()
    } else if (auth.can('ventas.crear')) {
      respuestaUtilidades = await operacionesApi.listarOpcionesUtilidad()
    }

    tiposUtilidad.value = respuestaUtilidades?.data || []
  } catch (errorUtilidades) {
    tiposUtilidad.value = []

    if (notificar) {
      $q.notify({
        type: 'warning',
        message:
          errorUtilidades.response?.data?.message ||
          'Los productos se cargaron, pero no se pudo obtener la configuración de utilidad.',
      })
    }
  } finally {
    cargandoProductos.value = false
  }

  return true
}
async function guardar() {
  if (!datosVentaCompletos.value) return
  guardando.value = true
  try {
    if (form.con_factura && !form.numero_factura.trim()) {
      $q.notify({ type: 'warning', message: 'Ingresa el número de factura.' })
      return
    }
    const datos = {
      fecha: form.fecha,
      cliente_nombre: form.cliente_nombre || null,
      metodo_pago: form.metodo_pago,
      con_factura: form.con_factura,
      numero_factura: form.con_factura ? form.numero_factura.trim() : null,
      detalles: form.detalles.map((d) => ({
        producto_id: d.producto_id,
        tipo_utilidad_id: d.tipo_utilidad_id,
        porcentaje_utilidad: Number(d.utilidad),
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
      })),
    }
    if (editandoId.value)
      await operacionesApi.actualizarVenta(editandoId.value, datos)
    else await operacionesApi.crearVenta(datos)
    const mensaje = editandoId.value
      ? 'Venta actualizada e inventario recalculado'
      : `Venta de ${form.detalles.length} producto(s) registrada correctamente`
    dialogo.value = false
    editandoId.value = null
    await cargar()
    $q.notify({ type: 'positive', message: mensaje })
  } catch (e) {
    const errores = e.response?.data?.errors
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(errores || {})[0]?.[0] ||
        'Revisa los datos de la venta',
    })
  } finally {
    guardando.value = false
  }
}
watch(datosVentaCompletos, (completos) => {
  if (!completos && form.con_factura) {
    form.con_factura = false
    form.numero_factura = ''
    recalcularTodos()
  }
})
watch(
  () => form.con_factura,
  (conFactura) => {
    if (!conFactura) form.numero_factura = ''
  },
)
onMounted(cargar)
</script>

<style scoped>
.venta-header {
  background: linear-gradient(135deg, #f0f8f8, #fff);
}
.venta-footer {
  background: #fff;
}
.seccion-form {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f3f8f8;
  color: #2b5358;
}
.seccion-form .q-badge {
  min-width: 24px;
  min-height: 24px;
  justify-content: center;
  border-radius: 50%;
}
.tabla-ventas :deep(.q-table) {
  table-layout: auto;
  width: 100%;
  min-width: 760px;
}
.tabla-ventas :deep(th),
.tabla-ventas :deep(td) {
  white-space: nowrap;
  overflow-wrap: normal;
}
.tabla-ventas :deep(th:first-child),
.tabla-ventas :deep(td:first-child) {
  width: 150px;
}
.acciones-venta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 2px;
}
.venta-movil {
  height: 100%;
  border-radius: 14px;
  background: #fcfefe;
}
.venta-movil__cabecera,
.venta-movil__pie {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.venta-movil__datos {
  min-width: 0;
}
.venta-movil__datos .text-subtitle1 {
  overflow-wrap: anywhere;
}
.venta-movil__pie {
  align-items: center;
  margin-top: 14px;
}
.venta-dialog {
  width: 920px;
  max-width: 96vw;
  border-radius: 18px;
}
.venta-form {
  max-height: 72vh;
  overflow-y: auto;
}
.filtro-fecha :deep(.q-field__control) {
  background: linear-gradient(135deg, #fbfefe, #f1f8f8);
}
.detalle-card {
  border-radius: 14px;
}
.opciones-pago {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.opcion-pago {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 88px;
  padding: 16px 18px;
  border: 1px solid #d3e0e1;
  border-radius: 16px;
  background: #fff;
  color: #425356;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}
.opcion-pago:hover {
  border-color: #8db9bd;
  box-shadow: 0 8px 20px rgba(62, 112, 117, 0.1);
  transform: translateY(-1px);
}
.opcion-pago:focus-visible {
  outline: 3px solid rgba(95, 143, 148, 0.25);
  outline-offset: 2px;
}
.opcion-pago--activa {
  border-color: #5f8f94;
  background: linear-gradient(135deg, #eef7f7, #f9fcfc);
  box-shadow: 0 8px 22px rgba(62, 112, 117, 0.14);
}
.opcion-pago__icono {
  display: grid;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 15px;
  background: #edf3f3;
  color: #5f8f94;
}
.opcion-pago--activa .opcion-pago__icono {
  background: #5f8f94;
  color: #fff;
}
.opcion-pago__texto {
  display: grid;
  flex: 1;
  gap: 3px;
}
.opcion-pago__texto strong {
  color: #294d52;
  font-size: 1rem;
}
.opcion-pago__texto small {
  color: #738184;
  line-height: 1.35;
}
.opcion-pago__seleccion {
  color: #5f8f94;
}
.calculo-producto {
  border-radius: 14px;
  background: #f2f9f9;
  border: 1px solid #c7dfe1;
}
.pasos-producto {
  display: grid;
  gap: 8px;
}
.paso {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.formula-producto {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: #dceff0;
  color: #245d64;
  font-size: 1.08rem;
}
.iva-producto {
  color: #99611c;
}
.subtotal-producto {
  padding-top: 8px;
  border-top: 1px solid #c7dfe1;
  color: #245d64;
}
.subtotal-producto strong,
.subtotal-venta strong {
  color: #245d64;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.subtotal-venta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 14px 18px;
  border: 1px solid #c8dcde;
  border-radius: 12px;
  background: #f3f8f8;
}
.subtotal-venta span {
  color: #52696d;
  font-size: 1rem;
  font-weight: 600;
}
.iva-resumen {
  border-color: rgba(91, 157, 164, 0.55);
  border-radius: 16px;
  background: #f8fcfc;
}
.resumen-simple {
  border-radius: 14px;
  background: #f7faf9;
}
.fila-calculo {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 10px 0;
}
.fila-calculo.debito {
  color: #99611c;
}
.fila-calculo.total {
  color: #245d64;
  font-size: 1.08rem;
}
.formula-iva {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 18px 0;
  padding: 16px;
  border-radius: 14px;
  background: #dceff0;
  color: #245d64;
  font-size: 1.12rem;
}
.utilidad-rapida {
  border-radius: 14px;
  background: #f7fbfb;
}
.lista-utilidades {
  border-radius: 14px;
  overflow: hidden;
}
.utilidad-edicion {
  width: 150px;
}
.utilidad-estado {
  min-width: 125px;
}
.utilidad-origen {
  background: #f2f8f8;
  color: #315f65;
}
@media (max-width: 599px) {
  .opciones-pago {
    grid-template-columns: 1fr;
  }
  .opcion-pago {
    min-height: 80px;
    padding: 13px 14px;
  }
  .venta-dialog {
    width: 96vw;
    max-width: 96vw;
    border-radius: 14px;
  }
  .venta-form {
    max-height: 70vh;
  }
  .formula-iva {
    gap: 9px;
    font-size: 0.96rem;
  }
  .fila-calculo {
    align-items: flex-start;
  }
  .q-card__actions .q-btn {
    flex: 1 1 auto;
  }
  .venta-movil__cabecera {
    flex-direction: column;
  }
  .venta-movil__pie {
    flex-wrap: wrap;
  }
  .acciones-venta {
    margin-left: auto;
  }
  .lista-utilidades .q-item {
    flex-wrap: wrap;
  }
  .utilidad-edicion {
    width: 120px;
    margin-left: 72px;
  }
  .utilidad-estado {
    width: calc(100% - 72px);
    margin-left: 72px;
    align-items: flex-start;
  }
}
</style>
