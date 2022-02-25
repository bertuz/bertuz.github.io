import articleStyles from '../styles/Article.module.css';
import {FC} from "react";
import Link from 'next/link';
import {useRouter} from "next/router";
import {server} from '../../../config';

type Props = {
    article: any
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

    const articles:any = await res.json();


    const ids:any = articles.map((article: { id: any; }) => article.id);

    const paths = ids.map((id: { toString: () => any; }) => ({params: {id: id.toString()}}))

    return {
        paths,
        fallback: false
    }
};

// export const getStaticProps = async (context: any) => {
//     const res = await fetch(`/api/articles`);
//
//     const article = await res.json();
//
//     return {
//       props: {article}
//     };
// };

export const getStaticProps = async (context: any) => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${context.params.id}`);

    const article = await res.json();

    return {
      props: {article}
    };
};

export default Article;