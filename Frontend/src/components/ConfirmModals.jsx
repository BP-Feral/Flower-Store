import styles from "../styles/ConfirmModal.module.css";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Confirma</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button onClick={onConfirm} className={styles.confirmButton}>Confirm</button>
          <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
