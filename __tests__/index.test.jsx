import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home', () => {
    it('renders a heading', () => {
        const givenArticles = [];
        render(<Home articles={givenArticles}/>)

        const heading = screen.getByRole('heading');

        expect(heading).toBeTruthy();
    })});

