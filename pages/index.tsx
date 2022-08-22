import colors from '../assets/styles/colors';

import breakpoints, { MAX_MOBILE_WIDTH_PX } from '../assets/styles/breakpoints';

import { dimensionInRem } from '../assets/styles/dimensions';

import Button from '../components/button';

import CVExperienceItem from '../components/CVExperienceItem';
import * as ga from '../lib/google-analytics';

import TextLink from '../components/TextLink';

import Camera from '../public/camera.svg';

import Chat from '../components/chat';

import Face from '../public/smiley-face.svg';
import Laptop from '../public/mac.svg';
import Balloon from '../public/balloon.svg';

import { isRunningAcceptanceTest } from '../utils/testUtils';

import useDimensions from '../utils/useDimensions';
import GalleryMainPicture from '../components/gallery/mainPicture';

import { useEffect, useMemo, useRef, useState } from 'react';
import { css, keyframes } from '@emotion/react';

import Link from 'next/link';
import Image from 'next/image';

import type { GalleryPic } from 'components/gallery';

import type { NextPage } from 'next';

const backgroundColors: Record<string, [string, string, string]> = {
  // todo move magic-number colros into their own proper values in color module
  presentation: ['#D4910B', '#FFE0A3', '#FFE0A1'],
  description: ['#711F80', '#FADEFF', colors.almostWhite],
  work: ['#26701B', '#CAE3BA', colors.almostWhite],
  photos: ['#252A40', '#E3E9FF', colors.almostWhite],
  chat: [colors.vividBlue, colors.mountainGrey, colors.almostWhite],
};

const nodFaceKeyframes = keyframes({
  from: { marginTop: 0 },
  to: { marginTop: '10px' },
});

