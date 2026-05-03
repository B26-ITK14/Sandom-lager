import writeXlsxFile, { type SheetData } from 'write-excel-file/browser';
import { Printer, FileSpreadsheet } from 'lucide-react';
import type { ShoppingListItem } from '../../types';

interface Props {
    items: ShoppingListItem[];
}

export default function ShoppingListPrintExport({ items }: Props) {

    const exportToExcel = async () => {
        const sheetData: SheetData = [
            [
                { value: 'Vare', fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: '#4472C4', align: 'center' },
                { value: 'Mengde', fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: '#4472C4', align: 'center' },
                { value: 'Enhet', fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: '#4472C4', align: 'center' },
            ],
            ...items.map(item => [
                { value: item.ingredient },
                { value: item.needed_quantity },
                { value: item.unit },
            ]),
        ];

        const blob = await writeXlsxFile(sheetData, {
            sheet: 'Handleliste',
            columns: [
                { width: 35 },
                { width: 12 },
                { width: 12 },
            ],
            showGridLines: true,
            stickyRowsCount: 1,
        }).toBlob();

        const url = URL.createObjectURL(blob);
        const filename = `handleliste-${new Date().toLocaleDateString('no-NO').replace(/\//g, '-')}.xlsx`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex gap-2">

            {/* Button to trigger print */}
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md cursor-pointer"
                style={{ 
                    background: "var(--color-secondary-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                }}
                title="Skriv ut handlelisten"
            >
                <Printer size={20} />
                <span>Skriv ut</span>
            </button>

            {/* Button to trigger Excel export */}
            <button
                onClick={exportToExcel}
                className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md cursor-pointer"
                style={{ 
                    background: "#10b981",
                    color: "white",
                }}
                title="Eksporter til Excel-fil"
            >
                <FileSpreadsheet size={20} />
                <span>Excel</span>
            </button>
        </div>
    );
}