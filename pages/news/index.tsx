import { getSession } from "next-auth/react";
import { NextPageContext } from "next";

export type Article = {
  id: string;
  title: string;
  description: string;
  category: "sucesos" | "extra";
};

const News: (props: { articles: [Article] }) => JSX.Element = ({
  articles,
}) => {
  return (
    <>
      <h1>News list</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `api/auth/signin?callbackUrl=http://localhost:3000/news`,
        permanent: false,
      },
    };
  }

  const response = await fetch("http://localhost:4000/news");
  const data = await response.json();
  return {
    props: {
      articles: data,
    },
  };
}

export default News;
