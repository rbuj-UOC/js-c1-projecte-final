import type { Product } from "@/modules/products/models/product.model";

export type ShoppingListItem = {
  shoppingListItemId: string;
  quantity: string;
  price: string;
  product: Product;
};
