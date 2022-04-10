export const pageview = (url: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.gtag('config', process.env.NEXT_PUBLIC_MEASUREMENT_ID, {
    path_url: url,
  });
};

export const click = (label: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.gtag('event', 'download', {
    event_category: 'engagement',
    event_label: label,
    value: 1,
  });
};
