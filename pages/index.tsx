import type { NextPage } from 'next';
import classes from '../styles/Home.module.css';
import { useEffect, useRef, useState } from 'react';

const Home: NextPage = () => {
  const contentRef = useRef<HTMLElement>(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    function updatePosition() {
      setScroll(contentRef.current?.scrollTop ?? 0);
    }

    if (contentRef.current === null) {
      return;
    }

    contentRef.current.addEventListener('scroll', updatePosition);
    updatePosition();

    return () =>
      contentRef.current?.removeEventListener('scroll', updatePosition);
  }, [contentRef.current]);

  return (
    <>
      <aside className={classes.decorativeDescription} role="presentation">
        <img
          src="/smiley-face.svg"
          className={classes.sideSmileyFace}
          alt="Presentation logo"
          role="presentation"
        />
        <img
          src="/mac.svg"
          alt="mac"
          role="presentation"
          className={[
            classes.mac,
            scroll > 200 ? classes.macShow : classes.macHide,
          ].join(' ')}
        />
      </aside>
      <div className={classes.content}>
        <main ref={contentRef} id="tst" className={classes.dx}>
          <article className={classes.cardSection}>
            <h1 className={classes.nameTitle}>Matteo Bertamini</h1>
            <p className={classes.jobDescription}>Fullstack Developer</p>
          </article>
          <article className={classes.presentationSection}>
            <h2>Toolbox</h2>
            <p className={classes.presentationDescription}>
              I like the idea of a developer as an artisan who loves and cares
              its product the most. <br />
              Pushed by that mindset, I constantly grow and cover different
              expertises.
            </p>
            <p className={classes.presentationDescription}>
              With that in mind, this is what I currently have in my toolbox 🧑🏽‍💻:
            </p>
            <ul>
              <li>
                Frontend
                <ul>
                  <li>ES6: vanilla, Typescript, Flow.js</li>
                  <li>React</li>
                  <li>Next.JS</li>
                </ul>
              </li>
              <li>
                Backend
                <ul>
                  <li>Node</li>
                  <li>Java: Kotlin, Groovy</li>
                  <li>PHP: symfony</li>
                  <li>C++: Qt</li>
                </ul>
              </li>
              <li>
                Cross
                <ul>
                  <li>Agile: kanban and scrum</li>
                  <li>Kubernetes</li>
                  <li>Hexagonal architecture</li>
                  <li>DDD</li>
                </ul>
              </li>
            </ul>
          </article>
          {/*<article style="height: 70vh; background-color: #DDF4C8; flex-shrink: 0; padding: 20px;">*/}
          {/*    <p style="font-family: 'Alegreya', serif; font-size: 1.2em;">*/}
          {/*        Come near, ladies and gentlemen!*/}
          {/*    </p>*/}
          {/*</article>*/}
          <footer className={classes.footer}>
            <p className={classes.footerContent}>Matteo Bertamini 2022</p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Home;
