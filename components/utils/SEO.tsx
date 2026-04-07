import { RSSFeedURL } from "@/consts/consts";
import { Config } from "@/data/config";
import Head from "next/head";

type TSEOProps = {
  title: string;
  description?: string | null;
  coverURL?: string | null;
  smallTwitterCard?: boolean;
  disableTitlePrefix?: boolean;
};

export const SEO = (props: TSEOProps) => {
  const pageTitle = props.disableTitlePrefix
    ? props.title
    : `avenor blog - ${props.title}`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <link href={RSSFeedURL} rel="alternate" type="application/rss+xml" />

      <meta
        content={props.coverURL ?? Config.PageCovers.websiteCoverURL}
        name="twitter:image"
      />
      <meta
        content={props.smallTwitterCard ? "summary" : "summary_large_image"}
        name="twitter:card"
      />
      <meta content={`@${Config.SocialLinks.twitter}`} name="twitter:site" />
      <meta content={`@${Config.SocialLinks.twitter}`} name="twitter:creator" />
      <meta content={pageTitle} name="twitter:title" />
      <meta
        content={props.description ?? pageTitle}
        name="twitter:description"
      />

      <meta
        content={props.coverURL ?? Config.PageCovers.websiteCoverURL}
        name="og:image"
      />
      <meta content={props.description ?? pageTitle} name="og:image:alt" />
      <meta content={pageTitle} name="og:title" />
      <meta content={props.description ?? pageTitle} name="og:description" />
    </Head>
  );
};