// todo adopt csslint when available https://github.com/emotion-js/emotion/issues/2695
const getClasses = (
  showMac: boolean,
  showingSection: 'presentation' | 'description' | 'work' | 'photos' | 'chat',
  shouldAnimate: boolean
) => ({
  imageTest: css({
    width: '100%',
    height: '100%',
    position: 'relative',
  }),
  imageClassLoading: css({
    opacity: 0.5,
  }),
  loadButHide: css({
    display: 'none !important',
    '& > div': {
      display: 'none !important',
    },
  }),
  imageClass: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    '& *': {
      transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    },
    display: 'block',
    border: `7px solid ${colors.almostWhite} !important`,
    borderRadius: 5,
  }),
  asideColumn: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    position: 'fixed',
    overflow: 'hidden',
    bottom: 0,
    left: 0,
    top: 0,
    width: '50vw',
    background:
      showingSection !== 'photos'
        ? `transparent radial-gradient(ellipse 220% 95% at 120% center,  ${backgroundColors[showingSection][1]} 2%, ${backgroundColors[showingSection][0]} 40%)`
        : backgroundColors[showingSection][0],
    [breakpoints.maxMobile]: {
      display: 'none',
    },
  }),
  illustrationForSection: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    // todo wait transform and remove it from the DOM
    transform: showingSection !== 'photos' ? 'none' : 'translate(-200%, 0%)',
    position: 'absolute',
    width: showMac ? '35%' : '45%',
    height: showMac ? '35%' : '45%',
    left: showMac ? '33%' : '25%',
    top: '35%',
    '& > div': {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
  }),
  smileyFace: css({
    width: '100%',
    color: colors.almostWhite,
    zIndex: '1',
  }),
  laptop: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: showMac ? 'translate(-100%, 25%)' : 'translate(-100vw, 100vh)',
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,
    stroke: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: backgroundColors[showingSection][0],
    zIndex: '1',
  }),
  balloon: css({
    position: 'absolute',
    width: '80%',
    height: '80%',
    transition: shouldAnimate
      ? 'all 0.5s cubic-bezier(1,1,.61,1.45)'
      : undefined,
    transform:
      showingSection === 'chat'
        ? 'translate(-10%, -50%) rotate(20deg)'
        : 'translate(-70%, 20%) rotate(90deg) scaleX(0) scaleY(0)',
    stroke: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: backgroundColors[showingSection][0],
    zIndex: '0',
  }),
  face: css({
    height: '100%',
    width: '100%',
    fill: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '3 !important',
    animation: shouldAnimate
      ? `${nodFaceKeyframes} 3s alternate infinite !important`
      : undefined,
  }),
  mainContent: css({
    backgroundColor: colors.white,
    padding: 0,
    margin: 0,
    paddingLeft: '50vw',
    [breakpoints.maxMobile]: {
      paddingLeft: 0,
    },
  }),
  card: css({
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,
    padding: 24,
    paddingLeft: 48,
    opacity: 0.3,
    backgroundColor: colors.white,
  }),
  cardFocused: {
    opacity: 1,
    paddingLeft: 24,
    backgroundColor: backgroundColors[showingSection][1] ?? colors.senape,
  },
  cardUnfocused: css({
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    paddingRight: 0,
    backgroundColor: colors.almostWhite,
  }),
  presentationCard: css({
    position: 'relative',
    overflow: 'hidden',
    height: '80vh',
    minHeight: 230,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [breakpoints.maxMobile]: {
      height: '35vh',
    },
  }),
  presentationCardLogo: css({
    display: 'none',
    width: '2.5rem',
    height: '3.4rem',
    [breakpoints.maxMobile]: {
      display: 'inline',
    },
  }),
  nameTitle: css({
    fontFamily: "'Indie Flower', cursive",
  }),
  jobDescription: css({
    fontSize: dimensionInRem(1),
    margin: 0,
    textAlign: 'center',
    fontFamily: "'Alegreya SC', serif",
  }),
  descriptionCard: css({
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    backgroundColor: colors.mountainGrey,
    fontFamily: "'Alegreya', serif",
  }),
  photoCard: css({
    backgroundColor: '#A2B4FF',
    fontFamily: "'Alegreya', serif",
  }),
  presentationDescription: css({
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  workCard: css({
    fontFamily: "'Alegreya', serif",
  }),
  chatCard: css({
    backgroundColor: colors.mountainGrey,
    minHeight: '33vh',
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    fontFamily: "'Alegreya', serif",
  }),
  chatWrapper: css({
    marginTop: dimensionInRem(0),
  }),
  footer: css({
    display: 'block',
    backgroundColor: colors.senape,
  }),
  footerContent: css({
    textAlign: 'center',
    fontFamily: "'Alegreya', serif",
    textTransform: 'uppercase',
    margin: 0,
    padding: 24,
  }),
  polaroid: css({
    position: 'absolute',
    height: 45,
    width: 45,
    padding: '20px',
    border: '15px solid ' + colors.mountainGrey,
    borderBottom: '55px solid ' + colors.mountainGrey,
    boxShadow: '3px 1px 33px -4px rgba(0,0,0,0.75)',
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,
    [breakpoints.maxMobile]: {
      height: 25,
      width: 25,
      padding: 10,
      border: '5px solid ' + colors.mountainGrey,
      borderBottom: '20px solid ' + colors.mountainGrey,
    },
  }),
  frontPolaroid: css({
    bottom: -10,
    right: 80,
    rotate: '-15deg',
    backgroundColor: colors.pastelViolet,
    '&:hover': shouldAnimate
      ? {
          transform: 'translate(-10px, -10px)',
        }
      : undefined,
    svg: {
      '& > *': {
        stroke: '#795E98FF !important',
      },
    },
    [breakpoints.maxMobile]: {
      top: -10,
      right: -25,
      '&:hover': {
        top: 10,
        rotate: '7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  middlePolaroid: css({
    bottom: 0,
    right: 40,
    rotate: '-5deg',
    backgroundColor: colors.sugarPaperBlue,
    '&:hover': shouldAnimate
      ? {
          rotate: '-5deg',
          transform: 'translate(0px, -20px)',
        }
      : undefined,
    svg: {
      '& > *': {
        stroke: '#53777EFF !important',
      },
    },
    [breakpoints.maxMobile]: {
      top: 10,
      right: -5,
      rotate: '-50deg',
      '&:hover': {
        top: 10,
        rotate: '-35deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  backPolaroid: css({
    bottom: -5,
    right: 0,
    rotate: '10deg',
    backgroundColor: 'grey',
    '&:hover': shouldAnimate
      ? {
          rotate: '5deg',
          transform: 'translate(0px, -20px)',
        }
      : undefined,
    [breakpoints.maxMobile]: {
      top: 45,
      right: -20,
      rotate: '-80deg',
      '&:hover': {
        top: 40,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        top: 40,
        right: 5,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  pic: {
    height: '100%',
    width: '100%',
  },
  galleryArticle: css({
    position: 'relative',
  }),
  galleryArticleImage: css({
    borderRadius: 3,
    '&: hover': {
      cursor: 'pointer',
    },
  }),
  galleryArticleImageSelected: css({
    border: '4px solid #7F90DB !important',
  }),
  galleryMainPicCanvas: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    transform: showingSection === 'photos' ? 'none' : 'translate(200%, 0%)',
    height: 'calc(100% - 60px)',
    width: 'calc(100% - 60px)',
    margin: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  }),
});

type HomeProperties = {
  galleryPics: Array<GalleryPic>;
};

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const convertImage =
  () => `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
        "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100px" height="100px" viewBox="0 0 148 48" version="1.1" xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/"
     style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">


    <path>
        <animate
                attributeName="d"
                keyTimes="0; 0.166667; 0.33; 1"
                values="m 23.908683,31.80871 c 0.186066,0.238949 0.380946,0.467124 0.584639,0.683549 0.157667,0.191942 0.327085,0.377029 0.505317,0.55624 1.484611,1.483631 3.399133,2.276861 5.344014,2.376748 0.935226,0.09695 1.907666,0.05288 2.897733,-0.144935 4.723141,-0.94404 8.591357,-5.647595 8.948799,-11.176695 0.391719,-6.067713 -3.331562,-11.202157 -8.533577,-12.229438 -3.053442,-0.602266 -5.352827,-0.07834 -7.094014,0.7237 -3.422636,1.576665 -5.45957,4.617376 -5.997203,8.298546 -0.509234,3.48825 0.767767,7.414243 1.647174,8.843035 0.521965,0.847091 1.095831,1.526721 1.697118,2.06925 z M 21.77382,22.909856 c -0.115557,0.36234 -0.211528,0.760913 -0.279099,1.199637 0.06365,-0.412283 0.157666,-0.812815 0.279099,-1.199637 z m 0.09499,-0.284975 -0.06659,0.199776 0.08031,-0.23601 z;m 17.34192,39.106159 c 0.331891,0.426218 0.679504,0.833219 1.042836,1.219264 0.281235,0.342371 0.58343,0.672517 0.901346,0.992178 2.648137,2.64639 6.063116,4.061292 9.532248,4.239463 1.668186,0.172931 3.40275,0.09433 5.168758,-0.258524 8.42478,-1.683905 15.32461,-10.073752 15.962189,-19.936144 C 50.648015,14.53927 44.006709,5.3808368 34.727748,3.5484509 29.28125,2.4741747 25.17978,3.4087147 22.073982,4.8393327 15.968943,7.6516686 12.335616,13.075459 11.376626,19.641651 c -0.908332,6.222077 1.369484,13.224966 2.938105,15.773535 0.931041,1.510979 1.954659,2.723253 3.027189,3.690973 z M 13.533914,23.233056 c -0.206122,0.646314 -0.377308,1.357259 -0.497835,2.139823 0.113535,-0.735399 0.281231,-1.449839 0.497835,-2.139823 z m 0.169434,-0.508315 -0.118776,0.356345 0.143249,-0.420977 z;m 23.908683,31.80871 c 0.186066,0.238949 0.380946,0.467124 0.584639,0.683549 0.157667,0.191942 0.327085,0.377029 0.505317,0.55624 1.484611,1.483631 3.399133,2.276861 5.344014,2.376748 0.935226,0.09695 1.907666,0.05288 2.897733,-0.144935 4.723141,-0.94404 8.591357,-5.647595 8.948799,-11.176695 0.391719,-6.067713 -3.331562,-11.202157 -8.533577,-12.229438 -3.053442,-0.602266 -5.352827,-0.07834 -7.094014,0.7237 -3.422636,1.576665 -5.45957,4.617376 -5.997203,8.298546 -0.509234,3.48825 0.767767,7.414243 1.647174,8.843035 0.521965,0.847091 1.095831,1.526721 1.697118,2.06925 z M 21.77382,22.909856 c -0.115557,0.36234 -0.211528,0.760913 -0.279099,1.199637 0.06365,-0.412283 0.157666,-0.812815 0.279099,-1.199637 z m 0.09499,-0.284975 -0.06659,0.199776 0.08031,-0.23601 z;m 23.908683,31.80871 c 0.186066,0.238949 0.380946,0.467124 0.584639,0.683549 0.157667,0.191942 0.327085,0.377029 0.505317,0.55624 1.484611,1.483631 3.399133,2.276861 5.344014,2.376748 0.935226,0.09695 1.907666,0.05288 2.897733,-0.144935 4.723141,-0.94404 8.591357,-5.647595 8.948799,-11.176695 0.391719,-6.067713 -3.331562,-11.202157 -8.533577,-12.229438 -3.053442,-0.602266 -5.352827,-0.07834 -7.094014,0.7237 -3.422636,1.576665 -5.45957,4.617376 -5.997203,8.298546 -0.509234,3.48825 0.767767,7.414243 1.647174,8.843035 0.521965,0.847091 1.095831,1.526721 1.697118,2.06925 z M 21.77382,22.909856 c -0.115557,0.36234 -0.211528,0.760913 -0.279099,1.199637 0.06365,-0.412283 0.157666,-0.812815 0.279099,-1.199637 z m 0.09499,-0.284975 -0.06659,0.199776 0.08031,-0.23601 z;"
                dur="3s"
                repeatCount="indefinite" />
    </path>
    <path d="m 66.959506,18.733695 c -2.046,1.978 -2.929,4.474 -2.982,6.529 -0.055,2.134 0.331,5.133 3.333,7.362 0.277,0.312 0.579,0.608 0.904,0.889 1.452,1.255 3.573,2.429 6.846,2.429 4.25,0 7.495,-2.393 9.001,-6.292 1.433,-2.95 1.376,-7.927 0.682,-10.009 -0.764,-2.293 -1.976,-3.793 -3.435,-4.733 -0.363,-0.39 -0.671,-0.632 -0.838,-0.766 -2.395,-1.924 -4.945,-2.269 -7.53,-1.55 -1.421,0.396 -3.368,1.28 -4.879,3.605 -0.3,0.461 -0.727,1.369 -1.102,2.536 z;">
        <animate
                attributeName="d"
                keyTimes="0; 0.166667; 0.33; 1"
                values="m 66.959506,18.733695 c -2.046,1.978 -2.929,4.474 -2.982,6.529 -0.055,2.134 0.331,5.133 3.333,7.362 0.277,0.312 0.579,0.608 0.904,0.889 1.452,1.255 3.573,2.429 6.846,2.429 4.25,0 7.495,-2.393 9.001,-6.292 1.433,-2.95 1.376,-7.927 0.682,-10.009 -0.764,-2.293 -1.976,-3.793 -3.435,-4.733 -0.363,-0.39 -0.671,-0.632 -0.838,-0.766 -2.395,-1.924 -4.945,-2.269 -7.53,-1.55 -1.421,0.396 -3.368,1.28 -4.879,3.605 -0.3,0.461 -0.727,1.369 -1.102,2.536 z;m 60.910558,13.95244 c -3.745633,3.621144 -5.36215,8.190595 -5.459177,11.952705 -0.100689,3.906734 0.605964,9.397032 6.101756,13.477685 0.507107,0.571184 1.059981,1.113073 1.654962,1.627503 2.65819,2.297541 6.541126,4.446794 12.53304,4.446794 7.780518,0 13.721171,-4.38089 16.478219,-11.518828 2.623409,-5.400595 2.519058,-14.512036 1.248545,-18.323575 C 92.069241,11.416907 89.85042,8.6708405 87.179416,6.9499745 86.514868,6.2359964 85.951008,5.7929645 85.645281,5.547649 81.260729,2.0253638 76.592419,1.3937688 71.860035,2.7100488 69.258596,3.4350096 65.694203,5.0533573 62.928,9.3097577 62.378787,10.153716 61.597075,11.816001 60.910558,13.95244 Z;m 66.959506,18.733695 c -2.046,1.978 -2.929,4.474 -2.982,6.529 -0.055,2.134 0.331,5.133 3.333,7.362 0.277,0.312 0.579,0.608 0.904,0.889 1.452,1.255 3.573,2.429 6.846,2.429 4.25,0 7.495,-2.393 9.001,-6.292 1.433,-2.95 1.376,-7.927 0.682,-10.009 -0.764,-2.293 -1.976,-3.793 -3.435,-4.733 -0.363,-0.39 -0.671,-0.632 -0.838,-0.766 -2.395,-1.924 -4.945,-2.269 -7.53,-1.55 -1.421,0.396 -3.368,1.28 -4.879,3.605 -0.3,0.461 -0.727,1.369 -1.102,2.536 z;m 66.959506,18.733695 c -2.046,1.978 -2.929,4.474 -2.982,6.529 -0.055,2.134 0.331,5.133 3.333,7.362 0.277,0.312 0.579,0.608 0.904,0.889 1.452,1.255 3.573,2.429 6.846,2.429 4.25,0 7.495,-2.393 9.001,-6.292 1.433,-2.95 1.376,-7.927 0.682,-10.009 -0.764,-2.293 -1.976,-3.793 -3.435,-4.733 -0.363,-0.39 -0.671,-0.632 -0.838,-0.766 -2.395,-1.924 -4.945,-2.269 -7.53,-1.55 -1.421,0.396 -3.368,1.28 -4.879,3.605 -0.3,0.461 -0.727,1.369 -1.102,2.536 z;"
                dur="3s"
                begin="1s"
                repeatCount="indefinite" />
    </path>
    <path
    d="m 113.14351,15.290695 c -1.77,0.606 -3.176,1.641 -4.27,2.785 -5.893,6.167 -2.207,18.311 7.511,18.311 3.758,0 7.17,-1.978 9.224,-5.481 0.698,-1.063 1.258,-2.249 1.575,-3.431 0.524,-1.954 0.476,-3.895 -0.062,-5.653 -0.269,-1.552 -0.801,-2.996 -1.581,-4.167 -1.096,-1.643 -2.644,-2.855 -4.702,-3.471 -1.57,-0.47 -4.675,-0.617 -7.695,1.107 z">
        <animate
                attributeName="d"
                keyTimes="0; 0.166667; 0.33; 1"
                values="m 113.14351,15.290695 c -1.77,0.606 -3.176,1.641 -4.27,2.785 -5.893,6.167 -2.207,18.311 7.511,18.311 3.758,0 7.17,-1.978 9.224,-5.481 0.698,-1.063 1.258,-2.249 1.575,-3.431 0.524,-1.954 0.476,-3.895 -0.062,-5.653 -0.269,-1.552 -0.801,-2.996 -1.581,-4.167 -1.096,-1.643 -2.644,-2.855 -4.702,-3.471 -1.57,-0.47 -4.675,-0.617 -7.695,1.107 z;m 110.57344,5.4376018 c -3.39497,1.1623483 -6.09178,3.1475474 -8.19016,5.3418152 -11.303152,11.828715 -4.233146,35.121709 14.40662,35.121709 7.20807,0 13.75253,-3.793935 17.69221,-10.51292 1.33882,-2.038904 2.41295,-4.313732 3.02096,-6.580885 1.00507,-3.747902 0.91302,-7.470869 -0.11886,-10.842827 -0.51596,-2.97684 -1.53637,-5.746527 -3.03246,-7.9925823 -2.10219,-3.1513848 -5.07139,-5.4760799 -9.01876,-6.6576092 -3.01134,-0.9014911 -8.96695,-1.1834448 -14.75952,2.1232993 z;m 113.14351,15.290695 c -1.77,0.606 -3.176,1.641 -4.27,2.785 -5.893,6.167 -2.207,18.311 7.511,18.311 3.758,0 7.17,-1.978 9.224,-5.481 0.698,-1.063 1.258,-2.249 1.575,-3.431 0.524,-1.954 0.476,-3.895 -0.062,-5.653 -0.269,-1.552 -0.801,-2.996 -1.581,-4.167 -1.096,-1.643 -2.644,-2.855 -4.702,-3.471 -1.57,-0.47 -4.675,-0.617 -7.695,1.107 z;m 113.14351,15.290695 c -1.77,0.606 -3.176,1.641 -4.27,2.785 -5.893,6.167 -2.207,18.311 7.511,18.311 3.758,0 7.17,-1.978 9.224,-5.481 0.698,-1.063 1.258,-2.249 1.575,-3.431 0.524,-1.954 0.476,-3.895 -0.062,-5.653 -0.269,-1.552 -0.801,-2.996 -1.581,-4.167 -1.096,-1.643 -2.644,-2.855 -4.702,-3.471 -1.57,-0.47 -4.675,-0.617 -7.695,1.107 z;"
                dur="3s"
                begin="2s"
                repeatCount="indefinite" />
    </path>
</svg>`;

const Home: NextPage<HomeProperties> = ({ galleryPics }) => {
  const [showMac, setShowMac] = useState(false);
  const [showingSection, setShowingSection] = useState<
    'presentation' | 'description' | 'work' | 'photos' | 'chat'
  >('presentation');
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);
  const classes = useMemo(() => {
    return getClasses(showMac, showingSection, shouldAnimate);
  }, [showMac, showingSection, shouldAnimate]);
  const descriptionCardRef = useRef<HTMLElement | null>(null);
  const workCardRef = useRef<HTMLElement | null>(null);
  const chatCardRef = useRef<HTMLElement | null>(null);
  const photoCardRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const asideDims = useDimensions(asideRef);

  const [galleryPicSelected, setGalleryPicSelected] = useState<number>(0);
  console.log('galleryPicSelected: ', galleryPicSelected);

  useEffect(() => {
    if (isRunningAcceptanceTest()) {
      setShouldAnimate(false);
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleMedia = (e: MediaQueryListEventMap['change']) =>
      setShouldAnimate(!e.matches);
    mediaQuery.addEventListener('change', handleMedia);

    return () => {
      mediaQuery.removeEventListener('change', handleMedia);
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate) {
      (
        global?.window?.document
          ?.getElementsByClassName(`css-${classes.face.name}`)
          ?.item(0) as SVGSVGElement
      )?.pauseAnimations();

      (
        global?.window?.document
          ?.getElementsByClassName(`css-${classes.smileyFace.name}`)
          ?.item(0) as SVGSVGElement
      )?.pauseAnimations();
    }
  }, [classes.face.name, classes.smileyFace.name, shouldAnimate]);

  useEffect(() => {
    function updatePosition() {
      const windowHeight: number = isNaN(window.innerHeight)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.clientHeight
        : window.innerHeight;
      const windowWidth: number = isNaN(window.innerWidth)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.clientWidth
        : window.innerWidth;

      if (
        windowHeight -
          (chatCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('chat');
        return;
      }

      if (
        windowHeight -
          (photoCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('photos');
        return;
      }

      if (
        windowHeight -
          (workCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('work');
        return;
      }

      if (
        windowHeight -
          (descriptionCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        (windowWidth > MAX_MOBILE_WIDTH_PX
          ? windowHeight / 3
          : (windowHeight * 3) / 4)
      ) {
        setShowMac(true);
        setShowingSection('description');
        return;
      }

      setShowMac(false);
      setShowingSection('presentation');
    }

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  useEffect(() => {
    if (showingSection === 'chat') {
      document.body.style.background = colors.vividBlue;
    } else {
      document.body.style.background = '#D4910B';
    }
  }, [showingSection]);

  return (
    <>
      <aside
        css={classes.asideColumn}
        role={showingSection !== 'photos' ? 'presentation' : 'complementary'}
        ref={asideRef}
      >
        <div css={classes.illustrationForSection} role="presentation">
          <div>
            <Face css={classes.face} />
            <Laptop css={classes.laptop} />
            <Balloon css={classes.balloon} />
          </div>
        </div>
        <GalleryMainPicture
          css={classes.galleryMainPicCanvas}
          role={showingSection === 'photos' ? 'img' : 'none'}
          aria-label={"Big version of the photo gallery's selected picture"}
          galleryPics={galleryPics}
          galleryPicSelectedIndex={galleryPicSelected}
          availableMainPictureSpace={asideDims}
        />
      </aside>
      <main css={classes.mainContent}>
        <article
          css={[
            classes.card,
            classes.presentationCard,
            showingSection === 'presentation'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <div>
            <img
              src={
                shouldAnimate ? '/smiley-face.svg' : '/smiley-face-static.svg'
              }
              css={classes.presentationCardLogo}
              alt="Presentation logo"
              role="presentation"
            />
          </div>
          <h1 css={classes.nameTitle}>Matteo Bertamini</h1>
          <p css={classes.jobDescription}>Fullstack Developer</p>
          {/* todo if not on mobile use blank */}
          <a
            href="https://www.amazon.it/photos/share/qFervNlenYwkjdQ1o26YOsWhld5fnsJ0t89xbcv2Vep"
            rel="noreferrer"
            onClick={() => {
              ga.click('photos');
            }}
          >
            <div css={[classes.polaroid, classes.backPolaroid]}>
              <Camera css={classes.pic} />
            </div>
            <div css={[classes.polaroid, classes.middlePolaroid]}>
              <Camera css={classes.pic} />
            </div>
            <div css={[classes.polaroid, classes.frontPolaroid]}>
              <Camera css={classes.pic} />
            </div>
          </a>
        </article>
        <article
          ref={descriptionCardRef}
          css={[
            classes.card,
            classes.descriptionCard,
            showingSection === 'description'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2>Toolbox</h2>
          <p css={classes.presentationDescription}>
            I like the idea of a developer as an artisan who loves and cares its
            product the most. <br />
            Pushed by that mindset, I constantly grow and cover different
            expertises.
          </p>
          <p css={classes.presentationDescription}>
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
        <article
          ref={workCardRef}
          css={[
            classes.card,
            classes.workCard,
            showingSection === 'work'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2 id="work-experience">Work Experience</h2>
          <CVExperienceItem>
            <Link href="/api/cv" prefetch>
              <a
                role="link"
                download="Curriculum-Matteo-Bertamini.pdf"
                onKeyPress={() => {
                  ga.click('cv');
                }}
                onClick={() => {
                  ga.click('cv');
                }}
                tabIndex={0}
              >
                <Button caption="Download CV" iconPath="/download.svg" />
              </a>
            </Link>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Telefónica',
              experienceDates: '2017 - Present',
            }}
          >
            I&apos;m part of a multidisciplinary team that aims to fully
            digitalize the{' '}
            <TextLink href="https://www.movistar.es/particulares/movil/servicios/app-mimovistar/">
              customer care experience
            </TextLink>
            , from solving technical issues remotely to support{' '}
            <TextLink href="https://www.movistar.es/citaprevia">
              their visit
            </TextLink>{' '}
            in physical shops. Our work is visible on Vivo Brasil, Movistar
            (worldwide), O2 (worldwide) and Tuenti&apos;s apps.
            <ul>
              <li>Frontend: Typescript, React, Next.JS, Jest (and more!)</li>
              <li>Backend: Kotlin and Node, PHP8 and Java8 on legacy</li>
              <li>Kubernetes for our 52 environments 🤪</li>
              <li>We work in CI/CD, depending on the environment/product</li>
              <li>Clean architectures</li>
              <li>DDD: evangelizing the adoption</li>
              <li>
                Development of{' '}
                <TextLink href="https://www.npmjs.com/package/ya-google-maps-react">
                  google Maps interfaces
                </TextLink>
              </li>
            </ul>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Belka',
              experienceDates: '2015 - 2017',
            }}
          >
            Evolution of a legacy{' '}
            <TextLink href="https://www.electricautomationnetwork.com/en/carlo-gavazzi/carlo-gavazzi-em2serverstdl1">
              HW-SW platform
            </TextLink>{' '}
            to plan, analyse and monitoring energy and environmental data to cut
            energy-related costs in big and industrial buildings.
            <ul>
              <li>
                Legacy: evolution of an undocumented old back-frontend towards a
                long lasting, future-proof solution
                <ul>
                  <li>Adoption of DDD</li>
                  <li>
                    Progressive transition to{' '}
                    <TextLink href="https://www.reactivemanifesto.org/">
                      Reactive architecture
                    </TextLink>
                  </li>
                  <li>
                    BDD and Acceptance testing in order to cover old a new
                    requisites
                  </li>
                  <li>
                    Evolution in scrum cycles with a tight collaboration with
                    the stakeholders
                  </li>
                </ul>
              </li>
              <li>
                <TextLink href="https://github.com/BelkaLab/react-translatable-input">
                  Multi-lang
                </TextLink>{' '}
                <TextLink href="https://github.com/BelkaLab/i18n-timezones">
                  multi-timezones
                </TextLink>{' '}
                challenging requisites that led to implement tailored solutions
              </li>
              <li>Backend: PHP7, Symfony framework</li>
              <li>Frontend: React</li>
            </ul>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Tembo',
              experienceDates: '2014 - 2015',
            }}
          >
            Evolution and maintenance of Tembo White, an independent e-commerce
            platform based on Prestashop.
            <ul>
              <li>Prestashop</li>
              <li>
                React JS for frontend embedded widgets in products&apos; pages
              </li>
              <li>Continuous deployment</li>
            </ul>
          </CVExperienceItem>
        </article>
        <article
          ref={photoCardRef}
          css={[
            classes.card,
            classes.photoCard,
            showingSection === 'photos'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2>Photos</h2>
          <div
            // todo study grid properly
            style={{
              minHeight: 400,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'auto auto auto',
              gridAutoRows: '150px',
              columnGap: 10,
              rowGap: 10,
              marginTop: dimensionInRem(1),
            }}
          >
            {galleryPics.map((image, index: number) => (
              <article key={image.name} css={classes.galleryArticle}>
                <Image
                  width={image.dimensions.thumbnail.width}
                  height={image.dimensions.thumbnail.height}
                  onClick={() => {
                    if (showingSection !== 'photos') {
                      return;
                    }
                    setGalleryPicSelected(index);
                  }}
                  src={image.src}
                  layout="fill"
                  objectFit="cover"
                  sizes="200px"
                  objectPosition="50% 50%"
                  alt={`Image number ${index + 1}`}
                  quality={50}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    convertImage()
                  )}`}
                  css={[
                    classes.galleryArticleImage,
                    galleryPicSelected === index
                      ? classes.galleryArticleImageSelected
                      : null,
                  ]}
                />
              </article>
            ))}
          </div>
        </article>
        <article
          ref={chatCardRef}
          css={[
            classes.card,
            classes.chatCard,
            showingSection === 'chat'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2 id="chat-with-me">Chat with me</h2>
          <div css={classes.chatWrapper}>
            <Chat />
          </div>
        </article>
        <div css={classes.footer}>
          <p css={classes.footerContent}>Matteo Bertamini 2022</p>
        </div>
      </main>
    </>
  );
};

export async function getStaticProps() {
  try {
    const response = await fetch(
      'https://www.amazon.it/drive/v1/nodes/mmVUOJzUS_KqKRykQrzFPA/children?asset=ALL&filters=kind%3A(FILE*+OR+FOLDER*)+AND+contentProperties.contentType%3A(image*)+AND+status%3A(AVAILABLE*)&limit=15&lowResThumbnail=true&searchOnFamily=true&sort=%5B%27contentProperties.contentDate+DESC%27%5D&tempLink=true&shareId=qFervNlenYwkjdQ1o26YOsWhld5fnsJ0t89xbcv2Vep&offset=0&resourceVersion=V2&ContentType=JSON&_=1660508015523'
    );

    if (!response?.body) {
      return [];
    }

    const data = await response.json();

    const images = data.data.map(
      (photo: {
        contentProperties: { image: { height: number; width: number } };
        tempLink: string;
        name: string;
      }) => {
        const { height: originalHeight, width: originalWidth } =
          photo.contentProperties.image;
        const dimensionsRatio =
          originalHeight > originalWidth
            ? originalWidth / originalHeight
            : originalHeight / originalWidth;

        const width =
          originalWidth > originalHeight ? 200 : 150 * dimensionsRatio;
        const height =
          originalHeight > originalWidth ? 150 : 200 * dimensionsRatio;

        return {
          src: photo.tempLink,
          name: photo.name,
          dimensions: {
            ratio: dimensionsRatio,
            thumbnail: {
              height,
              width,
            },
            original: {
              height: originalHeight,
              width: originalWidth,
            },
          },
        };
      }
    );

    return {
      props: {
        galleryPics: images,
      },
    };
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default Home;
