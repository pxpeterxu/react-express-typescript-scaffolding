import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import Head from '../Head';
import { defaultDescription, linkHost } from '../../../common/constants';

interface Props extends RouteComponentProps {}

class DefaultHead extends React.PureComponent<Props> {
  render() {
    const { location } = this.props;

    // Default to the regular title; this can be overridden
    // by further calls to <Head>
    const defaultTitle = '';
    const defaultPageUrl = `${linkHost}${location.pathname}${location.search}${location.hash}`;

    return (
      <Head
        title={defaultTitle}
        description={defaultDescription}
        pageUrl={defaultPageUrl}
      />
    );
  }
}

export default withRouter(DefaultHead);
