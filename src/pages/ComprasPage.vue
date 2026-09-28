<template>
  <q-page>
    <div class="page-shell">
      <div class="row justify-between items-center q-mb-lg q-gutter-y-sm">
        <div>
          <div class="page-title">Compras</div>
          <div class="page-subtitle">
            Registra varios productos en una sola compra. El stock, costo
            promedio e IVA se calculan automáticamente.
          </div>
        </div>
        <q-btn
          v-if="auth.can('compras.crear')"
          color="primary"
          icon="add"
          label="Registrar compra"
          @click="abrirRegistro"
        />
      </div>

      <q-card class="surface-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="filter_alt" color="primary" /> Filtrar compras
          </div>
          <div class="row q-col-gutter-md">
            <q-input
              class="col-12 col-sm-4"
              v-model="filtroNumero"
              outlined
              dense
              clearable
              label="Número de compra"
              ><template #prepend><q-icon name="tag" /></template
            ></q-input>
            <q-input
              class="col-12 col-sm-4 filtro-fecha"
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
              class="col-12 col-sm-4"
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
          flat
          :rows="comprasFiltradas"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="p"
            ><q-td :props="p" class="no-wrap acciones-compra"
              ><q-btn
                flat
                round
                color="primary"
                icon="visibility"
                size="13px"
                aria-label="Ver compra"
                @click="verCompra(p.row)"
                ><q-tooltip>Ver compra</q-tooltip></q-btn
              ><q-btn
                flat
                round
                color="primary"
                icon="picture_as_pdf"
                size="13px"
                aria-label="Descargar comprobante"
                @click="descargarComprobante(p.row)"
                ><q-tooltip>Descargar comprobante PDF</q-tooltip></q-btn
              ><q-btn
                v-if="auth.can('compras.devolver') && puedeDevolver(p.row)"
                flat
                round
                color="orange-8"
                icon="assignment_return"
                size="14px"
                aria-label="Devolver al proveedor"
                @click="abrirDevolucion(p.row)"
                ><q-tooltip>Devolver productos al proveedor</q-tooltip></q-btn
              ><q-btn
                v-if="auth.can('compras.editar') && p.row.estado === 'confirmada' && !p.row.venta_posterior"
                flat
                round
                color="secondary"
                icon="edit"
                size="14px"
                aria-label="Editar compra"
                @click="abrirEdicion(p.row)"
                ><q-tooltip>Editar compra</q-tooltip></q-btn
              ><q-btn
                v-if="auth.can('compras.anular') && p.row.estado === 'confirmada' && !p.row.venta_posterior"
                flat
                round
                color="negative"
                icon="cancel"
                size="13px"
                aria-label="Anular compra"
                @click="confirmarAnulacion(p.row)"
                ><q-tooltip>Anular compra</q-tooltip></q-btn
              ><q-icon
                v-if="p.row.venta_posterior"
                name="lock_outline"
                color="grey-7"
                size="24px"
                aria-label="Compra bloqueada por una venta posterior"
              ><q-tooltip>Edición y anulación bloqueadas: {{ p.row.venta_posterior.producto }} tiene la venta {{ p.row.venta_posterior.venta }}.</q-tooltip></q-icon
              ></q-td
            ></template
          >
          <template #body-cell-productos="p"
            ><q-td :props="p"
              ><div class="productos-resumen">
                {{ resumenProductos(p.row) }}
              </div>
              <div class="text-caption text-grey-7">
                {{ p.row.detalles?.length || 0 }} línea(s) de compra
              </div></q-td
            ></template
          >
          <template #body-cell-estado="p"
            ><q-td :props="p"
              ><q-badge
                :color="colorEstadoCompra(p.row.estado)"
                >{{ textoEstadoCompra(p.row.estado) }}</q-badge
              ></q-td
            ></template
          >
          <template #item="p">
            <div class="col-12 q-pa-sm">
              <q-card flat bordered class="responsive-data-card">
                <q-card-section>
                  <div class="row justify-between items-start no-wrap">
                    <div>
                      <div class="text-weight-bold">{{ p.row.numero_registro }}</div>
                      <div class="text-caption text-grey-7">{{ fechaVisible(p.row.fecha) }}</div>
                    </div>
                    <q-badge :color="colorEstadoCompra(p.row.estado)">{{ textoEstadoCompra(p.row.estado) }}</q-badge>
                  </div>
                  <div class="q-mt-sm">{{ resumenProductos(p.row) }}</div>
                  <div class="text-caption text-grey-7">{{ p.row.detalles?.length || 0 }} línea(s) de compra</div>
                  <div v-if="p.row.venta_posterior" class="text-caption text-grey-7 q-mt-xs">
                    <q-icon name="lock_outline" /> No se puede editar ni anular: {{ p.row.venta_posterior.producto }} ya tiene una venta posterior.
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn flat round color="primary" icon="visibility" @click="verCompra(p.row)" />
                  <q-btn flat round color="primary" icon="picture_as_pdf" @click="descargarComprobante(p.row)" />
                  <q-btn v-if="auth.can('compras.devolver') && puedeDevolver(p.row)" flat round color="orange-8" icon="assignment_return" @click="abrirDevolucion(p.row)" />
                  <q-btn v-if="auth.can('compras.editar') && p.row.estado === 'confirmada' && !p.row.venta_posterior" flat round color="secondary" icon="edit" @click="abrirEdicion(p.row)" />
                  <q-btn v-if="auth.can('compras.anular') && p.row.estado === 'confirmada' && !p.row.venta_posterior" flat round color="negative" icon="cancel" @click="confirmarAnulacion(p.row)" />
                </q-card-actions>
              </q-card>
            </div>
          </template>
          <template #no-data
            ><div class="full-width text-center q-pa-xl text-grey-6">
              <q-icon name="shopping_bag" size="45px" />
              <div class="q-mt-sm">Aún no registraste compras</div>
            </div></template
          >
        </q-table>
      </q-card>

      <q-dialog v-model="dialogo" persistent>
        <q-card class="compra-dialog">
          <q-card-section class="row items-center no-wrap dialog-header">
            <q-avatar
              color="primary"
              text-color="white"
              icon="shopping_cart_checkout"
            />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bold">
                {{ editandoId ? 'Editar compra' : 'Nueva compra' }}
              </div>
              <div class="text-caption text-grey-7">
                {{
                  editandoId
                    ? 'Corrige productos, cantidades y precios de costo.'
                    : 'Agrega todos los productos que pertenecen a esta compra.'
                }}
              </div>
            </div>
            <q-space /><q-btn
              flat
              round
              dense
              icon="close"
              @click="cerrarRegistro"
            />
          </q-card-section>
          <q-separator />

          <q-card-section class="scroll compra-form">
            <div class="seccion-titulo q-mb-md">
              <q-avatar
                color="primary"
                text-color="white"
                icon="event"
                size="34px"
              />
              <div>
                <div class="text-subtitle1 text-weight-bold">
                  Datos de la compra
                </div>
                <div class="text-caption text-grey-7">
                  Completa la fecha y la información general.
                </div>
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <q-input
                class="col-12 col-sm-4"
                v-model="form.fecha"
                type="date"
                outlined
                label="Fecha"
                stack-label
              />
              <q-input
                class="col-12 col-sm-8"
                v-model="form.proveedor_nombre"
                clearable
                outlined
                maxlength="180"
                label="Proveedor (opcional)"
                hint="Escribe el nombre del proveedor"
                @update:model-value="normalizarProveedor"
              />
              <q-input
                class="col-12"
                v-model="form.observacion"
                outlined
                type="textarea"
                autogrow
                label="Descripción de la compra (opcional)"
                @update:model-value="normalizarDescripcion"
              />
            </div>

            <div class="row items-center justify-between q-mt-lg q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-bold">Productos</div>
                <div class="text-caption text-grey-7">
                  Selecciona cada producto y registra su cantidad y costo.
                </div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Agregar otro producto"
                @click="agregarDetalle"
              />
            </div>

            <q-card
              v-for="(detalle, indice) in form.detalles"
              :key="detalle.clave"
              flat
              bordered
              class="detalle-card q-mb-md"
            >
              <q-card-section class="row q-col-gutter-md items-start">
                <div
                  class="col-12 row items-center justify-between detalle-titulo"
                >
                  <span class="text-weight-medium"
                    >Producto {{ indice + 1 }}</span
                  ><q-btn
                    v-if="form.detalles.length > 1"
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    aria-label="Quitar producto"
                    @click="quitarDetalle(indice)"
                  />
                </div>
                <q-select
                  class="col-12 col-md-6"
                  v-model="detalle.producto_id"
                  :options="opcionesProducto"
                  option-value="id"
                  option-label="etiqueta"
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  outlined
                  label="Producto"
                  @filter="
                    (valor, actualizar) => filtrarProductos(valor, actualizar)
                  "
                />
                <q-select
                  class="col-12 col-md-2"
                  v-model="detalle.presentacion"
                  :options="[{ label: 'Unidad', value: 'unidad' }, { label: 'Paquete', value: 'paquete' }]"
                  emit-value
                  map-options
                  outlined
                  label="Comprar por"
                />
                <q-input
                  class="col-6 col-md-2"
                  v-model.number="detalle.cantidad"
                  type="number"
                  min="0.0001"
                  step="1"
                  outlined
                  :label="detalle.presentacion === 'paquete' ? 'Paquetes' : 'Unidades'"
                />
                <q-input
                  v-if="detalle.presentacion === 'paquete'"
                  class="col-6 col-md-2"
                  v-model.number="detalle.unidades_por_paquete"
                  type="number"
                  min="2"
                  step="1"
                  outlined
                  label="Unidades por paquete"
                />
                <q-input
                  class="col-6 col-md-2"
                  v-model.number="detalle.costo_unitario"
                  type="number"
                  min="0.01"
                  step="0.01"
                  prefix="Bs"
                  outlined
                  :label="detalle.presentacion === 'paquete' ? 'Costo por paquete' : 'Costo por unidad'"
                />
                <div v-if="puedeVerUtilidad && detalle.producto_id" class="col-12 text-caption text-primary">
                  <q-icon name="trending_up" />
                  {{ descripcionUtilidad(detalle.producto_id) }}
                </div>
                <div v-if="detalle.presentacion === 'paquete'" class="col-12 text-caption text-primary">
                  Entrada al inventario: {{ Number(detalle.cantidad || 0) * Number(detalle.unidades_por_paquete || 0) }} unidades
                </div>
                <div class="col-12">
                  <q-card flat class="subtotal-card"
                    ><q-card-section class="subtotal-card__content"
                      ><div class="subtotal-card__label">Subtotal del producto</div>
                      <div class="subtotal-card__amount">
                        Bs {{ subtotalDetalle(detalle).toFixed(2) }}
                      </div></q-card-section
                    ></q-card
                  >
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="total-card q-mb-lg"
              ><q-card-section class="row items-center justify-between"
                ><span class="text-weight-medium">Subtotal de productos</span
                ><span class="subtotal-total-amount"
                  >Bs {{ subtotal.toFixed(2) }}</span
                ></q-card-section
              ></q-card
            >

            <div class="row items-center q-gutter-sm">
              <q-toggle
                v-model="form.con_factura"
                :disable="!datosCompraCompletos"
                label="¿Te entregaron factura?"
              />
              <q-badge
                :color="form.con_factura ? 'positive' : 'grey-6'"
                class="q-pa-sm"
                >{{
                  form.con_factura ? 'Sí, cálculo automático activado' : 'No'
                }}</q-badge
              >
            </div>
            <div
              v-if="!datosCompraCompletos"
              class="text-caption text-orange-9 q-mt-xs"
            >
              <q-icon name="info" /> Completa primero la fecha, el producto, la
              cantidad y el precio de costo.
            </div>
            <q-card
              v-if="form.con_factura"
              flat
              bordered
              class="factura-card q-mt-md q-mb-md"
            >
              <q-card-section class="factura-encabezado row items-center">
                <q-avatar
                  color="primary"
                  text-color="white"
                  icon="receipt_long"
                  size="42px"
                />
                <div class="q-ml-md">
                  <div class="text-subtitle1 text-weight-bold">
                    Factura recibida
                  </div>
                  <div class="text-caption text-grey-7">
                    Escribe el número y, si existe, el descuento. El IVA se
                    calcula solo.
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div class="text-weight-medium q-mb-sm">
                  <q-badge color="primary" label="1" class="q-mr-sm" />Datos de
                  la factura
                </div>
                <div class="row q-col-gutter-md">
                  <q-input
                    autofocus
                    clearable
                    class="col-12 col-sm-6"
                    v-model="form.numero_factura"
                    outlined
                    label="Número de factura"
                    hint="Está impreso en la factura"
                  />
                  <q-input
                    clearable
                    class="col-12 col-sm-6"
                    v-model.number="form.descuento"
                    type="number"
                    min="0"
                    prefix="Bs"
                    outlined
                    label="Descuento (opcional)"
                    hint="Déjalo en cero si no existe descuento"
                  />
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="iva-resumen">
                <div class="text-weight-medium q-mb-sm">
                  <q-badge color="primary" label="2" class="q-mr-sm" />Cálculo
                  automático
                </div>
                <div class="iva-fila total-con-iva">
                  <span>Total de productos con IVA</span
                  ><strong>Bs {{ subtotal.toFixed(2) }}</strong>
                </div>
                <div v-if="descuentoAplicado > 0" class="iva-fila">
                  <span>(−) Descuento</span
                  ><strong>Bs {{ descuentoAplicado.toFixed(2) }}</strong>
                </div>
                <div class="iva-fila base-fiscal">
                  <span>Importe válido para calcular IVA</span
                  ><strong>Bs {{ baseCreditoFiscal.toFixed(2) }}</strong>
                </div>
                <div class="iva-formula q-mt-md">
                  <span>Bs {{ baseCreditoFiscal.toFixed(2) }}</span
                  ><q-icon name="close" /><span>13%</span
                  ><q-icon name="east" /><strong
                    >Bs {{ creditoFiscalEstimado.toFixed(2) }}</strong
                  >
                </div>
                <div class="text-center text-weight-bold text-primary q-mt-sm">
                  Crédito fiscal IVA de esta compra
                </div>
                <q-separator class="q-my-md" />
                <div class="iva-fila">
                  <span>Total de la compra con IVA</span
                  ><strong>Bs {{ totalCompra.toFixed(2) }}</strong>
                </div>
                <div class="iva-fila resta-iva">
                  <span>(−) Crédito fiscal IVA desglosado</span
                  ><strong>Bs {{ creditoFiscalEstimado.toFixed(2) }}</strong>
                </div>
                <div class="iva-fila importe-sin-iva">
                  <span>Importe de la compra sin IVA</span
                  ><strong>Bs {{ importeCompraSinIva.toFixed(2) }}</strong>
                </div>
                <q-separator class="q-my-sm" />
                <div class="iva-fila total-pagar">
                  <span>Total que pagarás al proveedor (incluye IVA)</span
                  ><strong>Bs {{ totalCompra.toFixed(2) }}</strong>
                </div>
              </q-card-section>
            </q-card>

            <q-banner
              v-if="!form.con_factura"
              rounded
              class="q-mt-md bg-grey-2 text-grey-8"
              ><template #avatar><q-icon name="info" /></template>La compra se
              registrará sin factura y no generará crédito fiscal IVA.</q-banner
            >
          </q-card-section>

          <q-separator />
          <q-card-actions align="right" class="q-pa-md"
            ><q-btn flat label="Cancelar" @click="cerrarRegistro" /><q-btn
              color="primary"
              icon="save"
              :label="editandoId ? 'Guardar cambios' : 'Confirmar compra'"
              :loading="guardando"
              @click="guardar"
          /></q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialogoVer">
        <q-card class="detalle-dialog">
          <q-card-section class="dialog-header row items-center"
            ><q-avatar color="primary" text-color="white" icon="receipt_long" />
            <div class="q-ml-md">
              <div class="text-h6">
                Compra · Número {{ compraSeleccionada?.numero_registro }}
              </div>
              <div class="text-caption text-grey-7">
                {{ fechaVisible(compraSeleccionada?.fecha) }}
              </div>
            </div>
            <q-space /><q-btn flat round dense icon="close" v-close-popup
          /></q-card-section>
          <q-separator />
          <q-card-section v-if="compraSeleccionada"
            ><div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Proveedor</div>
                <div>
                  {{ compraSeleccionada.proveedor_nombre || 'Sin proveedor' }}
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Factura</div>
                <div>
                  {{
                    compraSeleccionada.con_factura
                      ? compraSeleccionada.numero_factura || 'Con factura'
                      : 'Sin factura'
                  }}
                </div>
              </div>
            </div>
            <q-list bordered separator class="rounded-borders"
              ><q-item v-for="d in compraSeleccionada.detalles" :key="d.id"
                ><q-item-section
                  ><q-item-label>{{
                    d.producto?.nombre || `Producto ${d.producto_id}`
                  }}</q-item-label
                  ><q-item-label caption
                    >{{ d.producto?.codigo || '' }} ·
                    {{ Number(d.cantidad_presentacion ?? d.cantidad) }} {{ d.presentacion === 'paquete' ? 'paquete(s)' : 'unidad(es)' }} × Bs
                    {{ Number(d.costo_presentacion ?? d.costo_unitario).toFixed(2) }}
                    <span v-if="d.presentacion === 'paquete'"> · {{ Number(d.unidades_por_paquete) }} por paquete = {{ Number(d.cantidad) }} unidades</span></q-item-label
                  ></q-item-section
                ><q-item-section side
                  >Bs {{ Number(d.subtotal).toFixed(2) }}</q-item-section
                ></q-item
              ></q-list
            >
            <div class="row justify-end q-mt-md">
              <div class="text-right">
                <div class="text-caption">
                  Crédito fiscal IVA: Bs
                  {{
                    Number(compraSeleccionada.credito_fiscal_iva || 0).toFixed(
                      2,
                    )
                  }}
                </div>
                <div class="text-h6 text-primary">
                  Total: Bs {{ Number(compraSeleccionada.total).toFixed(2) }}
                </div>
              </div>
            </div>
            <div v-if="compraSeleccionada.observacion" class="q-mt-md">
              <div class="text-caption text-grey-7">Descripción</div>
              <div>{{ compraSeleccionada.observacion }}</div>
            </div>
            <div v-if="compraSeleccionada.devoluciones?.length" class="q-mt-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Devoluciones al proveedor</div>
              <q-list bordered separator class="rounded-borders">
                <q-item v-for="devolucion in compraSeleccionada.devoluciones" :key="devolucion.id">
                  <q-item-section>
                    <q-item-label>{{ devolucion.numero }}</q-item-label>
                    <q-item-label caption>{{ fechaVisible(devolucion.fecha) }} · {{ textoSolucion(devolucion.solucion) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center no-wrap">
                      <strong>Bs {{ Number(devolucion.total).toFixed(2) }}</strong>
                      <q-btn flat round color="primary" icon="picture_as_pdf" @click="descargarComprobanteDevolucion(compraSeleccionada, devolucion)" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div></q-card-section
          >
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialogoDevolucion" persistent>
        <q-card class="devolucion-dialog">
          <q-card-section class="dialog-header row items-center no-wrap">
            <q-avatar color="orange-8" text-color="white" icon="assignment_return" />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bold">Devolver al proveedor</div>
              <div class="text-caption text-grey-7">
                Compra N.º {{ compraDevolucion?.numero_registro }} · {{ compraDevolucion?.proveedor_nombre || 'Proveedor no especificado' }}
              </div>
            </div>
            <q-space /><q-btn flat round dense icon="close" @click="cerrarDevolucion" />
          </q-card-section>
          <q-separator />
          <q-card-section class="scroll devolucion-form" v-if="compraDevolucion">
            <q-input v-model="formDevolucion.fecha" type="date" outlined stack-label label="Fecha de devolución" class="q-mb-md" />
            <q-list bordered separator class="rounded-borders q-mb-md">
              <q-item v-for="detalle in formDevolucion.detalles" :key="detalle.detalle_compra_id">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ detalle.nombre }}</q-item-label>
                  <q-item-label caption>
                    Comprado: {{ cantidadVisible(detalle.comprado) }} · Devuelto: {{ cantidadVisible(detalle.devuelto) }} · Disponible: {{ cantidadVisible(detalle.disponible) }} · Stock actual: {{ cantidadVisible(detalle.stock_actual) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side class="cantidad-devolucion">
                  <q-input v-model.number="detalle.cantidad" type="number" min="0" :max="Math.min(detalle.disponible, detalle.stock_actual)" step="1" outlined dense label="A devolver" />
                </q-item-section>
              </q-item>
            </q-list>
            <q-input v-model="formDevolucion.motivo" outlined type="textarea" autogrow maxlength="500" label="Motivo de la devolución *" class="q-mb-md" />
            <div class="row q-col-gutter-md">
              <q-select class="col-12 col-sm-6" v-model="formDevolucion.solucion" :options="opcionesSolucion" emit-value map-options outlined label="Solución acordada *" />
              <q-select v-if="formDevolucion.solucion === 'reembolso'" class="col-12 col-sm-6" v-model="formDevolucion.medio_reembolso" :options="opcionesReembolso" emit-value map-options outlined label="Medio de reembolso *" />
              <q-input v-if="compraDevolucion.con_factura" class="col-12" v-model="formDevolucion.numero_nota_credito_debito" outlined label="Número del documento de ajuste del proveedor *" hint="Necesario para revertir proporcionalmente el crédito fiscal IVA" />
            </div>
            <q-banner rounded class="bg-blue-grey-1 text-primary q-mt-md">
              La compra original no se eliminará. El Kardex registrará una salida por devolución al proveedor.
            </q-banner>
            <div class="text-h5 text-primary text-right q-mt-lg">Total reconocido: Bs {{ totalDevolucion.toFixed(2) }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" @click="cerrarDevolucion" />
            <q-btn color="orange-8" icon="save" label="Confirmar devolución" :loading="guardandoDevolucion" @click="guardarDevolucion" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { auth } from 'src/services/auth'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { catalogoApi, operacionesApi } from 'src/services/sistemaApi'
import { fechaHoyBolivia } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const compras = ref([]),
  productos = ref([]),
  tiposUtilidad = ref([]),
  opcionesProducto = ref([]),
  filtroNumero = ref(''),
  filtroFecha = ref(''),
  filtroProducto = ref(''),
  cargando = ref(false),
  guardando = ref(false),
  guardandoDevolucion = ref(false),
  dialogo = ref(false),
  dialogoVer = ref(false),
  dialogoDevolucion = ref(false),
  compraSeleccionada = ref(null),
  compraDevolucion = ref(null),
  editandoId = ref(null)
const puedeVerUtilidad = computed(() => auth.can('utilidades.ver_en_compras'))
function descripcionUtilidad(productoId) {
  const activos = tiposUtilidad.value.filter((tipo) => tipo.activo)
  const tipo = activos.find((item) => item.predeterminada) || activos[0]
  if (!tipo) return 'Sin utilidad configurada para este negocio.'
  const especifica = tipo.productos?.find(
    (producto) => producto.id === productoId && Boolean(Number(producto.pivot?.activo)),
  )
  const porcentaje = Number(especifica?.pivot?.porcentaje ?? tipo.porcentaje_general ?? 0)
  return `Utilidad asignada: ${porcentaje.toFixed(2)}% (${especifica ? 'del producto' : 'general'}).`
}
async function cargarUtilidades() {
  if (!puedeVerUtilidad.value) {
    tiposUtilidad.value = []
    return
  }
  try {
    const respuesta = await operacionesApi.listarUtilidadEnCompras()
    tiposUtilidad.value = Array.isArray(respuesta.data) ? respuesta.data : []
  } catch {
    tiposUtilidad.value = []
    $q.notify({ type: 'warning', message: 'No se pudo consultar la utilidad de este negocio.' })
  }
}
let siguienteClave = 1
const nuevoDetalle = () => ({
  clave: siguienteClave++,
  producto_id: null,
  cantidad: 1,
  costo_unitario: 0,
  presentacion: 'unidad',
  unidades_por_paquete: null,
})
const form = reactive({
  fecha: fechaHoyBolivia(),
  proveedor_nombre: '',
  con_factura: false,
  numero_factura: '',
  descuento: 0,
  observacion: '',
  detalles: [nuevoDetalle()],
})
const formDevolucion = reactive({
  fecha: fechaHoyBolivia(),
  motivo: '',
  solucion: 'reembolso',
  medio_reembolso: 'efectivo',
  numero_nota_credito_debito: '',
  detalles: [],
})
const opcionesSolucion = [
  { label: 'Reembolso de dinero', value: 'reembolso' },
  { label: 'Crédito para una próxima compra', value: 'credito_proveedor' },
  { label: 'Descontar de la deuda al proveedor', value: 'descuento_deuda' },
  { label: 'Reemplazo de productos', value: 'reemplazo' },
]
const opcionesReembolso = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Tarjeta', value: 'tarjeta' },
]
const totalDevolucion = computed(() => {
  const factor = Number(compraDevolucion.value?.subtotal || 0) > 0
    ? Number(compraDevolucion.value?.total || 0) / Number(compraDevolucion.value?.subtotal || 1)
    : 1
  return formDevolucion.detalles.reduce(
    (total, detalle) => total + Number(detalle.cantidad || 0) * Number(detalle.costo_unitario || 0) * factor,
    0,
  )
})

const etiquetaProducto = (p) =>
  [p.codigo, p.nombre, p.color, p.subcategoria].filter(Boolean).join(' · ')
const catalogoOpciones = computed(() =>
  productos.value.map((p) => ({ ...p, etiqueta: etiquetaProducto(p) })),
)
const subtotalDetalle = (detalle) =>
  Number(detalle.cantidad || 0) * Number(detalle.costo_unitario || 0)
const subtotal = computed(() =>
  form.detalles.reduce((total, detalle) => total + subtotalDetalle(detalle), 0),
)
const descuentoAplicado = computed(() =>
  Math.max(0, Number(form.descuento || 0)),
)
const totalCompra = computed(() =>
  Math.max(0, subtotal.value - descuentoAplicado.value),
)
const baseCreditoFiscal = computed(() => totalCompra.value)
const creditoFiscalEstimado = computed(() => baseCreditoFiscal.value * 0.13)
const importeCompraSinIva = computed(() =>
  Math.max(0, totalCompra.value - creditoFiscalEstimado.value),
)
const datosCompraCompletos = computed(
  () =>
    Boolean(form.fecha) &&
    form.detalles.length > 0 &&
    form.detalles.every(
      (detalle) =>
        detalle.producto_id &&
        Number(detalle.cantidad) > 0 &&
        Number(detalle.costo_unitario) > 0 &&
        (detalle.presentacion !== 'paquete' ||
          (Number.isInteger(Number(detalle.unidades_por_paquete)) && Number(detalle.unidades_por_paquete) >= 2)),
    ),
)
const comprasFiltradas = computed(() => {
  const numero = filtroNumero.value.trim().toLocaleLowerCase('es')
  const producto = filtroProducto.value.trim().toLocaleLowerCase('es')
  return compras.value.filter((compra) => {
    const coincideNumero =
      !numero ||
      String(compra.numero_registro || '')
        .toLocaleLowerCase('es')
        .includes(numero)
    const coincideFecha =
      !filtroFecha.value ||
      String(compra.fecha || '').slice(0, 10) === filtroFecha.value
    const coincideProducto =
      !producto ||
      (compra.detalles || []).some((detalle) =>
        [detalle.producto?.nombre, detalle.producto?.codigo]
          .filter(Boolean)
          .some((valor) =>
            String(valor).toLocaleLowerCase('es').includes(producto),
          ),
      )
    return coincideNumero && coincideFecha && coincideProducto
  })
})
const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  {
    name: 'numero',
    label: 'Número',
    field: (r) => r.numero_registro,
    align: 'left',
  },
  { name: 'fecha', label: 'Fecha', field: (r) => fechaVisible(r.fecha) },
  { name: 'productos', label: 'Productos', field: 'detalles', align: 'center' },
  {
    name: 'estado',
    label: 'Estado',
    field: (r) => (r.estado === 'confirmada' ? 'Confirmada' : r.estado),
  },
]

const cantidadVisible = (valor) => Number(valor || 0).toLocaleString('es-BO', { maximumFractionDigits: 4 })
const textoEstadoCompra = (estado) => ({
  confirmada: 'Confirmada',
  anulada: 'Anulada',
  devuelta_parcial: 'Devuelta parcialmente',
  devuelta_total: 'Devuelta totalmente',
}[estado] || estado)
const colorEstadoCompra = (estado) => ({
  confirmada: 'positive',
  anulada: 'negative',
  devuelta_parcial: 'orange-8',
  devuelta_total: 'blue-grey-7',
}[estado] || 'grey')
const textoSolucion = (solucion) => ({
  reembolso: 'Reembolso',
  credito_proveedor: 'Crédito con el proveedor',
  descuento_deuda: 'Descuento de la deuda',
  reemplazo: 'Reemplazo de productos',
}[solucion] || solucion)
function cantidadDevuelta(compra, detalleId) {
  return (compra.devoluciones || [])
    .filter((devolucion) => devolucion.estado === 'confirmada')
    .flatMap((devolucion) => devolucion.detalles || [])
    .filter((detalle) => Number(detalle.detalle_compra_id) === Number(detalleId))
    .reduce((total, detalle) => total + Number(detalle.cantidad || 0), 0)
}
function puedeDevolver(compra) {
  if (!compra || ['anulada', 'devuelta_total'].includes(compra.estado)) return false
  return (compra.detalles || []).some((detalle) => {
    const producto = detalle.producto || productos.value.find((item) => Number(item.id) === Number(detalle.producto_id))
    return Number(detalle.cantidad) - cantidadDevuelta(compra, detalle.id) > 0
      && Number(producto?.stock_actual || 0) > 0
  })
}

function abrirDevolucion(compra) {
  compraDevolucion.value = compra
  Object.assign(formDevolucion, {
    fecha: fechaHoyBolivia(),
    motivo: '',
    solucion: 'reembolso',
    medio_reembolso: 'efectivo',
    numero_nota_credito_debito: '',
    detalles: (compra.detalles || []).map((detalle) => {
      const devuelto = cantidadDevuelta(compra, detalle.id)
      const producto = detalle.producto || productos.value.find((item) => Number(item.id) === Number(detalle.producto_id))
      return {
        detalle_compra_id: detalle.id,
        nombre: detalle.producto?.nombre || `Producto ${detalle.producto_id}`,
        comprado: Number(detalle.cantidad),
        devuelto,
        disponible: Math.max(0, Number(detalle.cantidad) - devuelto),
        stock_actual: Number(producto?.stock_actual || 0),
        costo_unitario: Number(detalle.costo_unitario || 0),
        cantidad: 0,
      }
    }),
  })
  dialogoDevolucion.value = true
}
function cerrarDevolucion() {
  dialogoDevolucion.value = false
  compraDevolucion.value = null
}
async function guardarDevolucion() {
  const detalles = formDevolucion.detalles
    .filter((detalle) => Number(detalle.cantidad || 0) > 0)
    .map((detalle) => ({ detalle_compra_id: detalle.detalle_compra_id, cantidad: Number(detalle.cantidad) }))
  if (!detalles.length) {
    $q.notify({ type: 'warning', message: 'Indica la cantidad de al menos un producto.' })
    return
  }
  const invalido = formDevolucion.detalles.find((detalle) => Number(detalle.cantidad || 0) > Math.min(detalle.disponible, detalle.stock_actual))
  if (invalido) {
    $q.notify({ type: 'warning', message: `La cantidad de ${invalido.nombre} supera lo disponible para devolver.` })
    return
  }
  if (!formDevolucion.motivo.trim()) {
    $q.notify({ type: 'warning', message: 'Escribe el motivo de la devolución.' })
    return
  }
  if (compraDevolucion.value.con_factura && !formDevolucion.numero_nota_credito_debito.trim()) {
    $q.notify({ type: 'warning', message: 'Registra el documento de ajuste entregado por el proveedor.' })
    return
  }
  guardandoDevolucion.value = true
  try {
    await operacionesApi.registrarDevolucionCompra(compraDevolucion.value.id, {
      fecha: formDevolucion.fecha,
      motivo: formDevolucion.motivo.trim(),
      solucion: formDevolucion.solucion,
      medio_reembolso: formDevolucion.solucion === 'reembolso' ? formDevolucion.medio_reembolso : null,
      numero_nota_credito_debito: compraDevolucion.value.con_factura ? formDevolucion.numero_nota_credito_debito.trim() : null,
      detalles,
    })
    cerrarDevolucion()
    await cargar()
    $q.notify({ type: 'positive', message: 'Devolución al proveedor registrada correctamente.' })
  } catch (e) {
    $q.notify({ type: 'negative', message: Object.values(e.response?.data?.errors || {})[0]?.[0] || e.response?.data?.message || 'No se pudo registrar la devolución.' })
  } finally {
    guardandoDevolucion.value = false
  }
}

function agregarDetalle() {
  form.detalles.push(nuevoDetalle())
}
function quitarDetalle(indice) {
  form.detalles.splice(indice, 1)
}
function filtrarProductos(valor, actualizar) {
  actualizar(() => {
    const texto = String(valor || '').toLocaleLowerCase('es')
    opcionesProducto.value = catalogoOpciones.value.filter((p) =>
      p.etiqueta.toLocaleLowerCase('es').includes(texto),
    )
  })
}
function limpiar() {
  Object.assign(form, {
    fecha: fechaHoyBolivia(),
    proveedor_nombre: '',
    con_factura: false,
    numero_factura: '',
    descuento: 0,
    observacion: '',
    detalles: [nuevoDetalle()],
  })
}
async function abrirRegistro() {
  await cargarUtilidades()
  editandoId.value = null
  limpiar()
  opcionesProducto.value = catalogoOpciones.value
  dialogo.value = true
}
function cerrarRegistro() {
  dialogo.value = false
  editandoId.value = null
  limpiar()
}
function normalizarTexto(valor) {
  const texto = String(valor || '')
  return texto ? texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1) : ''
}
function normalizarDescripcion(valor) {
  form.observacion = normalizarTexto(valor)
}
function normalizarProveedor(valor) {
  form.proveedor_nombre = normalizarTexto(valor)
}
const fechaVisible = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(fecha))
    : ''
