import navStyles from '../styles/Nav.module.css';
import {FC} from "react";
import Link from 'next/link';

type Props = {};

const Nav:FC<Props> = () => {
    return(<nav className={navStyles.nav}>
        <ul>
            <li><Link href='/'>Home</Link></li>
            <li><Link href='/about'>About</Link></li>
        </ul>
    </nav>);
};

export default Nav;