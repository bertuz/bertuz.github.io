import { Comments } from "../../data/comments";
import React from "react";

export default function CommentsPage(): JSX.Element {
  const [comments, setComments] = React.useState<Comments>([]);
  const [comment, setComment] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const fetchComments = async () => {
    setError(null);

    const response = await fetch("/api/blog/comments");
    const data = await response.json();

    if (response.status !== 200) {
      setComments([]);
      setError(data.error);
      return;
    }

    setComments(data);
  };
  const submitComment = async () => {
    const response = await fetch("/api/blog/comments", {
      method: "POST",
      body: JSON.stringify({ comment }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log(data);
  };

  const deleteComment = async (id: string) => {
    const response = await fetch(`/api/blog/comments/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log(data);
    fetchComments();
  };

  return (
    <>
      <button onClick={fetchComments}>Fetch comments</button>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={submitComment}>Submit comment</button>
      <div>
        {error && <div>An error occurred while fetching the news: {error}</div>}
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              {comment.text} |{" "}
              <button
                onClick={() => {
                  deleteComment(comment.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