const fechaFiltroVisible = (fecha) =>
  fecha ? fecha.split('-').reverse().join('/') : ''
const resumenProductos = (compra) =>
  compra?.detalles
    ?.map(
      (detalle) =>
        detalle.producto?.nombre || `Producto ${detalle.producto_id}`,
    )
    .join(', ') || 'Sin productos'
async function descargarComprobante(compra) {
  try {
    const { data } = await operacionesApi.descargarComprobanteCompra(compra.id)
    descargarArchivo(data, `comprobante-compra-${compra.numero_registro || compra.id}.pdf`)
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.message || 'No se pudo descargar el comprobante.',
    })
  }
}
async function descargarComprobanteDevolucion(compra, devolucion) {
  try {
    const { data } = await operacionesApi.descargarComprobanteDevolucionCompra(compra.id, devolucion.id)
    descargarArchivo(data, `devolucion-proveedor-${devolucion.numero}.pdf`)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'No se pudo descargar el comprobante de devolución.' })
  }
}
function descargarArchivo(datos, nombre) {
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(new Blob([datos], { type: 'application/pdf' }))
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}
function verCompra(compra) {
  compraSeleccionada.value = compra
  dialogoVer.value = true
}
async function abrirEdicion(compra) {
  await cargarUtilidades()
  editandoId.value = compra.id
  Object.assign(form, {
    fecha: String(compra.fecha).slice(0, 10),
    proveedor_nombre: compra.proveedor_nombre || '',
    con_factura: Boolean(compra.con_factura),
    numero_factura: compra.numero_factura || '',
    descuento: Number(compra.descuento || 0),
    observacion: compra.observacion || '',
    detalles: compra.detalles.map((detalle) => ({
      clave: siguienteClave++,
      producto_id: detalle.producto_id,
      cantidad: Number(detalle.cantidad_presentacion ?? detalle.cantidad),
      costo_unitario: Number(detalle.costo_presentacion ?? detalle.costo_unitario),
      presentacion: detalle.presentacion || 'unidad',
      unidades_por_paquete: detalle.presentacion === 'paquete' ? Number(detalle.unidades_por_paquete) : null,
    })),
  })
  opcionesProducto.value = catalogoOpciones.value
  dialogo.value = true
}
function confirmarAnulacion(compra) {
  $q.dialog({
    title: 'Anular compra',
    message: `Se revertirá el stock de la compra número ${compra.numero_registro} y se excluirá su crédito fiscal. ¿Deseas continuar?`,
    cancel: { flat: true, label: 'Cancelar' },
    ok: { color: 'negative', label: 'Sí, anular' },
    persistent: true,
  }).onOk(async () => {
    try {
      await operacionesApi.anularCompra(compra.id)
      await cargar()
      $q.notify({
        type: 'positive',
        message: 'Compra anulada y stock revertido',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message:
          e.response?.data?.message ||
          Object.values(e.response?.data?.errors || {})[0]?.[0] ||
          'No se pudo anular la compra',
      })
    }
  })
}

