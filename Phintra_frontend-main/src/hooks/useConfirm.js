import { useConfirmContext } from '../context/ConfirmContext';

export const useConfirm = () => {
  return useConfirmContext();
};
