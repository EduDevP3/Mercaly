import React from 'react';
import { Card, CardBody, Label, Button, Select, Input } from '@windmill/react-ui';
import { ListViewIcon, GridViewIcon } from '../../icons';

const ProductControls = ({
  page,
  dataLength,
  totalResults,
  resultsPerPage,
  setResultsPerPage,
  view,
  handleChangeView,
  categories,
  selectedCategory,
  handleCategoryChange,
  searchTerm,
  handleSearchChange,
}) => {
  const start = (page - 1) * resultsPerPage + 1;
  const end = (page - 1) * resultsPerPage + dataLength;

  return (
    <Card className="mt-5 mb-5 shadow-md">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {totalResults > 0
                ? `Mostrando ${start}-${end} de ${totalResults} productos`
                : 'Mostrando 0 de 0 productos'}
            </p>

            <Label className="ml-4 flex-1">
              <Input
                className="py-3"
                placeholder="Buscar por SKU o nombre..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </Label>

            <Label className="ml-4">
              <Select
                className="py-3"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Label>

            <Label className="mr-8 ml-4">
              <Select
                className="py-3"
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(parseInt(e.target.value, 10))}
              >
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </Select>
            </Label>
          </div>
          <div className="">
            <Button
              icon={view === 'list' ? ListViewIcon : GridViewIcon}
              className="p-2"
              aria-label="Change View"
              onClick={handleChangeView}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductControls;
