import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';

type Props = {
    article: Object
};

const ArticleItem:FC<Props> = ({article}) => {
    return(<Link href='/article/[id]' as={`/article/${article.id}`}>
        <a className={articleStyles.card}><h3>{article.title} &rarr;</h3>
        <p>{article.body}</p>
        </a>
    </Link>);
};

export default ArticleItem;