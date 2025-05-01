import { useEffect, useState } from "react";
import "../styles/commonStyles.css"
import styles from "../styles/Store.module.css";

function Store() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p>No products available yet.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              {product.image_url && (
                <img
                  src={`http://localhost:5000/uploads/${product.image_url}`}
                  alt={product.name}
                  className={styles.productImage}
                />
              )}
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>${product.price}</strong></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Store;