watch(datosCompraCompletos, (completos) => {
  if (!completos && form.con_factura) {
    form.con_factura = false
    form.numero_factura = ''
    form.descuento = 0
  }
})

function validar() {
  if (
    !form.detalles.length ||
    form.detalles.some(
      (d) =>
        !d.producto_id ||
        Number(d.cantidad) <= 0 ||
        Number(d.costo_unitario) <= 0 ||
        (d.presentacion === 'paquete' &&
          (!Number.isInteger(Number(d.unidades_por_paquete)) || Number(d.unidades_por_paquete) < 2)),
    )
  )
    return 'Selecciona el producto, una cantidad y costo válidos; si compras paquetes, indica sus unidades.'
  const ids = form.detalles.map((d) => d.producto_id)
  if (new Set(ids).size !== ids.length)
    return 'El mismo producto está repetido. Ajusta su cantidad en una sola línea.'
  if (Number(form.descuento || 0) > subtotal.value)
    return 'El descuento no puede superar el subtotal.'
  return null
}

async function cargar() {
  cargando.value = true
  try {
    const [c, p] = await Promise.all([
      operacionesApi.listarCompras(),
      catalogoApi.listarProductos(),
    ])
    compras.value = c.data
    productos.value = p.data.filter((x) => x.activo)
    opcionesProducto.value = catalogoOpciones.value
  } finally {
    cargando.value = false
  }
}

