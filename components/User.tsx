const User: (props: { id: string; name: string }) => JSX.Element = ({
  id,
  name,
}) => {
  return (
    <div>
      id: {id}
      <br />
      {name}
    </div>
  );
};

export default User;
