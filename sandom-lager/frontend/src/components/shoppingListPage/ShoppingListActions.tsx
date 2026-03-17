import * as XLSX from 'xlsx';
import type { ShoppingListItem } from '../../types';

interface Props {
    items: ShoppingListItem[];
}

export default function ShoppingListActions({ items }: Props) {

    const exportToExcel = () => {

        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Handleliste");
        XLSX.writeFile(workbook, "handleliste.xlsx");
    };

    return (
        <div className="flex gap-3">

            // Button to trigger print 
            <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-md"
                style={{ 
                    background: "var(--color-secondary-surface)",
                    border: "1px solid var(--color-border)",
                    }}>
                Skriv ut
            </button>


            <button
                onClick={exportToExcel}
                className="py-2 px-4 rounded-md"
                style={{ 
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    }}
            >
                Eksporter til Excel
            </button>
        </div>
    );
}