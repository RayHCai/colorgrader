import { PropsWithChildren } from 'react'; 

import classes from './styles.module.css';

type ButtonProps = PropsWithChildren & {
    onClick?: () => void;
    className?: string;
};

export default function Button(props: ButtonProps) {
    return (
        <>
            <div className={ `${classes.wrapper} ${props.className}` } onClick={ props.onClick }>
                <button>
                    { props.children }
                </button>
            </div>
        </>
    );
}
