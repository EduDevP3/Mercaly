import React, { useState, useEffect } from "react";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Button,
} from "@windmill/react-ui";
import { getAdminOrders, updateAdminOrderStatus } from "../api/orders";
import LoadingSpinner from "./AccessibleNavigationAnnouncer";
import StatusDropdown from "./StatusDropdown";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { EyeIcon } from "../icons";

const OrdersTable = ({ resultsPerPage = 10, filter }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resetea la página a 1 solo cuando el filtro cambia
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filter)]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminOrders({ page, limit: resultsPerPage, ...filter });
      setData(response.orders);
      setTotalResults(response.total);
      setTotalPages(Math.ceil((response.total || 0) / resultsPerPage));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error al cargar las órdenes.");
      toast.error("Error al cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, resultsPerPage, JSON.stringify(filter)]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await toast.promise(
        updateAdminOrderStatus(orderId, newStatus),
        {
          loading: 'Actualizando estado...',
          success: 'Estado de orden actualizado.',
          error: (err) => `Error: ${err.response?.data?.message || err.message}`,
        }
      );
      fetchOrders(); // Re-fetch orders to update the list
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400 text-center p-4">{error}</p>;
  }

  return (
    <div>
      {/* Table */}
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Cliente</TableCell>
              <TableCell>ID de Orden</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {data.map((order, i) => (
              <TableRow key={order._id || i}>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <div>
                      <p className="font-semibold">{order.client?.email || 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order._id.substring(0,8)}...</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">$ {order.totalPrice?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </TableCell>
                <TableCell>
                  <StatusDropdown
                    currentStatus={order.status}
                    orderId={order._id}
                    onStatusChange={handleStatusChange}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3 text-sm">
                    <Link to={`/app/orders/${order._id}`}>
                      <Button layout="link" icon={EyeIcon} aria-label="Ver Detalles" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Paginación manual estilo productos */}
        <div className="flex justify-center mt-4 mb-6 space-x-2">
          <Button
            layout="outline"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Página {page} de {totalPages}
          </span>
          <Button
            layout="outline"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </TableContainer>
    </div>
  );
};

export default OrdersTable;
