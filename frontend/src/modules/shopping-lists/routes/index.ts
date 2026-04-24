import type { RouteRecordRaw } from "vue-router";
import { authGuard } from "@/modules/auth/guards/authGuard";

export const shoppingListsRoutes: RouteRecordRaw[] = [
  {
    path: "/shopping-lists",
    name: "shopping-lists",
    component: () => import("@/modules/shopping-lists/pages/ShoppingListsPage.vue"),
    beforeEnter: [authGuard],
  },
  {
    path: "/shopping-lists/:id",
    name: "shopping-list-detail",
    component: () => import("@/modules/shopping-lists/pages/ShoppingListDetail.vue"),
    props: true,
    beforeEnter: [authGuard],
  },
];
