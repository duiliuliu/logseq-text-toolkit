import { useState, useEffect, useRef } from 'react'
import './customSelect.css'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function CustomSelect({ options, value, onChange, placeholder = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (option: Option) => {
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