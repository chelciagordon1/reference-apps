import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import { List } from "../../list";

export type ThumbnailContentLocation = "inside" | "below";

export interface BaseThumbnailProps {
  backgroundImage: string;
  contentLocation?: ThumbnailContentLocation;
  large?: boolean;
}

export interface BaseThumbnailWithLinkProps extends BaseThumbnailProps {
  href: string;
}
export interface ThumbnailProps extends BaseThumbnailWithLinkProps {
  title: string;
  subtitle?: string;
  playButton?: boolean;
  callToAction?: {
    text: string;
    display?: "always" | "hover";
  };
  tags?: string[];
  releaseDate?: string;
  duration?: string;
}

const BaseThumbnail: React.FC<BaseThumbnailProps> = ({
  backgroundImage,
  contentLocation = "inside",
  children,
  large,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.addEventListener("load", () => {
      setImageLoaded(true);
    });
    image.src = backgroundImage;
  }, [backgroundImage]);

  return (
    <div
      // scale-[1.0001] stops a rough animation on a scale transition
      className={`
          ${
            large
              ? "aspect-h-4 aspect-w-3 md:hover:scale-[1.03]"
              : "aspect-h-9 aspect-w-16 md:hover:scale-105"
          }
          relative z-30 block w-full scale-[1.0001] rounded-sm bg-cover bg-clip-border
          bg-center bg-no-repeat transition-all md:hover:z-40
          ${!imageLoaded ? "animate-pulse bg-purple-500" : ""}
        `}
      style={{
        backgroundImage: imageLoaded ? `url('${backgroundImage}')` : "",
      }}
    >
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <div
          className={`
              ${contentLocation === "below" ? "justify-end" : "justify-between"}
              relative flex h-full w-full flex-col rounded-sm
              bg-gradient-to-t from-gray-900 to-transparent bg-clip-border bg-no-repeat p-2 font-display text-white shadow
              shadow-gray-900 transition-all sm:p-3 md:hover:scale-[1.005] md:group-hover:bg-purple-500/[.85] lg:p-4
            `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const BaseThumbnailWithLink: React.FC<BaseThumbnailWithLinkProps> = (
  props
) => (
  <Link href={props.href}>
    <a aria-label={"base-thumbnail-with-link"} className="group">
      <BaseThumbnail {...props} />
    </a>
  </Link>
);

export const MediaThumbnail: React.FC<ThumbnailProps> = (props) => {
  const {
    contentLocation,
    duration,
    callToAction,
    title,
    tags,
    href,
    children,
  } = props;
  return (
    <Link href={href}>
      <a className="group">
        <BaseThumbnail {...props}>
          {duration && (
            <div className="absolute top-3 right-3 rounded-xl bg-gray-900 py-0.5 px-2 text-xs font-light md:group-hover:opacity-0">
              {duration}
            </div>
          )}
          <div className="flex flex-row items-center gap-2 font-light lg:gap-4">
            <div className="hidden w-auto rounded-full bg-gray-600/[.65] p-2 md:inline-block md:group-hover:bg-black/[.3]">
              <MdPlayArrow className="text-lg lg:text-3xl" />
            </div>
            {callToAction && (
              <p
                className={`text-xs font-medium transition-opacity sm:text-sm lg:text-base ${
                  callToAction?.display === "always"
                    ? "opacity-100"
                    : "opacity-0 md:group-hover:opacity-100"
                }`}
              >
                {callToAction.text}
              </p>
            )}
          </div>
          {contentLocation === "inside" && (
            <div>
              <h4 className="text-xs font-normal text-white line-clamp-3 sm:text-sm md:mb-0.5 md:text-base">
                {title}
              </h4>
              <div className="hidden sm:block">
                <List
                  contents={[
                    duration,
                    ...(tags && tags.length > 0 ? tags : []),
                  ]}
                  highlightFirst
                />
              </div>
            </div>
          )}
        </BaseThumbnail>
        {contentLocation === "below" && children}
      </a>
    </Link>
  );
};
