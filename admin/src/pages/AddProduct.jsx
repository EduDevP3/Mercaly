import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../components/Icon";
import PageTitle from "../components/Typography/PageTitle";
import { HomeIcon, PublishIcon, StoreIcon } from "../icons";
import {
  Card,
  CardBody,
  Label,
  Input,
  Textarea,
  Button,
  Select,
} from "@windmill/react-ui";
import { createProduct } from "../api/products";
import { getAllCategories } from "../api/categories";
import toast from 'react-hot-toast';

const FormTitle = ({ children }) => {
  return (
    <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
      {children}
    </h2>
  );
};

const AddProduct = () => {
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(true);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(1, 100);
        setCategories(response.categories);
        if (response.categories.length > 0) {
          setCategory(response.categories[0]._id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const generateHandle = (str) => {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9 _-]/g, "")
        .replace(/\s+/g, "_")
        .replace(/-+/g, "_");
    };
    setHandle(generateHandle(title));
  }, [title]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let selectedCategory = category;
    if (!selectedCategory && categories.length > 0) {
      selectedCategory = categories[0]._id;
    }

    const formData = new FormData();
    formData.append("sku", sku);
    formData.append("title", title);
    formData.append("handle", handle);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("category", selectedCategory);
    formData.append("bgColor", bgColor);
    if (imageFile) {
      formData.append("image", imageFile);
    } else {
      toast.error("Please select an image for the product.");
      setLoading(false);
      return;
    }

    try {
      await createProduct(formData);
      toast.success("Producto creado exitosamente!");
      // Reset form
      setSku("");
      setTitle("");
      setPrice("");
      setDescription("");
      setStock(true);
      setBgColor("#FFFFFF");
      if (categories.length > 0) {
        setCategory(categories[0]._id);
      }
      setImageFile(null);
      setImagePreview(null);
      document.querySelector('input[type="file"]').value = "";
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle>Agregar Nuevo Producto</PageTitle>

      <div className="flex text-gray-800 dark:text-gray-300">
        <div className="flex items-center text-purple-600">
          <Icon className="w-5 h-5" aria-hidden="true" icon={HomeIcon} />
          <NavLink exact to="/app/dashboard" className="mx-2">
            Panel de Control
          </NavLink>
        </div>
        {">"}
        <p className="mx-2">Agregar nuevo Producto</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="w-full mt-8 grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="row-span-2 md:col-span-2">
            <CardBody>
              <FormTitle>Imagen del Producto</FormTitle>
              <input
                type="file"
                className="mb-4 text-gray-800 dark:text-gray-300"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mb-4">
                  <img src={imagePreview} alt="Product preview" className="w-48 h-48 object-cover" />
                </div>
              )}

              <FormTitle>SKU del Producto</FormTitle>
              <Label>
                <Input
                  className="mb-4"
                  placeholder="Escribe el SKU del producto aquí"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  required
                />
              </Label>

              <FormTitle>Nombre del Producto</FormTitle>
              <Label>
                <Input
                  className="mb-4"
                  placeholder="Escribe el nombre del producto aquí"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Label>

              <FormTitle>Handle (URL)</FormTitle>
              <Label>
                <Input
                  className="mb-4"
                  placeholder="el_nombre_del_producto_en_la_url"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  disabled
                />
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormTitle>Precio del Producto</FormTitle>
                  <Label>
                    <Input
                      className="mb-4"
                      type="number"
                      placeholder="Ingresa el precio del producto aquí"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Label>
                </div>
                <div>
                  <FormTitle>Moneda</FormTitle>
                  <Label>
                    <Input
                      className="mb-4"
                      value="MXN"
                      disabled
                    />
                  </Label>
                </div>
              </div>

              <div className="mb-4">
                <FormTitle>Color de Fondo (Background)</FormTitle>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="color"
                    className="h-10 w-20 cursor-pointer rounded-md border border-gray-300"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <Input
                    className="w-32"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#FFFFFF"
                  />
                  <div
                    className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
              </div>

              <FormTitle>Descripción</FormTitle>
              <Label>
                <Textarea
                  className="mb-4"
                  rows="3"
                  placeholder="Ingresa la descripción del producto aquí"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Label>

              <FormTitle>Disponibilidad</FormTitle>
              <div className="flex items-center mb-4">
                <span className="mr-3 text-gray-700 dark:text-gray-400">{stock ? 'Disponible' : 'No Disponible'}</span>
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 ${stock ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  onClick={() => setStock(!stock)}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${stock ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

            </CardBody>
          </Card>

          <Card className="h-auto">
            <CardBody>
              <Button type="submit" layout="primary" className="mb-4 w-full" iconLeft={PublishIcon} disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar'}
              </Button>
              <Button layout="link" className="w-full" iconLeft={StoreIcon} disabled={loading}>
                Guardar como Borrador
              </Button>
              <Label className="mt-4">
                <FormTitle>Seleccionar Categoría de Producto</FormTitle>
                <Select className="mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="" disabled>Seleccione una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Select>
              </Label>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;