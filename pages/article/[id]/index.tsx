import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';
import {useRouter} from "next/router";

type Props = {
    article: Object
};

const Article:FC<Props> = ({article}) => {
    const router = useRouter();
    const {id} = router.query;

    return(<>
        <h1>{article.title}</h1>
        <p>
            {article.body}
        </p>
        <br/>
        <Link href="/"><a>Go Back</a></Link>
    </>);
};


export const getStaticPaths = async() => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts`);

    const articles = await res.json();
console.log('here!');

    const ids = articles.map(article => article.id);
    console.log(ids);
    const paths = ids.map((id) => ({params: {id: id.toString()}}))

    return {
        paths,
        fallback: false
    }
};

export const getStaticProps = async (context) => {
    console.log(context);
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${context.params.id}`);

    const article = await res.json();

    return {
      props: {article}
    };
};

export default Article;