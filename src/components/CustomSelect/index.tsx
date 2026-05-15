import { useState, useEffect, useRef } from 'react'
import './customSelect.css'
import { getDocument } from '../../logseq/utils'

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
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const doc = getDocument()
    doc.addEventListener('mousedown', handleClickOutside)
    return () => {
      doc.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft
      
      setMenuPosition({
        top: rect.bottom + scrollTop + 2,
        left: rect.left + scrollLeft,
        width: rect.width
      })
    }
  }, [isOpen])

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
        <div 
          ref={menuRef}
          className="custom-select__menu"
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width
          }}
        >
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