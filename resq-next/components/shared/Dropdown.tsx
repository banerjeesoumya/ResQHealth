import React from "react";

interface DropdownProps {
  items: string[];
  selectedItem: string | null;
  onChange: (item: string) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ items, selectedItem, onChange, className }) => {
  return (
    <div className={`relative inline-block w-[50%] ${className} overflow-auto`}>
      <select
        className="block w-full p-2 border rounded-md text-gray-700 bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        value={selectedItem || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select a location
        </option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
