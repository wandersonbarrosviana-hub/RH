import React, { useState, useRef, useEffect } from 'react';

interface MultiMonthPickerProps {
    selectedDates: string[]; // ['yyyy-mm', 'yyyy-mm']
    onChange: (dates: string[]) => void;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const MultiMonthPicker: React.FC<MultiMonthPickerProps> = ({ selectedDates, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Determine initial year from first selected date, or current year
    const initialYear = selectedDates.length > 0
        ? parseInt(selectedDates[0].split('-')[0])
        : new Date().getFullYear();
    const [year, setYear] = useState(initialYear);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDate = (monthIndex: number) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        const dateStr = `${year}-${monthStr}`;

        let newDates;
        if (selectedDates.includes(dateStr)) {
            newDates = selectedDates.filter(d => d !== dateStr);
        } else {
            newDates = [...selectedDates, dateStr].sort();
        }
        onChange(newDates);
    };

    const isSelected = (monthIndex: number) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        return selectedDates.includes(`${year}-${monthStr}`);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="w-full p-2 border border-gray-300 rounded-md text-sm cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    {selectedDates.length === 0 ? (
                        <span className="text-gray-400">Selecionar Períodos...</span>
                    ) : (
                        <span className="text-gray-900">{selectedDates.length} período(s) selecionado(s)</span>
                    )}
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Selected Chips Area (Optional, keeping it outside or inside trigger? User asked to select multiple without closing) */}
            {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDates.map(date => (
                        <span key={date} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                            {date}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(selectedDates.filter(d => d !== date));
                                }}
                                className="ml-1 text-pink-600 hover:text-pink-900 focus:outline-none"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => setYear(year - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            &lt;
                        </button>
                        <span className="font-semibold text-gray-900">{year}</span>
                        <button
                            onClick={() => setYear(year + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            &gt;
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => toggleDate(index)}
                                className={`
                                    px-2 py-2 text-sm rounded-md transition-colors
                                    ${isSelected(index)
                                        ? 'bg-pink-500 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'}
                                `}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
