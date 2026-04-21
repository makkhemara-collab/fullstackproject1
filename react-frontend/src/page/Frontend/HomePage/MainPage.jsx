import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import request from "../../../utils/request";

const API_BASE_URL = "http://localhost:3000";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"; // Coffee fallback

const formatPrice = (value) => {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
};

const MainPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [addedToCart, setAddedToCart] = useState(null);
    const { addToCart, getCartCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();

    const handleAddToCart = (item) => {
        if (!isAuthenticated()) {
            setShowLoginModal(true);
            return;
        }
        addToCart({ ...item, images: [item.image] });
        setAddedToCart(item.id);
        setTimeout(() => setAddedToCart(null), 2000);
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const response = await request("api/product", "GET");
                const rows = Array.isArray(response?.data) ? response.data : [];

                const mappedProducts = rows.map((item) => ({
                    id: item.prd_id,
                    brand: item.category_id || "House Blend",
                    name: item.prd_name || item.prd_id || "Unnamed Drink",
                    price: formatPrice(item.unit_cost),
                    rating: ["star", "star", "star", "star", "star"],
                    lastStarMuted: true,
                    image: item.photo ? `${API_BASE_URL}${item.photo}` : FALLBACK_IMAGE,
                    alt: item.prd_name || "Drink image",
                }));

                setProducts(mappedProducts);
            } catch (error) {
                setErrorMessage(error?.response?.data?.message || "Cannot load menu from API");
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-text-light dark:bg-background-dark dark:text-text-dark">
            <header className="sticky top-0 z-50 flex items-center justify-center whitespace-nowrap border-b border-border-light bg-background-light/80 backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/80">
                <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-accent dark:text-accent">
                            <span className="material-symbols-outlined text-3xl">local_cafe</span>
                            <h1 className="text-xl font-bold">ClubCode Café</h1>
                        </div>
                        <nav className="hidden items-center gap-8 md:flex">
                            <a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">Home</a>
                            <a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">Menu</a>
                            <a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">Our Story</a>
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-4">
                        <div className="relative hidden w-full max-w-xs items-center sm:flex">
                            <span className="material-symbols-outlined absolute left-3 text-subtle-light dark:text-subtle-dark">search</span>
                            <input
                                className="w-full rounded-lg border-border-light bg-card-light py-2 pl-10 pr-4 text-sm focus:border-accent focus:ring-accent dark:border-border-dark dark:bg-card-dark"
                                placeholder="Search drinks & pastries..."
                                type="text"
                            />
                        </div>
                        {isAuthenticated() ? (
                            <div className="relative group">
                                <button className="flex h-10 items-center gap-2 rounded-lg px-3 hover:bg-black/5 dark:hover:bg-white/5">
                                    <span className="material-symbols-outlined">person</span>
                                    <span className="hidden text-sm font-medium sm:inline">{user?.name?.split(' ')[0]}</span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg bg-card-light shadow-lg group-hover:block dark:bg-card-dark">
                                    <div className="p-3 border-b border-border-light dark:border-border-dark">
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-subtle-light dark:text-subtle-dark">{user?.email}</p>
                                    </div>
                                    <Link to="/index/orders" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                                        <span className="material-symbols-outlined text-base">receipt_long</span>
                                        Order History
                                    </Link>
                                    <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-black/5 dark:hover:bg-white/5">
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/index/login" className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90">
                                <span className="material-symbols-outlined text-base">login</span>
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}
                        <Link to="/index/cart" className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {getCartCount() > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <section className="mb-12">
                    <div
                        className="relative flex min-h-[400px] items-center justify-center rounded-xl bg-cover bg-center bg-no-repeat p-8 text-center"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
                        }}
                    >
                        <div className="flex max-w-2xl flex-col gap-4">
                            <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                                Freshly Brewed, <br /> Just For You.
                            </h2>
                            <p className="text-base text-white/90 md:text-lg">
                                Order ahead to skip the line. Discover our artisanal coffees and fresh pastries.
                            </p>
                            <div className="mt-4 flex justify-center">
                                <button className="flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-bold text-white shadow-lg transition-transform hover:scale-105">
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside className="col-span-1 lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="mb-4 text-xl font-bold">Menu</h3>
                            <div className="space-y-6">
                                <details className="group" open>
                                    <summary className="flex cursor-pointer items-center justify-between py-2 font-medium">
                                        Categories
                                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                                    </summary>
                                    <div className="space-y-2 pt-2">
                                        <label className="flex items-center gap-2"><input defaultChecked className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Coffee</label>
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Tea & Matchas</label>
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Smoothies</label>
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Bakery</label>
                                    </div>
                                </details>

                                <div className="border-t border-border-light pt-6 dark:border-border-dark">
                                    <p className="mb-4 font-medium">Roast Type</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Light Roast</label>
                                        <label className="flex items-center gap-2"><input defaultChecked className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Medium Roast</label>
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Dark Roast</label>
                                        <label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Decaf</label>
                                    </div>
                                </div>

                                <div className="flex gap-4 border-t border-border-light pt-6 dark:border-border-dark">
                                    <button className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-white">Apply Filters</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="col-span-1 lg:col-span-3">
                        {isLoading && <p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">Loading menu...</p>}
                        {!isLoading && errorMessage && <p className="mb-4 text-sm text-red-500">{errorMessage}</p>}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {products.map((item) => (
                                <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-card-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-card-dark">
                                    <Link className="flex flex-grow flex-col" to={`/index/product/${item.id}`}>
                                        <div className="aspect-square w-full overflow-hidden bg-gray-100">
                                            <img className="h-full w-full object-cover transition-transform group-hover:scale-105" src={item.image} alt={item.alt} />
                                        </div>
                                        <div className="flex flex-grow flex-col p-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent">{item.brand}</h4>
                                            <h3 className="mt-1 truncate text-lg font-bold">{item.name}</h3>
                                            <p className="mt-auto pt-2 text-xl font-bold">{item.price}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleAddToCart(item); }}
                                        className={`absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition-all ${
                                            addedToCart === item.id ? "bg-green-500 opacity-100" : "bg-accent opacity-0 group-hover:opacity-100"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined">
                                            {addedToCart === item.id ? "check" : "add"}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-auto border-t border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-subtle-light dark:text-subtle-dark sm:px-6 lg:px-8">
                    <p>© 2026 ClubCode Café. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;