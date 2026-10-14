import React, { useState, useEffect } from 'react';
import PageTitle from '../components/Typography/PageTitle';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
  Input, // Import Input component
} from '@windmill/react-ui';
import { getAllCategories, deleteCategory, updateCategory } from '../api/categories'; // Import updateCategory
import { EditIcon, TrashIcon, HomeIcon } from '../icons';
import Icon from '../components/Icon';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemedSuspense from '../components/ThemedSuspense';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetching data
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const responseData = await getAllCategories(page, resultsPerPage);
        setCategories(responseData.categories);
        setTotalResults(responseData.total);
      } catch (err) {
        setError(err);
        toast.error('Error al cargar las categorías.');
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [page, resultsPerPage]);

  // Delete Modal functions
  const openDeleteModal = (categoryId) => {
    setSelectedCategoryToDelete(categoryId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedCategoryToDelete(null);
  };

  // Edit Modal functions
  const openEditModal = (category) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
    setEditName('');
    setEditDescription('');
  };

  // Pagination change
  const onPageChange = (p) => {
    setPage(p);
  };

  // Action handlers
  const handleEdit = (category) => {
    openEditModal(category);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    try {
      const updatedCategoryData = {
        name: editName,
        description: editDescription,
      };
      await updateCategory(categoryToEdit._id, updatedCategoryData);
      toast.success('Categoría actualizada con éxito!');
      closeEditModal();
      // Refresh categories
      const responseData = await getAllCategories(page, resultsPerPage);
      setCategories(responseData.categories);
      setTotalResults(responseData.total);
    } catch (err) {
      toast.error('Error al actualizar la categoría.');
      console.error('Error updating category:', err);
    }
  };


  const handleDeleteConfirm = async () => {
    if (selectedCategoryToDelete) {
      try {
        await deleteCategory(selectedCategoryToDelete);
        toast.success('Categoría eliminada con éxito!');
        closeDeleteModal(); // Changed from closeModal()
        // Refresh categories
        setPage(1); // Reset to first page
        const responseData = await getAllCategories(1, resultsPerPage);
        setCategories(responseData.categories);
        setTotalResults(responseData.total);
      } catch (err) {
        toast.error('Error al eliminar la categoría.');
        console.error('Error deleting category:', err);
      }
    }
  };

  return (
    <div className="container px-6 mx-auto grid">
      <PageTitle>Categorías</PageTitle>

      {/* Breadcrumbs */}
      <div className="flex text-gray-800 dark:text-gray-300 mb-4">
        <div className="flex items-center text-purple-600">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard" className="mx-2">
            Tablero
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Categorías</p>
      </div>

      {loading && <ThemedSuspense />}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {!loading && !error && categories.length > 0 && (
        <>
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Identificador</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <span className="text-sm">{category.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{category.handle}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{category.description || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{new Date(category.createdAt).toLocaleDateString('es-ES')}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Button layout="link" size="icon" aria-label="Editar" onClick={() => handleEdit(category)}>
                          <EditIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                        <Button layout="link" size="icon" aria-label="Eliminar" onClick={() => openDeleteModal(category._id)}>
                          <TrashIcon className="w-5 h-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Category navigation"
            onChange={onPageChange}
          />
        </>
      )}

      {!loading && !error && categories.length === 0 && (
        <p>No se encontraron categorías.</p>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={closeDeleteModal}>
        <ModalHeader className="flex items-center">
          <Icon icon={TrashIcon} className="w-6 h-6 mr-3" />
          Confirmar Eliminación
        </ModalHeader>
        <ModalBody>
          ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeDeleteModal}>
              Cancelar
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDeleteConfirm}>Eliminar</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeDeleteModal}>
              Cancelar
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </div>
        </ModalFooter>
      </Modal>
      {/* Edit Category Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <ModalHeader className="flex items-center">
          <EditIcon className="w-6 h-6 mr-3" />
          Editar Categoría
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Categoría
              </label>
              <Input
                className="mt-1 block w-full"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción (Opcional)
              </label>
              <Input
                className="mt-1 block w-full"
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeEditModal}>
              Cancelar
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleUpdate}>Actualizar</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeEditModal}>
              Cancelar
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleUpdate}>
              Actualizar
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Categories;
