import apiClient from "@/api/apiClient";
import type { CreateShoppingListDto } from "../models/create-shopping-list.dto";
import type { CreateShoppingListItemDto } from "../models/create-shopping-list-item.dto";
import type { ShoppingList } from "../models/shopping-list.model";
import type { UpdateShoppingListDto } from "../models/update-shopping-list.dto";
import type { UpdateShoppingListItemDto } from "../models/update-shopping-list-item.dto";

export async function getShoppingLists() {
  const { data } = await apiClient.get<ShoppingList[]>("/shopping-lists");
  return data;
}

export async function getShoppingListById(id: string) {
  const { data } = await apiClient.get<ShoppingList>(`/shopping-lists/${id}`);
  return data;
}

export async function createShoppingList(payload: CreateShoppingListDto) {
  const { data } = await apiClient.post<ShoppingList>("/shopping-lists", payload);
  return data;
}

export async function updateShoppingList(id: string, payload: UpdateShoppingListDto) {
  const { data } = await apiClient.patch<ShoppingList>(`/shopping-lists/${id}`, payload);
  return data;
}

export async function deleteShoppingList(id: string) {
  await apiClient.delete(`/shopping-lists/${id}`);
}

export async function addShoppingListItem(listId: string, payload: CreateShoppingListItemDto) {
  const { data } = await apiClient.post<ShoppingList>(`/shopping-lists/${listId}/items`, payload);
  return data;
}

export async function updateShoppingListItem(
  listId: string,
  itemId: string,
  payload: UpdateShoppingListItemDto,
) {
  const { data } = await apiClient.patch<ShoppingList>(
    `/shopping-lists/${listId}/items/${itemId}`,
    payload,
  );
  return data;
}

export async function deleteShoppingListItem(listId: string, itemId: string) {
  const { data } = await apiClient.delete<ShoppingList>(
    `/shopping-lists/${listId}/items/${itemId}`,
  );
  return data;
}
