import { useEffect, useState } from "react";
import { useSelectedDish } from "../DishList/SelectedDishContext";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAtom } from "jotai";
import { cartAtom } from "../../lib/atoms";
import { toast } from "sonner";
import type { CartItem } from "../../lib/types";
import type { Dish } from "../../lib/types";

const orderSchema = z.object({
  quantity: z.number().int().positive().min(1, "Quantity must be at least 1"),
  selectedExtras: z.array(z.string()),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function DetailsOrder(data: Dish) {
  const { setSelectedDish } = useSelectedDish();
  const [totalCost, setTotalCost] = useState<Dish["cost_unit"]>(data.cost_unit);
  const [cart, setCart] = useAtom(cartAtom);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      selectedExtras: [],
    },
  });

  const quantity = form.watch("quantity");
  const selectedExtras = form.watch("selectedExtras");

  useEffect(() => {
    const extrasData = data.extras.filter((extra) =>
      selectedExtras.includes(extra.name)
    );
    const extrasCost = extrasData.reduce((sum, extra) => sum + extra.cost, 0);
    const newTotal = (data.cost_unit + extrasCost) * quantity;
    setTotalCost(newTotal);
  }, [quantity, selectedExtras, data]);

  const handleClose = () => {
    setSelectedDish(null);
  };

  const onSubmit = async (formData: OrderFormValues) => {
    const selectedExtrasData = data.extras.filter((extra) =>
      formData.selectedExtras.includes(extra.name)
    );

    const cartItem: CartItem = {
      _id: data._id,
      title: data.title,
      description: data.description,
      cost_unit: data.cost_unit,
      categories: data.categories,
      extras: data.extras,
      preview_img: data.preview_img,
      quantity: formData.quantity,
      selectedExtras: selectedExtrasData,
    };

    // Check if item with same dish and extras already exists
    const existingItemIndex = cart.findIndex(
      (item) =>
        item._id === cartItem._id &&
        JSON.stringify(item.selectedExtras.map((e) => e.name).sort()) ===
          JSON.stringify(cartItem.selectedExtras.map((e) => e.name).sort())
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += cartItem.quantity;
      setCart(updatedCart);
      toast.success(`Updated ${data.title} quantity in cart`);
    } else {
      // Add new item to cart
      setCart([...cart, cartItem]);
      toast.success(`Added ${data.title} to cart`);
    }

    handleClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <div className="overflow-y-auto max-h-[90vh]">
          <div className="relative h-80">
            <img
              src={data.preview_img}
              alt={data.title}
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 flex items-end p-6 bg-linear-to-t from-black/60 to-transparent">
              <h2 className="font-bold text-4xl text-white line-clamp-2">
                {data.title}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-muted-foreground">{data.description}</p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {data.extras.length > 0 && (
                  <FormField
                    control={form.control}
                    name="selectedExtras"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-2xl font-bold">
                          Extras
                        </FormLabel>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {data.extras.map((extra, index) => (
                            <FormField
                              key={index}
                              control={form.control}
                              name="selectedExtras"
                              render={({ field }) => (
                                <FormItem>
                                  <Label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          extra.name
                                        )}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [...field.value, extra.name]
                                            : field.value.filter(
                                                (value) => value !== extra.name
                                              );
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex justify-between flex-1">
                                      <span>{extra.name}</span>
                                      <span className="font-semibold">
                                        +${extra.cost.toFixed(2)}
                                      </span>
                                    </div>
                                  </Label>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-3xl">
                          ${totalCost.toFixed(2)}
                        </span>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                field.onChange(Math.max(1, field.value - 1))
                              }
                            >
                              -
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {field.value}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full text-lg font-bold"
                  size="lg"
                >
                  Add to Order
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
