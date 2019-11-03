import * as React from 'react';
import Helmet from 'react-helmet-async';
import { withRouter, RouteComponentProps } from 'react-router';
import { facebookPageLink, tagline, siteName } from '../../common/constants';

interface Props extends RouteComponentProps<any> {
  title?: string;
  description?: string;
  pageUrl?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  isArticle?: boolean;
  authorUrl?: string;
  authorName?: string;
  profileUsername?: string;
  hideFooter?: boolean;
  /**
   * Whether to prevent page scrolling; useful if we have a
   * full-page overlay somewhere
   */
  preventScrolling?: boolean;
}

class Head extends React.PureComponent<Props> {
  render() {
    const {
      thumbnailAlt,
      thumbnailUrl,
      isArticle,
      authorUrl,
      authorName,
      profileUsername,
      preventScrolling,
      children,
      title,
      description,
      pageUrl,
    } = this.props;

    // In the Head component, we should not set any default values
    // Setting default values here will result in the values to always revert to the
    // default value when we do not provide any of the fields
    // To tackle that, we set all necessary default values in DefaultHead.tsx, which is
    // used at the top most layer

    const twitterCardType =
      isArticle && thumbnailUrl ? 'summary_large_image' : 'summary';

    const bodyClasses = [];
    if (preventScrolling) {
      bodyClasses.push('overflow-hidden');
    }

    let newTitle = null;
    if (title != null) {
      newTitle = `${title ? `${title}  – ` : ''} ${siteName} – ${tagline}`;
    }
    // We don't use React.Fragment but instead have this annoying set of arrays because
    // react-helmet doesn't support it yet: https://github.com/nfl/react-helmet/issues/342
    return (
      <Helmet>
        {pageUrl && [
          <link key="1" rel="canonical" href={pageUrl} />,
          <meta key="2" property="og:url" content={pageUrl} />,
        ]}
        {newTitle && [
          <title key="1">{newTitle}</title>,
          <meta key="2" property="og:title" content={newTitle} />,
          <meta key="3" property="twitter:title" content={newTitle} />,
        ]}
        {description && [
          <meta name="description" content={description} key="1" />,
          <meta property="og:description" content={description} key="2" />,
          <meta name="twitter:description" content={description} key="3 " />,
        ]}
        {thumbnailUrl && [
          <meta property="og:image" content={thumbnailUrl} key="1" />,
          <meta name="twitter:image:src" content={thumbnailUrl} key="2" />,
        ]}
        {thumbnailAlt && (
          <meta property="og:image:alt" content={thumbnailAlt} />
        )}
        {authorUrl && [
          <meta property="article:author" content={authorUrl} key="1" />,
          <link rel="author" href={authorUrl} key="2" />,
        ]}
        {authorName && <meta property="author" content={authorName} />}
        {isArticle &&
          facebookPageLink && [
            <meta property="og:type" content="article" key="1" />,
            <meta
              property="article:publisher"
              content={facebookPageLink}
              key="2"
            />,
          ]}
        {profileUsername && [
          <meta property="og:type" content="profile" key="1" />,
          <meta
            property="profile:username"
            content={profileUsername}
            key="2"
          />,
        ]}
        {!isArticle && !profileUsername && (
          <meta property="og:type" content="website" />
        )}
        <meta name="twitter:card" content={twitterCardType} />
        <meta name="robots" content="index, follow" />
        <meta property="og:site_name" content={siteName} />
        {bodyClasses.length !== 0 && <body className={bodyClasses.join(' ')} />}
        {children}
      </Helmet>
    );
  }
}

export default withRouter(Head);
