import React, { useState } from 'react';
import { Input, Textarea, Button, Label } from '@windmill/react-ui';
import PageTitle from '../components/Typography/PageTitle';
import SectionTitle from '../components/Typography/SectionTitle';
import { createCategory } from '../api/categories';
import { useHistory, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HomeIcon } from '../icons';
import Icon from '../components/Icon';

function AddCategory() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCategory = { name, description };
      await createCategory(newCategory);
      toast.success('Category added successfully!');
      setName(''); // Clear form
      setDescription(''); // Clear form
      history.push('/app/categories'); // Redirect to categories list after creation
    } catch (error) {
      toast.error(`Error adding category: ${error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Agregar Nueva Categoría</PageTitle>

      {/* Breadcrumbs */}
      <div className="flex text-gray-800 dark:text-gray-300 mb-4">
        <div className="flex items-center text-purple-600">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard" className="mx-2">
            Tablero
          </NavLink>
        </div>
        {">"}
        <div className="flex items-center text-purple-600">
          <NavLink exact to="/app/categories" className="mx-2">
            Categorías
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Agregar Categoría</p>
      </div>

      <SectionTitle>Detalles de la Categoría</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <Label className="mt-4">
            <span>Nombre de la Categoría</span>
            <Input
              className="mt-1"
              type="text"
              placeholder="Introduce el nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Label>

          <Label className="mt-4">
            <span>Descripción (Opcional)</span>
            <Textarea
              className="mt-1"
              rows="3"
              placeholder="Introduce la descripción de la categoría"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Label>

          <Button type="submit" className="mt-4" block layout="primary" disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar Categoría'}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddCategory;
