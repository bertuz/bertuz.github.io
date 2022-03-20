import React from "react";
import User from "../../components/User";

const UserPage: (props: {
  users: [{ id: string; name: string }];
}) => JSX.Element = ({ users }) => {
  return (
    <>
      <h1>Users</h1>
      {users.map((user) => (
        <User key={user.id} id={user.id} name={user.name} />
      ))}
    </>
  );
};

export async function getStaticProps() {
  console.log("....... preview for other page");
  const users = await fetch("https://jsonplaceholder.typicode.com/users");

  const usersObject = await users.json();
  console.log(usersObject);
  return {
    props: {
      users: usersObject,
    },
  };
}

export default UserPage;
