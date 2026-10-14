import React from 'react';
import { Link } from 'react-router-dom';
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Button,
} from '@windmill/react-ui';
import { EyeIcon, EditIcon, TrashIcon } from '../../icons';

const ProductListView = ({ data, openDeleteModal }) => {
  return (
    <TableContainer className="mb-8">
      <Table>
        <TableHeader>
          <tr>
            <TableCell>Nombre</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Acción</TableCell>
          </tr>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Avatar
                    className="hidden mr-4 md:block"
                    src={product.image_url}
                    alt="Imagen del producto"
                  />
                  <div>
                    <p className="font-semibold truncate max-w-sm">{product.title}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge type={product.stock > 0 ? 'success' : 'danger'}>
                  {product.stock > 0 ? `En Stock (${product.stock})` : 'Agotado'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                ${product.price} {product.currency}
              </TableCell>
              <TableCell>
                <div className="flex">
                  <Link to={`/app/product/${product._id}`}>
                    <Button icon={EyeIcon} className="mr-3" aria-label="Ver Detalles" />
                  </Link>
                  <Link to={`/app/product/edit/${product._id}`}>
                    <Button
                      icon={EditIcon}
                      className="mr-3"
                      layout="outline"
                      aria-label="Editar"
                    />
                  </Link>
                  <Button
                    icon={TrashIcon}
                    layout="outline"
                    onClick={() => openDeleteModal(product)}
                    aria-label="Eliminar"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter>
      </TableFooter>
    </TableContainer>
  );
};

export default ProductListView;
