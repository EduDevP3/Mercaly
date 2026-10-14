import React, { useState, useEffect } from "react";
import PageTitle from "../components/Typography/PageTitle";
import { NavLink, useHistory } from "react-router-dom";
import { HomeIcon, TrashIcon } from "../icons";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@windmill/react-ui";
import Icon from "../components/Icon";
import ProductControls from "../components/Products/ProductControls";
import ProductListView from "../components/Products/ProductListView";
import ProductGridView from "../components/Products/ProductGridView";
import ThemedSuspense from "../components/ThemedSuspense";
import { getProducts, deleteProduct } from "../api/products";
import { getAllCategories } from "../api/categories";
import toast from "react-hot-toast";

const ProductsAll = () => {
  const history = useHistory();
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState(""); // for the api call by name
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // for the select control value
  const [categories, setCategories] = useState([]);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset page when search term changes
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(1, 100);
        if (isMounted) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      if (isMounted) setLoading(true);
      try {
        const response = await getProducts(page, resultsPerPage, category, debouncedSearchTerm);
        if (isMounted) {
          setData(response.products || []);
          setTotalResults(response.total || 0);
          setTotalPages(Math.ceil((response.total || 0) / resultsPerPage));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error fetching products");
      }
      if (isMounted) setLoading(false);
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [page, resultsPerPage, category, needsRefresh, debouncedSearchTerm]);

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openEditModal = (productId) => {
    history.push(`/app/products/edit/${productId}`);
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      setIsDeleting(true);
      try {
        await deleteProduct(selectedProduct._id);
        toast.success("Producto eliminado exitosamente");
        setData(data.filter((p) => p._id !== selectedProduct._id));
        closeDeleteModal();
      } catch (error) {
        toast.error("Error al eliminar el producto");
        console.error("Error deleting product:", error);
      }
      setIsDeleting(false);
    }
  };

  const handleChangeView = () => {
    setView(view === "list" ? "grid" : "list");
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);

    if (categoryId) {
      const categoryName = categories.find(cat => cat._id === categoryId)?.name;
      setCategory(categoryName || "");
    } else {
      setCategory("");
    }
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  }

  return (
    <div>
      <PageTitle>Todos los Productos</PageTitle>

      <div className="flex text-gray-800 dark:text-gray-300">
        <div className="flex items-center text-purple-600">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard" className="mx-2">
            Tablero
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Todos los Productos</p>
      </div>

      <ProductControls
        page={page}
        dataLength={data.length}
        totalResults={totalResults}
        resultsPerPage={resultsPerPage}
        setResultsPerPage={setResultsPerPage}
        view={view}
        handleChangeView={handleChangeView}
        categories={categories}
        selectedCategory={selectedCategoryId}
        handleCategoryChange={handleCategoryChange}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
      />

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalHeader className="flex items-center">
          <Icon icon={TrashIcon} className="w-6 h-6 mr-3" />
          Eliminar Producto
        </ModalHeader>
        <ModalBody>
          ¿Estás seguro de que quieres eliminar el producto{" "}
          {selectedProduct && `"${selectedProduct.title}"`}?
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeDeleteModal}>
              Cancelar
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeDeleteModal}>
              Cancelar
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {loading ? (
        <ThemedSuspense />
      ) : view === "list" ? (
        <ProductListView
          data={data}
          openDeleteModal={openDeleteModal}
          openEditModal={openEditModal}
        />
      ) : (
        <ProductGridView
          data={data}
          openDeleteModal={openDeleteModal}
          openEditModal={openEditModal}
        />
      )}

      {!loading && totalResults > 0 && (
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
      )}
    </div>
  );
};

export default ProductsAll;
