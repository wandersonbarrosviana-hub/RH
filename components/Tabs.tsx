
import React from 'react';

interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 focus:outline-none ${
                isActive
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                <TabButton
                    label="Dashboard"
                    isActive={activeTab === 'Dashboard'}
                    onClick={() => setActiveTab('Dashboard')}
                />
                <TabButton
                    label="Controller"
                    isActive={activeTab === 'Controller'}
                    onClick={() => setActiveTab('Controller')}
                />
            </nav>
        </div>
    );
};

export default Tabs;