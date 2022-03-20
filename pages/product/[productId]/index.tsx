import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const ProductId: () => JSX.Element | null = () => {
  const route = useRouter();

  // prerendering
  if (!route.query.productId) {
    return null;
  }

  return (
    <div>
      <h1>About the product id {route.query.productId}</h1>
      <p>
        a review for it is available{" "}
        <Link href={`${route.query.productId}/review/1`}>
          <a>here</a>
        </Link>
        <br />
        whereas a replacable in history review for it is available{" "}
        <Link href={`${route.query.productId}/review/replacableIDDDD`} replace>
          <a>here</a>
        </Link>
      </p>
    </div>
  );
};
export default ProductId;
