import type { Article } from "./index";
import { NextPageContext } from "next";

const CategoryNews: (props: {
  category: string;
  articles: [Article];
}) => JSX.Element = ({ category, articles }) => {
  return (
    <>
      <h1>News of {category}</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </>
  );
};

export async function getServerSideProps(context: unknown) {
  const { req, res } = context as NextPageContext;
  const { category } = (context as { params: { category: string } }).params;

  const articles = await fetch(
    `http://localhost:4000/news?category=${category}`
  ).then((articles) => articles.json());

  return {
    props: {
      category,
      articles,
    },
  };
}

export default CategoryNews;
