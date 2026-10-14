import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useHistory, Link } from 'react-router-dom';
import Icon from '../components/Icon';
import PageTitle from '../components/Typography/PageTitle';
import ThemedSuspense from '../components/ThemedSuspense';
import { HomeIcon, EditIcon, TrashIcon } from '../icons';
import { getProductById, deleteProduct } from '../api/products';
import { Card, CardBody, Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@windmill/react-ui';
import toast from 'react-hot-toast';

const SingleProduct = () => {
  const { id } = useParams();
  const history = useHistory();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      toast.error("Error al cargar el producto");
      console.error('Failed to fetch product', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (product) {
      setIsDeleting(true);
      try {
        await deleteProduct(product._id);
        toast.success("Producto eliminado exitosamente");
        history.push('/app/all-products');
      } catch (error) {
        toast.error("Error al eliminar el producto");
        console.error("Error deleting product:", error);
      }
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <ThemedSuspense />;
  }

  if (!product) {
    return <PageTitle>Producto no encontrado.</PageTitle>;
  }

  return (
    <div>
      <PageTitle>Detalles del Producto</PageTitle>

      {/* Breadcrumbs */}
      <div className="flex text-gray-800 dark:text-gray-400">
        <div className="flex items-center text-purple-600 dark:text-purple-400">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard" className="mx-2">
            Tablero
          </NavLink>
        </div>
        {'>'}
        <NavLink exact to="/app/all-products" className="mx-2 text-purple-600 dark:text-purple-400">
          Todos los Productos
        </NavLink>
        {'>'}
        <p className="mx-2 text-gray-500">{product.title}</p>
      </div>

      {/* Product Details */}
      <Card className="my-8 shadow-md dark:bg-gray-800">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Column */}
            <div>
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-auto object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Details Column */}
            <div className="flex flex-col justify-start">
              <h1 className="text-4xl mb-2 font-bold text-gray-800 dark:text-gray-100">
                {product.title}
              </h1>
              
              <p className="text-md text-gray-500 dark:text-gray-500 mb-4">
                SKU: {product.sku}
              </p>

              <div className="flex items-center mb-4">
                <Badge type={product.stock > 0 ? 'success' : 'danger'}>
                  {product.stock > 0 ? `En Stock (${product.stock})` : 'Agotado'}
                </Badge>
              </div>

              <div className="mb-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Marca: </span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{product.brand}</span>
              </div>
              <div className="mb-5 text-sm">
                 <span className="text-gray-500 dark:text-gray-400">Categoría: </span>
                 <span className="font-semibold text-gray-700 dark:text-gray-200">{product.category.name}</span>
              </div>

              <p className="mb-6 text-gray-700 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-purple-600 dark:text-purple-400 text-3xl font-bold">
                  ${product.price} <span className="text-lg">{product.currency}</span>
                </p>
                <div>
                  <Link to={`/app/product/edit/${product._id}`}>
                    <Button icon={EditIcon} className="mr-3" layout="outline" aria-label="Editar" />
                  </Link>
                  <Button icon={TrashIcon} layout="outline" aria-label="Eliminar" onClick={() => setIsDeleteModalOpen(true)} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader className="flex items-center">
          <Icon icon={TrashIcon} className="w-6 h-6 mr-3" />
          Eliminar Producto
        </ModalHeader>
        <ModalBody>
          ¿Estás seguro de que quieres eliminar el producto "{product.title}"?
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SingleProduct;
