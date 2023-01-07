import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { SCREEN } from '../../constants/screen';
import { ScreenContext } from './context';

export const ScreenProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isSmall, setIsSmall] = useState(false);
    const [isMedium, setIsMedium] = useState(false);
    const [isLarge, setIsLarge] = useState(false);

    const evaluate = useCallback(() => {
        setIsSmall(window.innerWidth <= SCREEN.SMALL);
        setIsMedium(
            window.innerWidth > SCREEN.MEDIUM &&
                window.innerWidth <= SCREEN.MEDIUM,
        );
        setIsLarge(window.innerWidth > SCREEN.MEDIUM);
    }, []);

    useEffect(() => {
        evaluate();

        window.addEventListener('resize', evaluate);

        return () => {
            window.removeEventListener('resize', evaluate);
        };
    }, []);

    return (
        <ScreenContext.Provider value={{ isSmall, isMedium, isLarge }}>
            {children}
        </ScreenContext.Provider>
    );
};
