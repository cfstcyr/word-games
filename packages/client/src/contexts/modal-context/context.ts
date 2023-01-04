import React, { ComponentProps } from 'react';
import { Modal } from '../../components/modal/modal';

interface ModalContextInterface {
    modals: (ComponentProps<typeof Modal> & { symbol: symbol })[];
    showModal(modal: ComponentProps<typeof Modal>): void;
    popModal(): void;
}

const ModalContext = React.createContext<ModalContextInterface>(
    {} as ModalContextInterface,
);

const useModal = () => React.useContext(ModalContext);

export { ModalContext, useModal };
