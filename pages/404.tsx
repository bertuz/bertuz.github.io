import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const NotFound: () => JSX.Element = () => {
  const route = useRouter();

  const handleClick = () => {
    route.replace("/docs");
  };
  return (
    <div>
      <h1>Not found, bitch!</h1>
      <p>
        <button onClick={handleClick}>Click here</button> to go to the docs
      </p>
    </div>
  );
};
export default NotFound;
