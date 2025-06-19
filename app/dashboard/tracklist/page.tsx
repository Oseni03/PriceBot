"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { type Product } from "@/types/products";
import { Plus, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Dummy products for demonstration
const dummyProducts: Product[] = [
	{
		id: "1",
		name: "Sony WH-1000XM4 Wireless Headphones",
		platform: "amazon",
		url: "https://amazon.com/example",
		prices: [{ amount: 29900, timestamp: new Date() }],
		target_price: 25000,
	},
	{
		id: "2",
		name: "MacBook Pro 14-inch",
		platform: "bestbuy",
		url: "https://bestbuy.com/example",
		prices: [{ amount: 179900, timestamp: new Date() }],
		target_price: 169900,
	},
	{
		id: "3",
		name: "PlayStation 5",
		platform: "walmart",
		url: "https://walmart.com/example",
		prices: [{ amount: 49900, timestamp: new Date() }],
		target_price: 45000,
	},
];

export default function TracklistPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [newProduct, setNewProduct] = useState({
		name: "",
		url: "",
		target_price: "",
	});
	const [error, setError] = useState<string | null>(null);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/products/user-products");
			if (response.ok) {
				const data = await response.json();
				setProducts(data);
			} else {
				console.error("Failed to fetch products");
			}
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleTrackProduct = async (url: string) => {
		try {
			setLoading(true);
			const response = await fetch("/api/products/user-products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			if (response.ok) {
				toast.success("Product tracked successfully!");
				fetchProducts();
			} else {
				toast.error("Failed to track product");
			}
		} catch (error) {
			console.error("Error tracking product:", error);
			toast.error("Error tracking product");
		} finally {
			setLoading(false);
		}
	};

	const handleUntrackProduct = async (id: string) => {
		try {
			setLoading(true);
			const response = await fetch(`/api/products/user-products?id=${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Product untracked successfully!");
				fetchProducts();
			} else {
				toast.error("Failed to untrack product");
			}
		} catch (error) {
			console.error("Error untracking product:", error);
			toast.error("Error untracking product");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleAddProduct = async () => {
		try {
			const response = await fetch("/api/products/user-products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: newProduct.url,
					userId: "current-user-id",
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to add product: ${response.statusText}`
				);
			}

			const data = await response.json();
			setProducts((prevProducts) => [...prevProducts, data]);
			setNewProduct({ name: "", url: "", target_price: "" });
			setIsAddDialogOpen(false);
		} catch (error) {
			console.error("Failed to add product:", error);
			setError("Failed to add product. Please try again later.");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-gray-600">Loading products...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Tracked Products</h2>
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
				>
					<DialogTrigger asChild>
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
							<Plus className="h-5 w-5 mr-2" />
							Add Product
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Product</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">
									Product Name
								</label>
								<Input
									placeholder="Enter product name"
									value={newProduct.name}
									onChange={(e) =>
										setNewProduct({
											...newProduct,
											name: e.target.value,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">
									Product URL
								</label>
								<Input
									placeholder="Enter product URL"
									value={newProduct.url}
									onChange={(e) =>
										setNewProduct({
											...newProduct,
											url: e.target.value,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">
									Target Price ($)
								</label>
								<Input
									type="number"
									placeholder="Enter target price"
									value={newProduct.target_price}
									onChange={(e) =>
										setNewProduct({
											...newProduct,
											target_price: e.target.value,
										})
									}
								/>
							</div>
							<Button
								className="w-full bg-purple-600 hover:bg-purple-700"
								onClick={handleAddProduct}
							>
								Add Product
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{products.map((product) => (
					<Card key={product.id} className="p-6">
						<div className="flex justify-between items-start">
							<div className="space-y-3 flex-1">
								<h3 className="font-medium text-lg">
									{product.name}
								</h3>
								<div className="text-sm text-muted-foreground">
									Platform: {product.platform}
								</div>
								{product.prices &&
									product.prices.length > 0 && (
										<div className="text-xl font-bold text-purple-600">
											$
											{(
												product.prices[0].amount / 100
											).toFixed(2)}
										</div>
									)}
								{product.target_price && (
									<div className="text-sm text-muted-foreground">
										Target: $
										{(product.target_price / 100).toFixed(
											2
										)}
									</div>
								)}
								<Button
									variant="outline"
									size="sm"
									className="mt-2"
									asChild
								>
									<a
										href={product.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center"
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										View Product
									</a>
								</Button>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVertical className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem>
										<Pencil className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-red-600"
										onClick={() =>
											handleUntrackProduct(product.id)
										}
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</Card>
				))}
			</div>

			{products.length === 0 && (
				<div className="text-center py-12 bg-gray-50 rounded-lg">
					<div className="text-gray-500">
						No tracked products found.
					</div>
					<Button
						className="mt-4 bg-purple-600 hover:bg-purple-700"
						onClick={() => setIsAddDialogOpen(true)}
					>
						<Plus className="h-5 w-5 mr-2" />
						Start Tracking Products
					</Button>
				</div>
			)}
		</div>
	);
}
