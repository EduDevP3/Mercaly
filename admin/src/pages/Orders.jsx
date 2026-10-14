import React, { useState } from 'react';
import PageTitle from '../components/Typography/PageTitle';
import OrdersTable from '../components/OrdersTable';
import { Input } from '@windmill/react-ui';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <PageTitle>Administración de Órdenes</PageTitle>
        <div className="w-64">
          <Input
            placeholder="Buscar por ID..."
            aria-label="Buscar por ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <OrdersTable filter={{ search: searchTerm }} />
    </>
  );
};

export default Orders;