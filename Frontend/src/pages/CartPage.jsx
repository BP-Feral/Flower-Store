import { useCart } from "../contexts/CartContext.jsx";
import styles from "../styles/CartPage.module.css";

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className={styles.cartWrapper}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img src={`http://localhost:5000/uploads/${item.image_url}`} alt={item.name} />
              <div className={styles.info}>
                <h3>{item.name}</h3>
                <p>${item.price} each</p>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                />
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <h2>Total: ${total}</h2>
          <button className={styles.checkoutBtn}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );
}

export default CartPage;
