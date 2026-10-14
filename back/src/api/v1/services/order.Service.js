import { Order } from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { Client } from '../models/clientModel.js';
import { escapeRegex, isValidMongoId } from '../utils/security.utils.js';

export const createOrderService = async (orderData) => {
  const { orderItems, shippingAddress, client: clientId } = orderData;

  if (!orderItems || orderItems.length === 0) {
    throw new Error('No order items');
  }

  if (!shippingAddress) {
    throw new Error('No shipping address');
  }

  if (!clientId || !isValidMongoId(clientId)) {
    throw new Error('Invalid or missing client ID');
  }

  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  // 1. Obtener detalles del producto verificados desde la base de datos
  const populatedOrderItems = await Promise.all(
    orderItems.map(async (item) => {
      if (!isValidMongoId(item.product)) {
        throw new Error(`Invalid Product ID: ${item.product}`);
      }
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      return {
        ...item,
        sku: product.sku,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
      };
    })
  );

  // 2. Calcular precios en el servidor basados en la promoción 2x1000
  const totalQuantity = populatedOrderItems.reduce((acc, item) => acc + item.quantity, 0);
  const pairs = Math.floor(totalQuantity / 2);
  const singles = totalQuantity % 2;

  // Lógica: 2 por $1,000, 1 por $600
  const itemsPrice = (pairs * 1000) + (singles * 600);
  const taxPrice = 0;
  const shippingPrice = 0;
  const totalPrice = itemsPrice;

  // 3. Crear el nuevo pedido
  const order = new Order({
    storeId: orderData.storeId,
    orderItems: populatedOrderItems,
    client: clientId,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  return createdOrder;
};

export const getOrdersService = async (options) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, storeId } = options;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // Tope de 100 items por consulta
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  let query = {};
  if (storeId) {
    query.storeId = storeId;
  }

  if (search && typeof search === 'string') {
    const safeSearch = escapeRegex(search);
    if (safeSearch) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: safeSearch,
          options: "i"
        }
      };
    }
  }

  const orders = await Order.find(query)
    .populate('client', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean({ virtuals: true });

  const total = await Order.countDocuments(query);

  return {
    orders,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    total,
  };
};

export const getOrderByIdService = async (id, storeId = null) => {
  if (!isValidMongoId(id)) {
    throw new Error('Invalid order ID format');
  }

  const query = { _id: id };
  if (storeId) query.storeId = storeId;

  const order = await Order.findOne(query).populate('client', 'name email');
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

export const updateOrderStatusService = async (id, status, storeId = null) => {
  if (!isValidMongoId(id)) {
    throw new Error('Invalid order ID format');
  }

  const query = { _id: id };
  if (storeId) query.storeId = storeId;

  const order = await Order.findOne(query);
  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  if (status === 'Paid') {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();
  return updatedOrder;
};

export const deleteOrderService = async (id, storeId = null) => {
  if (!isValidMongoId(id)) {
    throw new Error('Invalid order ID format');
  }

  const query = { _id: id };
  if (storeId) query.storeId = storeId;

  const order = await Order.findOne(query);
  if (!order) {
    throw new Error('Order not found');
  }

  await Order.deleteOne(query);
  return { message: 'Order deleted successfully' };
};
