import React, { ReactNode } from "react";
import { useRouter } from "next/router";
import { NextRouter } from "next/dist/shared/lib/router/router";
import { NextPage, NextPageContext } from "next";
import styles from "styles/Events.module.styl";
import { getSession } from "next-auth/react";

export type Event = {
  id: string;
  title: string;
  category: string;
};

const fetchSportEvents = async (router: NextRouter) => {
  router.push("/events?category=sport", undefined, {
    shallow: true,
  });
  const response = await fetch("http://localhost:4000/events?category=sport");
  return await response.json();
};

type EventsPageType = {
  (props: { events: [Event] }): ReactNode;
  getLayout: (page: ReactNode) => ReactNode;
};

const Events: EventsPageType = ({ events }) => {
  const router = useRouter();
  const [eventsToShow, setEventsToShow] = React.useState<[Event]>(events);
  const handleFilterBySport = async () => {
    const sportEvents = await fetchSportEvents(router);
    setEventsToShow(sportEvents);
  };

  return (
    <>
      <button onClick={handleFilterBySport}>Only sport events</button>
      <h1>Events list</h1>
      <ul>
        {eventsToShow.map((event) => (
          <li key={event.id} className={styles.highlight}>
            {event.title} | {event.category}
          </li>
        ))}
      </ul>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  const { query } = context;
  const { category } = query ?? "";
  const queryString = category ? `category=${category}` : "";
  const response = await fetch(`http://localhost:4000/events?${queryString}`);
  const data: Array<Event> = await response.json();

  if (session) {
    data.push({
      id: "special-id",
      title: "special title for signed-in users",
      category: "signed-in",
    });
  }

  return {
    props: {
      session,
      events: data,
    },
  };
}

Events.getLayout = (page) => {
  return <>{page}</>;
};
export default Events;
