import React from "react";
import useSWR from "swr";
import { getSession, useSession } from "next-auth/react";

type Dashboard = {
  followers: number;
  likes: number;
};

const dashboardDataHandler: () => Promise<Dashboard> = async () => {
  const dashboardData = (await fetch("Http://localhost:4000/dashboard").then(
    (data) => data.json()
  )) as Dashboard;

  return dashboardData;
};

const Dashboard: () => JSX.Element = () => {
  const { data, error } = useSWR("dashboard", dashboardDataHandler);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Checking auth...</div>;
  }

  if (session) {
    return (
      <>
        <h1>Dashboard</h1>
        {!data && <p>Loading...</p>}
        {data && error && <p>An error occurred.</p>}
        {data && !error && (
          <ul>
            <li>Followers: {data.followers}</li>
            <li>Likes: {data.likes}</li>
          </ul>
        )}
      </>
    );
  } else {
    return <div>SOrry, you are unauthenticated, bitch.</div>;
  }
};

export default Dashboard;
