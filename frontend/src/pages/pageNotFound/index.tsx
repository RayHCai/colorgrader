import { useNavigate } from 'react-router-dom';
import Button from '@/components/button';

import classes from './styles.module.css';

export default function PageNotFound() {
    const navigate = useNavigate();

    return (
        <div className={ classes.container }>
            <div className={ classes.lettersContainer }>
                <span>4</span>
                <span className={ classes.rainbow }>0</span>
                <span>4</span>
            </div>

            <p>We can't find the page you're looking for.</p>

            <div className={ classes.buttonContainer }>
                <Button
                    className={ classes.btn }
                    onClick={ () => navigate('/') }
                >
                    Go back home
                </Button>
            </div>
        </div>
    );
}
