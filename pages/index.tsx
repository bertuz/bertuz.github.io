import type { NextPage } from "next";
import myStyles from "../styles/Home.module.css";

const Home: NextPage = () => {

  return (
    <div className={myStyles.content}>
      <aside className={myStyles.sx}>
          <img src="/smiley-face.svg" className={myStyles.sideSmileyFace}/>
      </aside>
      <main className={myStyles.dx}>
        <article
          style={{
            textAlign: "center",
            backgroundColor: "#EBAB26",
            height: "80vh",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              lineHeight: "1rem",
              fontFamily: "'Indie Flower', cursive",
            }}
          >
            Matteo Bertamini
          </h1>
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontFamily: "'Alegreya', serif;",
              textTransform: "uppercase",
            }}
          >
            Fullstack Developer
          </p>
        </article>
        <article style={{height: '70vh', backgroundColor: '#CFC3B6', flexShrink: 0, padding: '20px'}}>
            <p style={{fontFamily: "'Alegreya', serif", fontSize: '1.2em'}}>
                Hi! My presentation will be placed here, one day :P
            </p>
        </article>
        {/*<article style="height: 70vh; background-color: #DDF4C8; flex-shrink: 0; padding: 20px;">*/}
        {/*    <p style="font-family: 'Alegreya', serif; font-size: 1.2em;">*/}
        {/*        Come near, ladies and gentlemen!*/}
        {/*    </p>*/}
        {/*</article>*/}
        {/*<footer style="background-color: #EBAB26; flex-shrink: 0; text-align: center">*/}
        {/*    <p style="text-align: center;font-family: 'Alegreya', serif;text-transform: uppercase;">*/}
        {/*        Matteo Bertamini 2022*/}
        {/*    </p>*/}
        {/*</footer>*/}
      </main>
    </div>
  );
};

export default Home;
