import { GetStaticProps } from "next";

type NewsProps = {
  data: string;
};

const TestNewsPreview: (props: NewsProps) => JSX.Element = ({ data }) => {
  return (
    <>
      <h1>News list</h1>
      {data}
    </>
  );
};

export const getStaticProps: GetStaticProps<NewsProps> = async (context) => {
  console.log("====> static props called");
  return context.preview
    ? { props: { data: "list of draft articles" } }
    : {
        props: {
          data: "List of published articles",
        },
      };
};

export default TestNewsPreview;
