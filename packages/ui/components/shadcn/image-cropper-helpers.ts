interface ImageLike {
  onload: ((event?: unknown) => void) | null;
  onerror: ((error?: unknown) => void) | null;
  src: string;
}

type ImageFactory = () => ImageLike;

function createBrowserImage(): ImageLike {
  return new Image() as unknown as ImageLike;
}

export function preloadImageSource(
  source: string,
  createImage: ImageFactory = createBrowserImage,
) {
  return new Promise<void>((resolve, reject) => {
    const image = createImage();

    image.onload = () => {
      resolve();
    };

    image.onerror = (error) => {
      reject(
        error instanceof Error ? error : new Error("Failed to load image"),
      );
    };

    image.src = source;
  });
}
