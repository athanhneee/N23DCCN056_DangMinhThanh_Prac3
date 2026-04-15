export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
}

export interface DeleteProductResponse {
  message: string;
}
