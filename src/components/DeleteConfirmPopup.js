import PopupWithForm from "./PopupWithForm";

function DeleteConfirmPopup({ isOpen, onClose, handleCardDelete, deleteCard }) {
  function handleSubmit(evt) {
    evt.preventDefault();
    handleCardDelete(deleteCard);
  }
  return (
    <PopupWithForm
      title="Вы уверены?"
      name="formSubmit"
      btnName="Да"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
    ></PopupWithForm>
  );
}
export default DeleteConfirmPopup;
