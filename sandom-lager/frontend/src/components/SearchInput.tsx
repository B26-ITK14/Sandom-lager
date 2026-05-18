/*
    * SearchInput.tsx
    * A reusable search input component that includes a search icon and handles user input for searching functionality across the application.
    * The component is designed to be flexible, allowing for customization of the placeholder text and handling of input changes through props.
    * Author: Sebastian Thomsen
*/

interface SearchInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ id, value, onChange, placeholder }: SearchInputProps) {
    return (
        <label htmlFor={id} className="flex-1 relative">
            <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
                id={id}
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full text-sm outline-none"
                style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                }}
            />
        </label>
    );
}
