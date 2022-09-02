export type GalleryPic = {
  src: string;
  name: string;
  dimensions: {
    ratio: number;
    thumbnail: {
      height: number;
      width: number;
    };
    original: {
      height: number;
      width: number;
    };
  };
};
