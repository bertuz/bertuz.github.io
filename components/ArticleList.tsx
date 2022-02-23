import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';
import ArticleItem from "./ArticleItem";

type Props = {
    articles: any
};

const ArticleList:FC<Props> = ({articles}) => {
    console.log('======----====---===-');
    return(<div className={articleStyles.grid}>
        {articles.map((article: any) => {
            console.log(article);
            return(<ArticleItem key={article.id}  article={{body: '', id: '', title: ''}}/>);})}

    </div>);
};

export default ArticleList;