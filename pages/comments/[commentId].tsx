import { comments, Comment as CommentType } from "../../data/comments";
import { GetStaticPaths, GetStaticProps } from "next";

const Comment: (props: { comment: CommentType }) => JSX.Element = ({
  comment,
}) => {
  return <>{comment.text}</>;
};

export default Comment;

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { commentId: "1" } },
      { params: { commentId: "2" } },
      { params: { commentId: "3" } },
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const comment = comments.find(
    (comment) => comment.id === context!.params!.commentId
  );

  return {
    props: {
      comment,
    },
  };
};
