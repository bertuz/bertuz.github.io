import { render } from '@testing-library/react'
import Home from '../pages/index'

it('renders homepage unchanged', () => {
    const givenArticles = [];
    const { container } = render(<Home articles={givenArticles} />)
    expect(container).toMatchSnapshot()
})
