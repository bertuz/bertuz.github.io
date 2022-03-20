import React from "react";
import {useRouter} from "next/router";

const ReviewId:() => JSX.Element = () => {
    const route = useRouter();

    return (<div><h1>About the review {route.query.id} for the product id {route.query.productId}</h1></div>);
}
export default ReviewId;