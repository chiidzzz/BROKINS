const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/LoginPage.vue"),
        name: "login",
      },
      {
        path: "/welcome",
        component: () => import("pages/WelcomePage.vue"),
        name: "welcome",
      },
      {
        path: "/clients",
        component: () => import("pages/ClientsTablePage.vue"),
        name: "clients",
      },
      {
        path: "/reports",
        component: () => import("src/pages/ReportsPage.vue"),
        name: "reports",
      },
      {
        path: "/users",
        name: "users",
        component: () => import("pages/UsersPage.vue"),
      },
      {
        path: "/policies",
        component: () => import("pages/PoliciesPage.vue"),
        name: "policies",
      },
      {
        path: "/policy-types",
        name: "policy-types",
        component: () => import("pages/PolicyTypesPage.vue"),
      },
      {
        path: "/insurance-providers",
        component: () => import("pages/InsuranceProvidersPage.vue"),
        name: "insurance-providers",
      },
      {
        path: "/policy-categories",
        component: () => import("pages/PolicyCategoriesPage.vue"),
        name: "policy-categories",
        meta: { title: "Policy Categories" },
      },
      {
        path: "/vehicles",
        component: () => import("pages/VehiclesPage.vue"),
        name: "vehicles",
        meta: { label: "Vehicles" },
      },
      {
        path: "/vehicle-makes",
        component: () => import("pages/vehicleMake.vue"),
        name: "vehicle-makes",
        meta: { label: "Vehicle Makes" },
      },
      {
        path: "/vehicle-models",
        component: () => import("pages/vehicleModel.vue"),
        name: "vehicle-models",
        meta: { label: "Vehicle Models" },
      },
      {
        path: "/vehicle-types",
        component: () => import("pages/vehicleType.vue"),
        name: "vehicle-types",
        meta: { label: "Vehicle Types" },
      },
      {
        path: "/vehicle-usages",
        component: () => import("pages/vehicleUsage.vue"),
        name: "vehicle-usages",
        meta: { label: "Vehicle Usages" },
      },
      {
        path: "/brokers",
        component: () => import("src/pages/BrokersPage.vue"),
        name: "brokers",
        meta: { label: "Brokers" },
      },
    ],
  },

  // Always leave this as the last one
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
