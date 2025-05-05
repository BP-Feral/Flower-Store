import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast.jsx";
import ConfirmModal from "../components/ConfirmModals.jsx";

import "../styles/commonStyles.css";
import "../styles/FormControlsLayout.css";
import "../styles/UserTableLayout.css";

function ManageProducts() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const rawPermissions = localStorage.getItem("permissions");
  const userPermissions = rawPermissions ? JSON.parse(rawPermissions) : {};

  const canViewTags = userPermissions.view_tags || false;
  const canCreateTags = userPermissions.create_tags || false;
  const canDeleteTags = userPermissions.delete_tags || false;
  const canAddProduct = userPermissions.add_product || false;

  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    image: null,
    assignedTags: [],
    specs: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTags();
    fetchProducts();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("http://localhost:5000/tags", {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        setTags(data);
      } else {
        showError(data.error || "Failed to load tags.");
      }
    } catch (error) {
      showError("Server error fetching tags.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        showError(data.error || "Failed to fetch products.");
      }
    } catch {
      showError("Server error fetching products.");
    }
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAssignedTagsChange = (e) => {
    const selectedTag = e.target.value;
    setNewProduct((prev) => {
      const assignedTags = prev.assignedTags.includes(selectedTag)
        ? prev.assignedTags.filter((tag) => tag !== selectedTag)
        : [...prev.assignedTags, selectedTag];
      return { ...prev, assignedTags };
    });
  };

  const handleSpecChange = (index, field, value) => {
    setNewProduct((prev) => {
      const newSpecs = [...prev.specs];
      newSpecs[index][field] = value;
      return { ...prev, specs: newSpecs };
    });
  };

  const addSpecField = () => {
    setNewProduct((prev) => ({ ...prev, specs: [...prev.specs, { key: "", value: "" }] }));
  };

  const removeSpecField = (index) => {
    setNewProduct((prev) => {
      const newSpecs = [...prev.specs];
      newSpecs.splice(index, 1);
      return { ...prev, specs: newSpecs };
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const { name, description, stock, price } = newProduct;
    if (!name || !description || !price) {
      showError("Please fill in all required fields.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("tags", JSON.stringify(newProduct.assignedTags));
      formData.append("specs", JSON.stringify(newProduct.specs));
      if (newProduct.image) formData.append("image", newProduct.image);

      const url = isEditing ? `http://localhost:5000/products/${editProductId}` : "http://localhost:5000/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: token },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        showSuccess(isEditing ? "Product updated!" : "Product created!");
        setNewProduct({ name: "", description: "", stock: "", price: "", image: null, assignedTags: [], specs: [] });
        setIsEditing(false);
        setEditProductId(null);
        fetchProducts();
      } else {
        showError(data.error || "Failed to submit product.");
      }
    } catch {
      showError("Server error while submitting product.");
    }
  };

  const startEditProduct = (product) => {
    setIsEditing(true);
    setEditProductId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      stock: product.stock.toString(),
      price: product.price.toString(),
      image: null,
      assignedTags: product.tags.map(String),
      specs: product.specs || [],
    });
  };

  const confirmDeleteProduct = (id) => {
    setProductToDelete(id);
    setShowConfirmDelete(true);
  };

  const confirmDeleteTag = (id) => {
    setTagToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDeleteProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5000/products/${productToDelete}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Product deleted.");
        fetchProducts();
      } else {
        showError(data.error || "Failed to delete product.");
      }
    } catch {
      showError("Server error while deleting product.");
    } finally {
      setShowConfirmDelete(false);
      setProductToDelete(null);
    }
  };

  const handleConfirmDeleteTag = async () => {
    try {
      const res = await fetch(`http://localhost:5000/tags/${tagToDelete}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Tag deleted.");
        fetchTags();
      } else {
        showError(data.error || "Failed to delete tag.");
      }
    } catch {
      showError("Server error while deleting tag.");
    } finally {
      setShowConfirmDelete(false);
      setTagToDelete(null);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      showError("Please enter a tag name.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name: newTag }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewTag("");
        fetchTags();
        showSuccess("Tag created successfully!");
      } else {
        showError(data.error || "Failed to create tag.");
      }
    } catch (error) {
      console.error("Create tag error:", error);
      showError("Server error while creating tag.");
    }
  };
  return (
    <div className="pageWrapper">
      <h2 className="heading">Manage Products</h2>

      {canAddProduct && (
        <div className="card">
          <h3 className="heading">{isEditing ? "Edit Product" : "Create New Product"}</h3>
          <form onSubmit={handleSubmitProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleProductInputChange} className="input" />
            <textarea name="description" placeholder="Product Description" value={newProduct.description} onChange={handleProductInputChange} className="input" rows="3" />
            <input type="number" name="stock" placeholder="Stock Available" value={newProduct.stock} onChange={handleProductInputChange} className="input" />
            <input type="number" name="price" placeholder="Price Per Item (RON)" value={newProduct.price} onChange={handleProductInputChange} className="input" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="input" />

            <div className="permissionsDisplay">
              {tags.map((tag) => (
                <label key={tag.id} className="permissionItem">
                  <input type="checkbox" value={tag.id} checked={newProduct.assignedTags.includes(String(tag.id))} onChange={handleAssignedTagsChange} />
                  {tag.name}
                </label>
              ))}
            </div>

            <div>
              <h4>Product Specifications</h4>
              {newProduct.specs.map((spec, index) => (
                <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="Spec Name"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="input"
                  />
                  <button type="button" onClick={() => removeSpecField(index)} className="deleteButton">X</button>
                </div>
              ))}
              <button type="button" onClick={addSpecField} className="createButton">+ Add Spec</button>
            </div>

            <button type="submit" className="createButton">
              {isEditing ? "Update Product" : "Create Product"}
            </button>
          </form>
        </div>
      )}

<div className="card">
        <h3 className="heading">Existing Products</h3>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="userTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>${p.price}</td>
                  <td>
                    <button onClick={() => startEditProduct(p)} className="editButton">Edit</button>
                    <button onClick={() => confirmDeleteProduct(p.id)} className="deleteButton">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {canViewTags && (
        <div className="card">
          <h3 className="heading">Tags / Categories</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {tags.map((tag) => (
              <div key={tag.id} className="permissionItem">
                {tag.name}
                {canDeleteTags && (
                  <button onClick={() => { setTagToDelete(tag.id); setShowConfirmDelete(true); }} className="deleteButton">Delete</button>
                )}
              </div>
            ))}
          </div>
          {canCreateTags && (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTag(); }} style={{ marginTop: "1rem" }}>
              <input type="text" placeholder="New Tag Name" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="input" />
              <button type="submit" className="createButton">Create Tag</button>
            </form>
          )}
        </div>
      )}

{showConfirmDelete && (productToDelete || tagToDelete) && (
        <ConfirmModal
          message={
            productToDelete
              ? `Are you sure you want to delete the product "${products.find(p => p.id === productToDelete)?.name || "this"}"?`
              : `Are you sure you want to delete this tag?`
          }
          onConfirm={productToDelete ? handleConfirmDeleteProduct : handleConfirmDeleteTag}
          onCancel={() => {
            setShowConfirmDelete(false);
            setProductToDelete(null);
            setTagToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default ManageProducts;
