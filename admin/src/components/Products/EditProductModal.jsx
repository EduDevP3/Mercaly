// forcing reload
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Select,
  Textarea,
} from "@windmill/react-ui";
import { updateProduct } from "../../api/products";
import { getAllCategories } from "../../api/categories";
import toast from "react-hot-toast";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        category: product.category._id,
      });
    }
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(1, 100);
        setCategories(response.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    setIsUpdating(true);
    try {
      const updated = await updateProduct(product._id, data);
      onProductUpdated(updated);
      onClose();
    } catch (error) {
      toast.error("Error updating product");
      console.error("Error updating product:", error);
    }
    setIsUpdating(false);
  };

  if (!product) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Edit Product</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="grid grid-cols-1 gap-4">
            <Label>
              <span>Title</span>
              <Input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
              />
            </Label>
            <Label>
              <span>SKU</span>
              <Input
                name="sku"
                value={formData.sku || ""}
                onChange={handleChange}
              />
            </Label>
            <Label>
              <span>Description</span>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </Label>
            <Label>
              <span>Category</span>
              <Select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              <span>Price</span>
              <Input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
              />
            </Label>
            <Label>
              <span>Stock</span>
              <Input
                type="number"
                name="stock"
                value={formData.stock || ""}
                onChange={handleChange}
              />
            </Label>
            <Label>
              <span>Image</span>
              <Input type="file" name="image" onChange={handleFileChange} />
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditProductModal;
