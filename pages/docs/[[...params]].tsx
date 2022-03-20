import {useRouter} from "next/router";
import React from "react";

const Docs:() => JSX.Element = () => {
    const route = useRouter();

    const {params = []} = route.query;
    console.log(params);
    return (<div><h1>Docs!</h1><p>{JSON.stringify(route.query.params)}</p></div>);
}
export default Docs;