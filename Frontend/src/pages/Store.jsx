import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/commonStyles.css";
import styles from "../styles/Store.module.css";

function Store() {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        console.error(data.error || "Failed to load products.");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("http://localhost:5000/tags");
      const data = await response.json();
      if (response.ok) {
        setTags(data);
      } else {
        console.error(data.error || "Failed to load tags.");
      }
    } catch (error) {
      console.error("Fetch tags error:", error);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const filteredProducts = selectedTags.length === 0
    ? products
    : products.filter((product) =>
        selectedTags.every((tagId) =>
          (product.tags || []).map(String).includes(String(tagId))
        )
      );

  return (
    <div className={styles.pageWrapper}>

      <div className={styles.tagFilter}>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`${styles.tagButton} ${selectedTags.includes(tag.id) ? styles.selected : ""}`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className={styles.productGrid}>
        {filteredProducts.length === 0 ? (
          <p>No matching products.</p>
        ) : (
          filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={styles.productCard}
            >
              {product.image_url && (
                <img
                  src={`http://localhost:5000/uploads/${product.image_url}`}
                  alt={product.name}
                  className={styles.productImage}
                />
              )}
              <h3>{product.name}</h3>
              <p>
                {product.description.length > 100
                  ? product.description.slice(0, 100) + "..."
                  : product.description}
              </p>
              <div className={styles.cardFooter}>
                {product.avg_rating > 0 && (
                  <div className={styles.starRating}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < Math.round(product.avg_rating) ? "#ffc107" : "#ccc",
                          fontSize: "1rem",
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <small>({product.review_count})</small>
                  </div>
                )}

                <p><strong>${product.price}</strong></p>
              </div>

            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Store;
