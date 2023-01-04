import React, {
    ComponentProps,
    PropsWithChildren,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Modal } from '../../components/modal/modal';
import { ModalContext } from './context';

export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [modals, setModals] = useState<
        (ComponentProps<typeof Modal> & { symbol: symbol })[]
    >([]);

    const remove = useCallback((s: symbol) => {
        setModals((m) => {
            const index = m.findIndex((modal) => modal.symbol === s);
            m.splice(index, 1);
            return [...m];
        });
    }, []);

    const popModal = useCallback(() => {
        setModals((m) => m.slice(0, -1));
    }, []);

    const showModal = useCallback(
        (modal: ComponentProps<typeof Modal>) => {
            const s = Symbol();
            setModals((m) => [
                ...m,
                {
                    ...modal,
                    symbol: s,
                    onClose: () => {
                        remove(s);
                        modal.onClose?.();
                    },
                },
            ]);
        },
        [remove],
    );

    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') popModal();
        }

        window.addEventListener('keypress', onKeyPress);

        return () => window.removeEventListener('keypress', onKeyPress);
    }, [popModal]);

    return (
        <ModalContext.Provider value={{ modals, showModal, popModal }}>
            {children}
        </ModalContext.Provider>
    );
};
