import { authRoutes } from "@/modules/auth/routes";
import { authGuard } from "@/modules/auth/guards/authGuard";
import HomePage from "@/modules/landing/pages/HomePage.vue";
import { productRoutes } from "@/modules/products/routes";
import { shoppingListsRoutes } from "@/modules/shopping-lists/routes";
import { clearAuth } from "@/modules/auth/utils/token";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/modules/landing/layouts/LandingLayout.vue"),
      children: [
        {
          path: "/",
          name: "home",
          component: HomePage,
        },
        {
          path: "/about",
          name: "about",
          component: () => import("@/modules/landing/pages/AboutPage.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("@/modules/auth/pages/ProfilePage.vue"),
          beforeEnter: [authGuard],
        },
        ...productRoutes,
        ...shoppingListsRoutes,
      ],
    },
    authRoutes,
    {
      path: "/logout",
      name: "logout",
      beforeEnter: () => {
        clearAuth();
        return { name: "home" };
      },
      component: () => import("@/modules/auth/pages/LogoutPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/common/components/NotFound.vue"),
    },
  ],
});

export default router;
