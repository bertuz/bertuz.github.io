import Link from "next/link";

const Posts: (props: {
  posts: [{ id: string; title: string }];
}) => JSX.Element = ({ posts }) => {
  return (
    <>
      <h1>Posts</h1>
      <p>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`posts/${post.id}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </p>
    </>
  );
};

export async function getStaticProps() {
  const posts: [unknown] = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  ).then((posts) => posts.json());
  return {
    props: {
      posts: posts.slice(0, 10),
    },
  };
}

export default Posts;
