import React, { useState, useEffect, useRef } from 'react'
import './customSelect.css'

function CustomSelect({ options, value, onChange, placeholder = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === value) || { label: placeholder, value: '' }

  return (
    <div className="custom-select" ref={selectRef}>
      <div 
        className="custom-select__control"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-select__value">{selectedOption.label}</span>
        <span className="custom-select__arrow">▼</span>
      </div>
      {isOpen && (
        <div className="custom-select__menu">
          {options.map(option => (
            <div
              key={option.value}
              className={`custom-select__option ${option.value === value ? 'custom-select__option--selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              <span className="custom-select__option-label">{option.label}</span>
              {option.value === value && <span className="custom-select__option-checkmark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelect