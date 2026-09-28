const routes = [
  {
    path: '/bienvenida',
    component: () => import('pages/BienvenidaPage.vue'),
    meta: { public: true, guestOnly: true },
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { public: true, guestOnly: true },
  },
  {
    path: '/registro',
    component: () => import('pages/RegistroPage.vue'),
    meta: { public: true, guestOnly: true },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'usuarios',
        meta: { permission: 'usuarios.ver' },
        component: () => import('pages/UsuariosPage.vue'),
      },
      {
        path: '/productos',
        meta: { permission: 'productos.ver' },
        component: () => import('pages/ProductosPage.vue'),
      },
      {
        path: 'compras',
        meta: { permission: 'compras.ver' },
        component: () => import('pages/ComprasPage.vue'),
      },
      {
        path: 'categorias',
        meta: { permission: 'categorias.ver' },
        component: () => import('pages/CategoriasPage.vue'),
      },
      {
        path: 'ventas',
        meta: { permission: 'ventas.ver' },
        component: () => import('pages/VentasPage.vue'),
      },
      {
        path: 'inventario',
        meta: { permission: 'inventario.ver' },
        component: () => import('pages/InventarioPage.vue'),
      },
      {
        path: 'gastos',
        meta: { permission: 'gastos.ver' },
        component: () => import('pages/GastosPage.vue'),
      },
      {
        path: 'utilidad',
        meta: { permission: 'reportes.ver' },
        component: () => import('pages/UtilidadPage.vue'),
      },
      {
        path: 'impuestos',
        meta: { permission: 'impuestos.ver' },
        component: () => import('pages/ImpuestosPage.vue'),
      },
      {
        path: 'auditoria',
        meta: { permission: 'configuracion.ver' },
        component: () => import('pages/AuditoriaPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
