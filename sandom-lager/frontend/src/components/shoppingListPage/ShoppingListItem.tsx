import type { ShoppingListItem } from "../../types";

interface Props {
    item: ShoppingListItem;
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
}

export default function ShoppingListItem({ item, onIncrease, onDecrease }: Props) {

    return (
        <li
        className="flex items-center justify-between rounded-xl p-4"
        style={{
             background: "var(--color-surface)",
             border: "1px solid var(--color-border)",
             }}>

            <div className="flex flex-col gap-4">
                <strong style={{
                    color: "var(--color-text-primary)"}}>
                    {item.ingredient}
                </strong>

                <span className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                        {item.needed_quantity} {item.unit}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onDecrease(item.id)}
                    className="h-9 w-9 rounded-full text-lg transition-colors"
                    style={{
                        background: "var(--color-secondary-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                    aria-label={`Reduser mengde for ${item.ingredient}`}>
                    -
                </button>

                <button
                    onClick={() => onIncrease(item.id)}
                    className="h-9 w-9 rounded-full text-lg transition-colors"
                    style={{
                        background: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                    }}
                    aria-label={`Øk mengde for ${item.ingredient}`}>
                    +
                </button>
            </div>
        </li>
    );
}