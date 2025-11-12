import { useAtom } from "jotai";
import { cartAtom } from "../../lib/atoms";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import CartItem from "./CartItem";
import { SERVER_URL } from "../../../config";
import { useState } from "react";

export default function Cart() {
  const [cart, setCart] = useAtom(cartAtom);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const removeItem = (index: number) => {
    const removedItem = cart[index];
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    toast.success(`Removed ${removedItem.title} from cart`);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const extrasTotal = item.selectedExtras.reduce(
        (total, extra) => total + extra.cost,
        0
      );
      return sum + (item.cost_unit + extrasTotal) * item.quantity;
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);

    try {
      // Transform cart items to match backend schema
      const items = cart.map((item) => ({
        id_dish: item._id,
        quantity: item.quantity,
        selected_extras: item.selectedExtras.map((extra) => ({
          name: extra.name,
          cost: extra.cost,
        })),
      }));

      const orderData = {
        items,
        type: "delivery",
      };

      const response = await fetch(`${SERVER_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookies
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const order = await response.json();

      // Clear cart on success
      setCart([]);
      toast.success(`Order created successfully! Order ID: ${order._id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-sm">
                Add some delicious dishes to get started!
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                onUpdateQuantity={(newQuantity) =>
                  updateQuantity(index, newQuantity)
                }
                onRemove={() => removeItem(index)}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
                disabled={isCheckingOut}
              >
                Clear Cart
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
