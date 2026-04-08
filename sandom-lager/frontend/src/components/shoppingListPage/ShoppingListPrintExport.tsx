import * as XLSX from 'xlsx';
import type { ShoppingListItem } from '../../types';

interface Props {
    items: ShoppingListItem[];
}

export default function ShoppingListPrintExport({ items }: Props) {

    const exportToExcel = () => {
        // Format data with proper headers
        const formattedData = items.map(item => ({
            "Vare": item.ingredient,
            "Mengde": item.needed_quantity,
            "Enhet": item.unit,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Set column widths
        worksheet['!cols'] = [
            { wch: 35 },  // Vare
            { wch: 12 },  // Mengde
            { wch: 12 },  // Enhet
        ];

        // Style header row
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
            };
        }

        // Add autofilter
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Handleliste`);
        
        const filename = `handleliste-${new Date().toLocaleDateString('no-NO').replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    return (
        <div className="flex gap-3">

            {/* Button to trigger print */}
            <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-md"
                style={{ 
                    background: "var(--color-secondary-surface)",
                    border: "1px solid var(--color-border)",
                    }}>
                Skriv ut
            </button>

            {/* Button to trigger Excel export */}
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