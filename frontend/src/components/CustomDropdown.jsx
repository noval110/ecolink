import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  icon: IconComponent,
  placeholder = 'Pilih opsi...',
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to [{ value, label }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || normalizedOptions[0];

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal) => {
    onChange(optVal);
    setIsOpen(false);
  };

  return (
    <div className={`custom-dropdown-container ${className} ${isOpen ? 'dropdown-open' : ''}`} ref={dropdownRef} style={style}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'active-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-content">
          {IconComponent && <IconComponent size={16} className="dropdown-leading-icon" />}
          <span className="dropdown-selected-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`dropdown-chevron-icon ${isOpen ? 'chevron-rotated' : ''}`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          <div className="dropdown-options-scroll">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="option-label">{opt.label}</span>
                  {isSelected && <Check size={15} className="option-check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
