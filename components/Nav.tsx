import navStyles from "../styles/Nav.module.styl";
import { FC } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import User from "./User";

type Props = {};

const Nav: FC<Props> = () => {
  const { data: session, status } = useSession();
  const user:
    | undefined
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id: string;
      } = session?.user as unknown as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
  };

  return (
    <nav className={navStyles.nav}>
      <ul
        className={`main-nav ${
          status === "loading" ? navStyles.navLoading : navStyles.navLoaded
        }`}
      >
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        {!session && (
          <li>
            <Link href="#">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  signIn("github");
                }}
              >
                Sign in
              </a>
            </Link>
          </li>
        )}
        {session && (
          <li>
            <Link href="#">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}
              >
                Sign out user {user.id}
              </a>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
