import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Badge, Button } from '@windmill/react-ui';
import { EyeIcon, EditIcon, TrashIcon } from '../../icons';

const ProductGridView = ({ data, openDeleteModal }) => {
  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
        {data.map((product) => (
          <div className="" key={product._id}>
            <Card>
              <img className="object-contain w-full h-48" src={product.image_url} alt="producto" />
              <CardBody>
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg truncate text-gray-600 dark:text-gray-300">
                      {product.sku}
                    </p>
                    <Badge type={product.stock > 0 ? 'success' : 'danger'} className="whitespace-nowrap">
                      <p className="break-normal">{product.stock > 0 ? 'En Stock' : 'Agotado'}</p>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{product.title}</p>
                </div>

                <p className="mb-2 text-purple-500 font-bold text-lg">
                  ${product.price} {product.currency}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Link to={`/app/product/${product._id}`}>
                      <Button icon={EyeIcon} className="mr-3" aria-label="Ver Detalles" size="small" />
                    </Link>
                  </div>
                  <div>
                    <Link to={`/app/product/edit/${product._id}`}>
                      <Button
                        icon={EditIcon}
                        className="mr-3"
                        layout="outline"
                        aria-label="Editar"
                        size="small"
                      />
                    </Link>
                    <Button
                      icon={TrashIcon}
                      layout="outline"
                      aria-label="Eliminar"
                      onClick={() => openDeleteModal(product)}
                      size="small"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductGridView;
