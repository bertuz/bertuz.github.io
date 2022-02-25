import puppeteer from "puppeteer";
import {toMatchImageSnapshot} from 'jest-image-snapshot';

let browser: any;
describe("App.js", () => {
    let page: any;

    beforeAll(async () => {

        expect.extend({ toMatchImageSnapshot });

        // jest.setTimeout(100000)
        browser = await puppeteer.launch();
        page = await browser.newPage();


    });

    afterAll(async () => {
        await browser.close();
    });


    it('should be titled "Google"', async () => {
        await page.goto('http://localhost:14568/about');

        // await expect(page.title()).resolves.toMatch('Hola');
        // await expect(page.getByText('Welcome to my page')).toBeTruthy();

        await expect(await page.screenshot()).toMatchImageSnapshot({allowSizeMismatch: true, failureThreshold: 0.7, updatePassedSnapshot: true, failureThresholdType: 'percent'});
    });


        // await page.goto("http://localhost:5000");
        // await page.waitForSelector(".App-welcome-text");
        // const text = await page.$eval(".App-welcome-text", (e) => e.textContent);
        // expect(text).toContain("Edit src/App.js and save to reload.");
    });


//
// import { render, screen } from '@testing-library/react'
// import Home from '../pages/index'
//
//
// beforeAll(async () => {
//     browser = await puppeteer.launch();
//     page = await browser.newPage();
// });
// describe('Home', () => {
//
//     beforeAll(async () => {
//         await page.goto('https://google.com');
//     });
//
//     it('should be titled "Google"', async () => {
//         await expect(page.title()).resolves.toMatch('Google');
//     });
// });
//
