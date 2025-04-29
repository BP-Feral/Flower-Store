import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast.jsx";
import ConfirmModal from "../components/ConfirmModals.jsx";
import styles from "../styles/Admin.module.css";


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
  const [newTag, setNewTag] = useState("");

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    image: null,
    assignedTags: [],
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTags();
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
      console.error("Fetch tags error:", error);
      showError("Server error fetching tags.");
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
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

  const handleRequestDeleteTag = (tagId) => {
    setTagToDelete(tagId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDeleteTag = async () => {
    try {
      const response = await fetch(`http://localhost:5000/tags/${tagToDelete}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.ok) {
        fetchTags();
        showSuccess("Tag deleted successfully!");
      } else {
        showError(data.error || "Failed to delete tag.");
      }
    } catch (error) {
      console.error("Delete tag error:", error);
      showError("Server error while deleting tag.");
    } finally {
      setShowConfirmDelete(false);
      setTagToDelete(null);
    }
  };

  const handleCancelDeleteTag = () => {
    setShowConfirmDelete(false);
    setTagToDelete(null);
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name.trim() || !newProduct.description.trim() || !newProduct.price.trim()) {
      showError("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("stock", newProduct.stock);
      formData.append("price", newProduct.price);
      formData.append("tags", JSON.stringify(newProduct.assignedTags));
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const response = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Product created successfully!");
        setNewProduct({
          name: "",
          description: "",
          stock: "",
          price: "",
          image: null,
          assignedTags: [],
        });
      } else {
        showError(data.error || "Failed to create product.");
      }
    } catch (error) {
      console.error("Create product error:", error);
      showError("Server error while creating product.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Manage Products</h2>

      {/* Tags Section */}
      {canViewTags && (
        <div className={styles.card}>
          <h3 className={styles.heading}>Tags / Categories</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {tags.map((tag) => (
              <div key={tag.id} className={styles.permissionItem}>
                {tag.name}
                {canDeleteTags && (
                  <button
                    onClick={() => handleRequestDeleteTag(tag.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

          {canCreateTags && (
            <form onSubmit={handleCreateTag} style={{ marginTop: "1rem" }}>
              <input
                type="text"
                placeholder="New Tag Name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.createButton}>Create Tag</button>
            </form>
          )}
        </div>
      )}

      {/* Create Product Section */}
      {canAddProduct && (
        <div className={styles.card}>
          <h3 className={styles.heading}>Create New Product</h3>
          <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleProductInputChange}
              className={styles.input}
            />
            <textarea
              name="description"
              placeholder="Product Description"
              value={newProduct.description}
              onChange={handleProductInputChange}
              className={styles.input}
              rows="3"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock Available"
              value={newProduct.stock}
              onChange={handleProductInputChange}
              className={styles.input}
            />
            <input
              type="number"
              name="price"
              placeholder="Price Per Item ($)"
              value={newProduct.price}
              onChange={handleProductInputChange}
              className={styles.input}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.input}
            />

            <div className={styles.permissionsDisplay}>
              {tags.map((tag) => (
                <label key={tag.id} className={styles.permissionItem}>
                  <input
                    type="checkbox"
                    value={tag.id}
                    checked={newProduct.assignedTags.includes(String(tag.id))}
                    onChange={handleAssignedTagsChange}
                  />
                  {tag.name}
                </label>
              ))}
            </div>

            <button type="submit" className={styles.createButton}>Create Product</button>
          </form>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this tag?"
          onConfirm={handleConfirmDeleteTag}
          onCancel={handleCancelDeleteTag}
        />
      )}
    </div>
  );
}

export default ManageProducts;
