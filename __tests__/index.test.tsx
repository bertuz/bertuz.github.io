import Button from '../components/button';

import { render, screen } from '@testing-library/react';

describe('Home', () => {
  it('renders a heading', async () => {
    render(<Button caption="ciao" iconPath="." />);

    const heading = await screen.findByText('ciao');

    expect(heading).toBeInTheDocument();
  });
});
