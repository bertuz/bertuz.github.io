import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';

type Props = {
    article: any
};

const ArticleItem:FC<Props> = ({article: any}) => {
    // @ts-ignore
    const {body, id, title} = article;
    return(<Link href='/article/[id]' as={`/article/${id}`}>
        <a className={articleStyles.card}><h3>{title} &rarr;</h3>
        <p>{body}</p>
        </a>
    </Link>);
};

export default ArticleItem;