import { createContext, useEffect, useState } from "react";
import { food_list, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = "http://localhost:4000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");
    const currency = "₹";
    const deliveryCharge = 50;

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }

        if (token) {
            try {
                await axios.post(`${url}/api/cart/add`, { itemId }, { headers: { token } });
            } catch (error) {
                console.error("Error adding item to cart:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        if (cartItems[itemId] > 1) {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        } else {
            const updatedCart = { ...cartItems };
            delete updatedCart[itemId];
            setCartItems(updatedCart);
        }

        if (token) {
            try {
                await axios.post(`${url}/api/cart/remove`, { itemId }, { headers: { token } });
            } catch (error) {
                console.error("Error removing item from cart:", error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
                if (cartItems[item] > 0) {
                    const itemInfo = food_list.find((product) => product._id === item);
                    if (itemInfo) {
                        totalAmount += itemInfo.price * cartItems[item];
                    }
                }
            } catch (error) {
                console.error("Error calculating total cart amount:", error);
            }
        }
        return totalAmount;
    };

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(`${url}/api/cart/get`, {}, { headers: { token } });
            setCartItems(response.data.cartData || {});
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                await fetchFoodList();
                const storedToken = localStorage.getItem("token");
                if (storedToken) {
                    setToken(storedToken);
                    await loadCartData(storedToken);
                }
            } catch (error) {
                console.error("Error during initialization:", error);
            }
        }
        loadData();
    }, []);

    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currency,
        deliveryCharge,
        paymentMethod: "Cash on Delivery", // Fixed payment method
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
