import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: '#4caf50',
  error: '#f44336',
  info: '#2196f3',
  warning: '#ff9800',
}

export default function Notification({ type = 'success', message, onClose, duration = 10000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = iconMap[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose && onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    maxWidth: '300px',
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '1.6rem',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: `3px solid ${colorMap[type]}`,
  }

  const iconStyle = {
    flexShrink: 0,
    marginRight: '12px',
    color: colorMap[type],
  }

  const messageStyle = {
    flex: 1,
    fontSize: '14px',
    color: '#333',
    // font bold
    fontWeight: 'meddium'
    
  }

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
  }

  return (
    <div style={containerStyle}>
      <Icon style={iconStyle} aria-hidden="true" />
      <p style={messageStyle}>{message}</p>
      <button
        style={closeButtonStyle}
        onClick={() => {
          setIsVisible(false)
          onClose && onClose()
        }}
      >
        <X size={18} aria-hidden="true" />
        <span style={{ display: 'none' }}>Cerrar</span>
      </button>
    </div>
  )
}