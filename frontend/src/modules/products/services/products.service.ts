import apiClient from "@/api/apiClient";
import type { CreateProductDto } from "../models/create-product.dto";
import type { Product } from "../models/product.model";
import type { ProductUnit } from "../models/product-unit.model";
import type { UpdateProductDto } from "../models/update-product.dto";

export async function getProducts() {
  const { data } = await apiClient.get<Product[]>("/products");
  return data;
}

export async function getProductById(id: string) {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: CreateProductDto) {
  const { data } = await apiClient.post<Product>("/products", payload);
  return data;
}

export async function updateProduct(id: string, payload: UpdateProductDto) {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  await apiClient.delete(`/products/${id}`);
}

export async function getProductUnits() {
  const { data } = await apiClient.get<ProductUnit[]>("/products/units");
  return data;
}
