import Modal from 'react-modal';

const ModalCustom = ({ isOpen, onRequestClose, children }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className="modal"
    overlayClassName="modal-overlay"
    contentLabel="Modal Custom"
  >
    {children}
  </Modal>
);

export default ModalCustom;
