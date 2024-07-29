import { useState } from 'react';

export function Navbar() {
    const [isNavOpen, _updateNavState] = useState(true);

    const links = [
        {
            url: '/',
            text: 'Forums',
        },
        {
            url: '/addforum',
            text: 'Add Forum',
        },
    ];

    return (
        <div className="navbar">
            { isNavOpen ? (
                <div className="navbar-links-container">
                    <div>
                        { links.map((link, index) => (
                            <a key={ index } href={ link.url }>
                                { link.text }
                            </a>
                        )) }
                    </div>
                </div>
            ) : null }
        </div>
    );
}
