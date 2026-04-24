import type { ShoppingListItem } from "./shopping-list-item.model";

export type ShoppingList = {
  shoppingListId: string;
  title: string;
  date: string;
  items: ShoppingListItem[];
};
