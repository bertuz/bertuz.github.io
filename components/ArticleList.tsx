import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';
import ArticleItem from "./ArticleItem";

type Props = {
    articles: Object
};

const ArticleList:FC<Props> = ({articles}) => {
    return(<div className={articleStyles.grid}>
        {articles.map(article => <ArticleItem article={article}/>)}
    </div>);
};

export default ArticleList;