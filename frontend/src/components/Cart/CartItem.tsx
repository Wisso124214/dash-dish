import { Button } from "../ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "../../lib/types";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (newQuantity: number) => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const calculateItemTotal = () => {
    const extrasTotal = item.selectedExtras.reduce(
      (sum, extra) => sum + extra.cost,
      0
    );
    return (item.cost_unit + extrasTotal) * item.quantity;
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex gap-3">
        <img
          src={item.preview_img}
          alt={item.title}
          className="w-20 h-20 object-cover rounded-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{item.title}</h3>
          <p className="text-sm text-muted-foreground">
            ${item.cost_unit.toFixed(2)} each
          </p>
          {item.selectedExtras.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Extras:{" "}
              {item.selectedExtras
                .map((extra) => `${extra.name} (+$${extra.cost.toFixed(2)})`)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-bold">${calculateItemTotal().toFixed(2)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
