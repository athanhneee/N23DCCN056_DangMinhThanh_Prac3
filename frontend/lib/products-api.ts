import api from '@/lib/api';
import type {
  CreateProductPayload,
  DeleteProductResponse,
  Product,
} from '@/types/product';

export const productsQueryKey = ['products'] as const;

export async function getProducts() {
  const response = await api.get<Product[]>('/api/products');
  return response.data;
}

export async function createProduct(payload: CreateProductPayload) {
  const response = await api.post<Product>('/api/products', payload);
  return response.data;
}

export async function deleteProduct(id: Product['id']) {
  const response = await api.delete<DeleteProductResponse>(`/api/products/${id}`);
  return response.data;
}
