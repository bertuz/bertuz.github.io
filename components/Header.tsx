import headerStyles from '../styles/Header.module.css';
import {FC} from "react";

type Props = {};

const Header: FC<Props>  = () => {

    return(
        <div>
            <h1 className='title'>
                <span>WebDev</span> News
            </h1>
            <p>
                The best dev news only here
            </p>

            <style jsx>
                {`
                .title {
                    color: brown;
                    }
                `}
            </style>

    </div>);
};

export default Header;