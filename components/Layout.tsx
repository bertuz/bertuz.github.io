import {ReactNode, FC} from "react";
import styles from '../styles/Layout.module.css';
import Nav from "./Nav";
import Header from './Header';

type Props = {children: ReactNode};
const Layout: FC<Props> = ({children})=> {
    return(
        <>
        <Nav />
        <div className={styles.container}>
            <main className={styles.main}>
                <Header />
                {children}
            </main>
    </div>
        </>);
}

export default Layout;