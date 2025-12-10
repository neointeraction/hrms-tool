import { Modal } from "../../components/common/Modal";
import HolidayManagement from "./HolidayManagement";

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HolidayModal({ isOpen, onClose }: HolidayModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Holiday Calendar"
      maxWidth="max-w-4xl"
    >
      <HolidayManagement isModal={true} />
    </Modal>
  );
}
