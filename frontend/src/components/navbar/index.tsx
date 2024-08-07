import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RxHamburgerMenu } from 'react-icons/rx';

import classes from './styles.module.css';

export default function Navbar() {
    const navigate = useNavigate();

    const [isNavOpen, updateNavState] = useState(false);
    const [slideOutAnimationActive, updateSlideOutAnimationState] = useState(false);

    const links = [
        {
            url: '/',
            text: 'Assignments',
        },
        {
            url: '/upload',
            text: 'Upload',
        },
    ];

    return (
        <div className={ classes.navbar }>
            <RxHamburgerMenu
                className={ classes.icon }
                onClick={
                    () => {
                        if(isNavOpen)
                            updateSlideOutAnimationState(true);
                        else
                            updateNavState(!isNavOpen);
                    }
                }
            />

            {
                isNavOpen && (
                    <div
                        className={ `${classes.navContainer} ${slideOutAnimationActive ? classes.slideOut : ''}` }
                        onAnimationEnd={
                            () => {
                                if(slideOutAnimationActive)
                                    updateNavState(false);

                                updateSlideOutAnimationState(false);
                            }
                        }
                    >
                        <div className={ classes.links }>
                            {
                                links.map((link, index) => (
                                    <div
                                        className={ classes.linkContainer }
                                        onClick={
                                            () => {
                                                navigate(link.url);
                                                updateNavState(false);
                                            }
                                        }
                                    >
                                        <p
                                            key={ index }
                                            className={ classes.link } 
                                        >
                                            { link.text }
                                        </p>

                                        <div className={ classes.angleBorder } />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
}
