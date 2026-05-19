/*
    * ShoppingListHistory.tsx
    * A component that displays the history of deleted shopping lists, grouped by batch. Each batch shows the deletion date, the user who deleted it, and the items that were in the shopping list at the time of deletion.
    * The component handles loading states and displays appropriate messages when there are no deleted shopping lists to show.
    * Author: Andreas Skaarberg
*/

import type { ShoppingListHistoryRow } from "../../types";
import { useState } from "react";

interface Props {
    rows: ShoppingListHistoryRow[];
    isLoading: boolean;
}

interface HistoryBatch {
    batchId: number;
    deletedAt: string;
    deletedBy: string;
    actionType: "deleted" | "updated";
    items: ShoppingListHistoryRow[];
}

function groupRows(rows: ShoppingListHistoryRow[]): HistoryBatch[] {
    const map = new Map<number, HistoryBatch>();

    for (const row of rows) {
        const existing = map.get(row.batch_id);
        const deletedBy = row.deleted_by_name || "Ukjent bruker";

        if (!existing) {
            map.set(row.batch_id, {
                batchId: row.batch_id,
                deletedAt: row.deleted_at,
                deletedBy,
                actionType: row.action_type,
                items: [row],
            });
            continue;
        }

        existing.items.push(row);
    }

    return Array.from(map.values());
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(value);
}

export default function ShoppingListHistory({ rows, isLoading }: Props) {
    const batches = groupRows(rows);
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section
            aria-label="Handleliste historikk"
            className="rounded-xl p-4"
            style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
            }}>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Historikk
                </h2>

                <button
                    type="button"
                    onClick={() => setIsOpen((current) => !current)}
                    aria-expanded={isOpen}
                    aria-controls="shopping-list-history-content"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition-opacity cursor-pointer hover:opacity-80"
                    style={{
                        background: "var(--color-secondary-surface)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    {isOpen ? "Skjul" : "Vis"}
                </button>
            </div>

            {isOpen && isLoading ? (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Laster historikk...
                </p>
            ) : isOpen ? (
                <div id="shopping-list-history-content">
                    {batches.length === 0 ? (
                        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Ingen tidligere slettede handlelister ennå.
                        </p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3">
                            {batches.map((batch) => (
                                <article
                                    key={batch.batchId}
                                    className="rounded-lg p-3"
                                    style={{
                                        background: "var(--color-secondary-surface)",
                                        border: "1px solid var(--color-border)",
                                    }}>
                                    <header className="mb-2">
                                        <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                                            {batch.actionType === "updated" ? "Oppdatert" : "Slettet"}: {new Date(batch.deletedAt).toLocaleString("nb-NO")}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                            Av: {batch.deletedBy}
                                        </p>
                                    </header>

                                    <ul className="flex flex-col gap-1">
                                        {batch.items.map((item, idx) => (
                                            <li key={`${batch.batchId}-${idx}`} className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                                                {item.ingredient}: {formatNumber(item.needed_quantity)} {item.unit} (lager: {formatNumber(item.stock_quantity)} {item.unit})
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
}
