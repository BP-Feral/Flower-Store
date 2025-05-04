import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/ProductDetail.module.css";
import { useCart } from "../contexts/CartContext.jsx";
import { showSuccess } from "../utils/toast.jsx";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Error loading product:", err));
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      username,
      rating: Number(rating),
      comment,
    };

    fetch(`http://localhost:5000/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          showSuccess("Review added!");
          setProduct((prev) => ({
            ...prev,
            reviews: [
              { ...newReview, created_at: new Date().toISOString() },
              ...prev.reviews,
            ],
          }));
          setUsername("");
          setRating(5);
          setComment("");
        }
      })
      .catch(() => alert("Failed to submit review"));
  };

  const renderStars = (currentRating, setFn = null) => {
    return [...Array(5)].map((_, i) => {
      const index = i + 1;
      return (
        <span
          key={index}
          onClick={() => setFn && setFn(index)}
          style={{
            cursor: setFn ? "pointer" : "default",
            color: index <= currentRating ? "#ffc107" : "#e4e5e9",
            fontSize: "1.5rem",
          }}
        >
          ★
        </span>
      );
    });
  };

  if (!product) return <p>Loading...</p>;
  if (product.error) return <p>{product.error}</p>;

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.productCard}>
        <div className={styles.imageSection}>
          {product.image_url && (
            <img
              src={`http://localhost:5000/uploads/${product.image_url}`}
              alt={product.name}
              className={styles.productImage}
            />
          )}
        </div>
        <div className={styles.infoSection}>
          <section className={styles.section}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
          </section>

          <section className={styles.section}>
            <h3>Price & Stock</h3>
            <p className={styles.price}><strong>Price:</strong> ${product.price}</p>
            <p className={styles.stock}><strong>Stock:</strong> {product.stock}</p>
          </section>

          <section className={styles.section}>
            <h3>Specifications</h3>
            <ul className={styles.specs}>
              {product.specs.map((spec, index) => (
                <li key={index}>
                  <strong>{spec.key}</strong>: {spec.value}
                </li>
              ))}
            </ul>
          </section>

          <button
            className={styles.addToCartBtn}
            onClick={() => {
              addToCart(product);
              showSuccess("Added to cart!");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <h2>Reviews</h2>
        {product.reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          product.reviews.map((review, idx) => (
            <div key={idx} className={styles.reviewCard}>
              <strong>{review.username}</strong>
              <p>{renderStars(review.rating)}</p>
              <p>{review.comment}</p>
              <small>{new Date(review.created_at).toLocaleDateString()}</small>
            </div>
          ))
        )}

        <div className={styles.reviewForm}>
          <h3>Leave a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <input
              type="text"
              placeholder="Your name"
              className={styles.inputBox}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div className={styles.starRating}>
              {renderStars(rating, setRating)}
            </div>
            <textarea
              placeholder="Your review"
              value={comment}
              className={styles.inputBox}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
            <button type="submit">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
