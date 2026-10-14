import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminOrderById, updateAdminOrderStatus } from '../api/orders';
import toast from 'react-hot-toast';
import PageTitle from '../components/Typography/PageTitle';
import StatusDropdown from '../components/StatusDropdown'; // Import StatusDropdown
import ThemedSuspense from '../components/ThemedSuspense';

const SingleOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminOrderById(id);
      setOrder(response);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Error al cargar los detalles de la orden.");
      toast.error("Error al cargar los detalles de la orden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

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
      setOrder(prevOrder => ({ ...prevOrder, status: newStatus })); // Optimistic update
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return <ThemedSuspense />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <PageTitle>Error</PageTitle>
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <PageTitle>Orden No Encontrada</PageTitle>
        <p className="text-xl text-gray-700">La orden que buscas no existe o ha sido eliminada.</p>
      </div>
    );
  }

  return (
    <>
      <PageTitle>Detalles de la Orden #{order._id.substring(0, 8)}...</PageTitle>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Order Info */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">Información General</h2>
          <p className="text-gray-600 dark:text-gray-400"><strong>Cliente:</strong> {order.client?.email || 'N/A'}</p>
          <p className="text-gray-600 dark:text-gray-400"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p className="text-gray-600 dark:text-gray-400"><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
          <div className="flex items-center mt-4">
            <p className="text-gray-600 dark:text-gray-400 mr-2"><strong>Estado:</strong></p>
            <StatusDropdown
              currentStatus={order.status}
              orderId={order._id}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">Dirección de Envío</h2>
          <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.address}</p>
          <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
          <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 mb-8">
        <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">Artículos del Pedido</h2>
        <div className="w-full overflow-hidden rounded-lg shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-no-wrap">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Precio Unitario</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                {order.orderItems.map((item) => {
                  const itemTotal = item.quantity === 2 ? 1000 : item.price * item.quantity; // Local logic for display matching promo
                  return (
                    <tr className="text-gray-700 dark:text-gray-400" key={item.product}>
                      <td className="px-4 py-3 text-sm font-medium">{item.title}</td>
                      <td className="px-4 py-3 text-sm">{item.sku}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-sm">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-300">Desglose de Precios</h2>
        <div className="flex justify-between py-1">
          <p className="text-gray-600 dark:text-gray-400">Subtotal (Precio Base):</p>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            {formatPrice(order.orderItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0))}
          </p>
        </div>

        {order.totalPrice < (order.orderItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)) && (
          <div className="flex justify-between py-1 text-teal-600 font-bold">
            <p>Descuento Promo (2x1000):</p>
            <p>- {formatPrice((order.orderItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)) - order.totalPrice)}</p>
          </div>
        )}

        <div className="flex justify-between py-2 mt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-300">Total Final:</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 italic">
            {formatPrice(order.totalPrice)}
          </p>
        </div>
      </div>
    </>
  );
};

export default SingleOrder;
