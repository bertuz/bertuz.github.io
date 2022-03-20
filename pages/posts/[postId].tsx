import Link from "next/link";
import { useRouter } from "next/router";

const Post: (props: {
  post: { id: string; title: string; body: string };
}) => JSX.Element = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </>
  );
};

export async function getStaticPaths() {
  const posts: [{ id: string }] = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then((posts) => posts.json());

  const paths = posts
    .map((post: { id: string }) => {
      return { params: { postId: `${post.id}` } };
    })
    .slice(0, 30);

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps(context: { params: { postId: string } }) {
  const post = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${context.params.postId}`
  )
    .then((post) => post.json())
    .catch(() => ({}));

  if (!("id" in post)) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
  };
}

export default Post;
