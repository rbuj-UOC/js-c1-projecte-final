import type { RouteRecordRaw } from "vue-router";
import { authGuard } from "@/modules/auth/guards/authGuard";

export const productRoutes: RouteRecordRaw[] = [
  {
    path: "/products",
    name: "products",
    component: () => import("@/modules/products/pages/ProductsList.vue"),
    beforeEnter: [authGuard],
  },
  {
    path: "/products/:id",
    name: "product-detail",
    component: () => import("@/modules/products/pages/ProductDetail.vue"),
    props: true,
    beforeEnter: [authGuard],
  },
];
