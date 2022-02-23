import type { NextPage } from 'next'
import Head from "next/head";
import {FC} from "react";
import ArticleList from "../components/ArticleList";

type Props = {
    articles: any
};
const Home: FC<Props> = ({articles}) => {

    
  return (

    <div>
        <Head>
            <title>Hola</title>
            <meta name="keywords" content="web development, programming"/>
        </Head>
      <h1>Welcome to my page!</h1>
        <ArticleList articles={articles}/>
    </div>
  )
}

export const getStaticProps = async() => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_limit=6`);
  const articles = await res.json();

  return {
    props: {
        articles
    }
  };
};
export default Home;
