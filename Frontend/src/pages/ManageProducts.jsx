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

  const canViewTags = userPermissions.citire_tag || false;
  const canCreateTags = userPermissions.adauga_tag || false;
  const canDeleteTags = userPermissions.sterge_tag || false;
  const canAddProduct = userPermissions.adauga_produs || false;

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
        showError(data.error || "Nu s-au putut incarca categoriile.");
      }
    } catch (error) {
      showError("Eroare de server la incarcarea categoriilor.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        showError(data.error || "Nu s-au putut incarca produsele.");
      }
    } catch {
      showError("Eroare de server la incarcarea produselor.");
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
      showError("Completeaza toate campurile obligatorii.");
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
        showSuccess(isEditing ? "Produs actualizat!" : "Produs creat!");
        setNewProduct({ name: "", description: "", stock: "", price: "", image: null, assignedTags: [], specs: [] });
        setIsEditing(false);
        setEditProductId(null);
        fetchProducts();
      } else {
        showError(data.error || "Nu s-a putut inregistra produsul.");
      }
    } catch {
      showError("Eroare de server la inregistrarea produsului.");
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
        showSuccess("Produs sters.");
        fetchProducts();
      } else {
        showError(data.error || "Nu s-a putut sterge produsul.");
      }
    } catch {
      showError("Eroare de server la stergerea produsului.");
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
        showSuccess("Categorie stearsa.");
        fetchTags();
      } else {
        showError(data.error || "Nu s-a putut sterge categoria.");
      }
    } catch {
      showError("Eroare de server la stergerea categoriei.");
    } finally {
      setShowConfirmDelete(false);
      setTagToDelete(null);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      showError("Introdu un nume pentru categorie.");
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
        showSuccess("Categorie creata cu succes!");
      } else {
        showError(data.error || "Nu s-a putut crea categoria.");
      }
    } catch (error) {
      console.error("Create tag error:", error);
      showError("Eroare de server la crearea categoriei.");
    }
  };
  return (
    <div className="pageWrapper">
      <h2 className="heading">Editeaza Produsele</h2>

      {canAddProduct && (
        <div className="card">
          <h3 className="heading">{isEditing ? "Modifica Produsul" : "Creaza Produs"}</h3>
          <form onSubmit={handleSubmitProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" name="name" placeholder="Nume Produs" value={newProduct.name} onChange={handleProductInputChange} className="input" />
            <textarea name="description" placeholder="Descriere Produs" value={newProduct.description} onChange={handleProductInputChange} className="input" rows="3" />
            <input type="number" name="stock" placeholder="Cantitate valabila" value={newProduct.stock} onChange={handleProductInputChange} className="input" />
            <input type="number" name="price" placeholder="Pret pe bucata (RON)" value={newProduct.price} onChange={handleProductInputChange} className="input" />
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
              <h4>Specificatii Produs (optional)</h4>
              {newProduct.specs.map((spec, index) => (
                <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="specificatie (ex culoare)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="valoare"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="input"
                  />
                  <button type="button" onClick={() => removeSpecField(index)} className="deleteButton">Anuleaza</button>
                </div>
              ))}
              <button type="button" onClick={addSpecField} className="createButton">+ Adauga Specificate</button>
            </div>

            <button type="submit" className="createButton">
              {isEditing ? "Modifica Produs" : "Creaza Produs"}
            </button>
          </form>
        </div>
      )}

<div className="card">
        <h3 className="heading">Produse Inregisrate</h3>
        {products.length === 0 ? (
          <p>Nici un produs gasit.</p>
        ) : (
          <table className="userTable">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Cantitate</th>
                <th>Pret</th>
                <th>Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>{p.price} RON</td>
                  <td>
                    <button onClick={() => startEditProduct(p)} className="editButton">Modifica</button>
                    <button onClick={() => confirmDeleteProduct(p.id)} className="deleteButton">Sterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {canViewTags && (
        <div className="card">
          <h3 className="heading">Categorie / Filtre</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {tags.map((tag) => (
              <div key={tag.id} className="permissionItem">
                {tag.name}
                {canDeleteTags && (
                  <button onClick={() => { setTagToDelete(tag.id); setShowConfirmDelete(true); }} className="deleteButton">Sterge</button>
                )}
              </div>
            ))}
          </div>
          {canCreateTags && (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTag(); }} style={{ marginTop: "1rem" }}>
              <input type="text" placeholder="Nume Categorie Noua" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="input" />
              <button type="submit" className="createButton">Creaza Categorie</button>
            </form>
          )}
        </div>
      )}

{showConfirmDelete && (productToDelete || tagToDelete) && (
        <ConfirmModal
          message={
            productToDelete
              ? `Chiar vrei sa stergi acest produs: "${products.find(p => p.id === productToDelete)?.name || "nedefinit"}"?`
              : `Vrei sa stergi aceasta categorie?`
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
