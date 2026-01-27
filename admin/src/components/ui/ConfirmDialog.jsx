export default function ConfirmDialog({
    open,
    title = "تأكيد",
    message = "هل أنت متأكد؟",
    confirmText = "تأكيد",
    cancelText = "إلغاء",
    danger = false,
    onConfirm,
    onClose,
  }) {
    if (!open) return null;
  
    return (
      <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
          <div className="modal__title">{title}</div>
          <div className="modal__message">{message}</div>
  
          <div className="modal__actions">
            <button className="btn btn-outline" type="button" onClick={onClose}>
              {cancelText}
            </button>
  
            <button
              className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
              type="button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }
  