async function guardar() {
  const error = validar()
  if (error) {
    $q.notify({ type: 'warning', message: error })
    return
  }
  guardando.value = true
  try {
    const datos = {
      fecha: form.fecha,
      proveedor_nombre: form.proveedor_nombre || null,
      con_factura: form.con_factura,
      numero_factura: form.con_factura ? form.numero_factura || null : null,
      descuento: form.con_factura ? Number(form.descuento || 0) : 0,
      importe_no_sujeto_iva: 0,
      observacion: form.observacion || null,
      detalles: form.detalles.map(
        ({ producto_id, cantidad, costo_unitario, presentacion, unidades_por_paquete }) => ({
          producto_id,
          cantidad: Number(cantidad),
          costo_unitario: Number(costo_unitario),
          presentacion,
          unidades_por_paquete: presentacion === 'paquete' ? Number(unidades_por_paquete) : null,
        }),
      ),
    }
    if (editandoId.value)
      await operacionesApi.actualizarCompra(editandoId.value, datos)
    else await operacionesApi.crearCompra(datos)
    const fueEdicion = Boolean(editandoId.value)
    dialogo.value = false
    editandoId.value = null
    limpiar()
    await cargar()
    $q.notify({
      type: 'positive',
      message: fueEdicion
        ? 'Compra actualizada e inventario recalculado'
        : 'Compra registrada. Se actualizó el stock de todos los productos.',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})[0]?.[0] ||
        'Revisa los datos ingresados',
    })
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.compra-dialog {
  width: 900px;
  max-width: 95vw;
  border-radius: 20px;
}
.detalle-dialog {
  width: 680px;
  max-width: 94vw;
  border-radius: 18px;
}
.productos-resumen {
  max-width: 320px;
  white-space: normal;
  font-weight: 500;
}
.acciones-compra .q-btn {
  margin-right: 3px;
}
.dialog-header {
  background: linear-gradient(135deg, #f5fbfb, #eef5f5);
}
.devolucion-dialog {
  width: 850px;
  max-width: 96vw;
  border-radius: 20px;
}
.devolucion-form {
  max-height: 72vh;
}
.cantidad-devolucion {
  width: 150px;
}
@media (max-width: 599px) {
  .cantidad-devolucion {
    width: 115px;
  }
}
.seccion-titulo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f3f8f8;
}
.filtro-fecha :deep(.q-field__control) {
  background: linear-gradient(135deg, #fbfefe, #f1f8f8);
}
.compra-form {
  max-height: 72vh;
}
.detalle-card {
  border-color: #cbdadb;
  border-radius: 14px;
  background: #fcfefe;
}
.detalle-titulo {
  min-height: 30px;
}
.subtotal-card,
.total-card {
  background: #f3f8f8;
  border-color: #c8dcde;
}
.subtotal-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 14px 20px;
}
.subtotal-card__label {
  color: #52696d;
  font-size: 1rem;
  font-weight: 600;
}
.subtotal-card__amount,
.subtotal-total-amount {
  color: #245d64;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.factura-card {
  border: 2px solid #76aeb3;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}
.factura-encabezado,
.iva-resumen {
  background: linear-gradient(135deg, #f2fafa, #ffffff);
}
.iva-fila {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 5px 0;
}
.base-fiscal {
  color: #315f64;
  font-size: 1.05rem;
}
.total-con-iva,
.total-pagar {
  font-size: 1.08rem;
}
.resta-iva {
  color: #8a5a21;
}
.importe-sin-iva {
  padding: 9px 0;
  color: #315f64;
}
.total-pagar {
  color: #174f55;
}
.iva-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #dceff0;
  color: #234e52;
  font-size: 1.15rem;
}
.iva-formula strong {
  font-size: 1.35rem;
}
@media (max-width: 599px) {
  .compra-dialog {
    width: 97vw;
    max-width: 97vw;
    border-radius: 14px;
  }
  .compra-form {
    max-height: 70vh;
  }
  .q-card__actions .q-btn {
    flex: 1 1 auto;
  }
}
</style>
