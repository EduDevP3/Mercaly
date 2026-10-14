import React, { useState, useRef, useEffect } from 'react';

const statusLabels = {
  Pending: 'Pendiente',
  Processing: 'Procesando',
  Shipped: 'Enviado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

const StatusDropdown = ({ currentStatus, orderId, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const getBadgeClasses = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-700 text-white dark:bg-yellow-300 dark:text-yellow-900';
      case 'Processing':
        return 'bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900';
      case 'Shipped':
        return 'bg-blue-700 text-white dark:bg-blue-300 dark:text-blue-900';
      case 'Delivered':
        return 'bg-green-700 text-white dark:bg-green-300 dark:text-green-900';
      case 'Cancelled':
        return 'bg-red-700 text-white dark:bg-red-400 dark:text-red-900';
      default:
        return 'bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900';
    }
  };

  // Función para obtener la clase de color del texto según el estado
  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'Processing':
        return 'text-gray-700 dark:text-gray-300';
      case 'Shipped':
        return 'text-blue-700 dark:text-blue-300';
      case 'Delivered':
        return 'text-green-700 dark:text-green-300';
      case 'Cancelled':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <span onClick={() => setIsOpen(!isOpen)} className={`inline-flex px-2 text-xs font-medium leading-5 rounded-full cursor-pointer ${getBadgeClasses(currentStatus)}`}>
        {statusLabels[currentStatus] || currentStatus}
      </span>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(orderId, status);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 ${getStatusTextColor(status)}`}
              >
                {statusLabels[status] || status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;