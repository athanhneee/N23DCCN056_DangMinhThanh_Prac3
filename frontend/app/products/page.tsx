'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/api';
import { createProduct, deleteProduct, getProducts, productsQueryKey } from '@/lib/products-api';
import type {
    CreateProductPayload,
    DeleteProductResponse,
    Product,
} from '@/types/product';

type DeleteContext = {
    previousProducts: Product[];
};

function formatPrice(price: number) {
    const normalizedPrice = Number(price);

    if (!Number.isFinite(normalizedPrice)) {
        return 'Không xác định';
    }

    return `${normalizedPrice.toLocaleString('vi-VN')} VNĐ`;
}

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const productsQuery = useQuery<Product[]>({
        queryKey: productsQueryKey,
        queryFn: getProducts,
    });

    const createMutation = useMutation<Product, unknown, CreateProductPayload>({
        mutationFn: createProduct,
        onSuccess: async (newProduct) => {
            queryClient.setQueryData<Product[]>(productsQueryKey, (currentProducts) => [
                newProduct,
                ...(currentProducts ?? []),
            ]);
            setName('');
            setPrice('');
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
        },
    });

    const deleteMutation = useMutation<DeleteProductResponse, unknown, number, DeleteContext>({
        mutationFn: deleteProduct,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: productsQueryKey });

            const previousProducts = queryClient.getQueryData<Product[]>(productsQueryKey) ?? [];

            queryClient.setQueryData<Product[]>(
                productsQueryKey,
                previousProducts.filter((product) => product.id !== id),
            );

            return { previousProducts };
        },
        onSuccess: () => {
            toast.success('Đã xoá sản phẩm');
        },
        onError: (error, _id, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData<Product[]>(productsQueryKey, context.previousProducts);
            }

            toast.error(getErrorMessage(error, 'Xoá thất bại, thử lại!'));
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: productsQueryKey });
        },
    });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        const parsedPrice = Number(price);

        if (!trimmedName) {
            toast.error('Tên sản phẩm không được rỗng');
            return;
        }

        if (price.trim() === '') {
            toast.error('Giá sản phẩm là bắt buộc');
            return;
        }

        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            toast.error('Giá sản phẩm không hợp lệ');
            return;
        }

        await toast.promise(
            createMutation.mutateAsync({
                name: trimmedName,
                price: parsedPrice,
            }),
            {
                loading: 'Đang lưu...',
                success: 'Thêm sản phẩm thành công!',
                error: (error) => getErrorMessage(error, 'Có lỗi xảy ra!'),
            },
        );
    }

    function handleDelete(id: number) {
        if (!window.confirm('Bạn chắc chắn muốn xoá?')) {
            return;
        }

        deleteMutation.mutate(id);
    }

    const products = productsQuery.data ?? [];
    const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

    return (
        <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <section className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <span className="inline-flex w-fit items-center rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                                Lab 3
                            </span>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                    Trang quản lý sản phẩm
                                </h1>

                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Tổng sản phẩm</p>
                                <p className="mt-2 text-2xl font-semibold">{products.length}</p>
                            </div>
                            <div className="rounded-2xl bg-teal-50 px-4 py-3 text-teal-700">
                                <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Trạng thái</p>
                                <p className="mt-2 text-sm font-medium">
                                    {productsQuery.isFetching ? 'Đang đồng bộ...' : 'Sẵn sàng thao tác'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <section className="space-y-4">
                            {productsQuery.isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-24 animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100"
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {productsQuery.isError ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
                                    <p className="text-sm font-semibold">Không thể tải danh sách sản phẩm</p>
                                    <p className="mt-2 text-sm">
                                        {getErrorMessage(productsQuery.error, 'Vui lòng kiểm tra backend và thử lại.')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => productsQuery.refetch()}
                                        className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : null}

                            {!productsQuery.isLoading && !productsQuery.isError ? (
                                <>
                                    {products.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                                            Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên bằng form bên phải.
                                        </div>
                                    ) : null}

                                    {products.map((product) => (
                                        <article
                                            key={product.id}
                                            className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="space-y-1">
                                                <h2 className="text-lg font-semibold text-slate-950">{product.name}</h2>
                                                <p className="text-sm text-slate-500">{formatPrice(product.price)}</p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {deletingId === product.id ? 'Đang xoá...' : 'Xoá'}
                                            </button>
                                        </article>
                                    ))}
                                </>
                            ) : null}
                        </section>

                        <aside className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-5 sm:p-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                        Thêm sản phẩm
                                    </p>
                                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                                        Form gửi dữ liệu lên backend
                                    </h2>

                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Tên sản phẩm</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="Ví dụ: Balo đa năng"
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                            disabled={createMutation.isPending}
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Giá</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={price}
                                            onChange={(event) => setPrice(event.target.value)}
                                            placeholder="Ví dụ: 299000"
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                            disabled={createMutation.isPending}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        {createMutation.isPending ? 'Đang thêm...' : 'Thêm sản phẩm'}
                                    </button>
                                </form>


                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </main>
    );
}
