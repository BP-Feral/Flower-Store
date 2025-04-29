import styles from "../styles/Admin.module.css";

function ManageProducts() {
  return (
    <div className={styles.pageWrapper}>
        <h2 className={styles.heading}>Manage Products</h2>
            <div className={styles.card}>
            <p>Feature to add, edit, and delete products will be available here soon!</p>
        </div>
      {/* 
        Later:
        - Product List Table 
        - Create New Product Form
        - Edit/Delete Buttons and all that
      */}
    </div>
  );
}

export default ManageProducts;
