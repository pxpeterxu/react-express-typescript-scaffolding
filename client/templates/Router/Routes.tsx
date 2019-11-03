import * as React from 'react';
import {
  Route,
  Switch,
  RouteComponentProps,
  withRouter,
  matchPath,
  Redirect,
} from 'react-router';
import Head from '../Head';
import { routes } from './routeDeclarations';
import FakeTopProgressBar from '../FakeTopProgressBar';
import { trackPageview } from '../../js/Analytics';

interface Props extends RouteComponentProps<any> {
  loading: boolean;
}

function getMatchingPath(pathname: string) {
  const matchingRoute = routes.find(route => !!matchPath(pathname, route));

  if (matchingRoute) {
    const match = matchPath(pathname, matchingRoute)!;
    if (matchingRoute.component) {
      return {
        name: matchingRoute.name,
        match,
      };
    }
  }

  return undefined;
}

class Routes extends React.Component<Props> {
  componentDidMount() {
    const { location } = this.props;
    const page = location.pathname + location.search;

    const match = getMatchingPath(location.pathname);
    trackPageview({
      pageName: match && match.name,
      path: page,
      referrer: document.referrer || undefined,
      params: match && (match.match.params as any),
      // Mount is first load; don't track on Google Analytics
      isFirst: true,
    });
  }

  componentDidUpdate(prevProps: Props) {
    const {
      location: { pathname, search },
    } = prevProps;
    const {
      location: { pathname: nextPathname, search: nextSearch },
    } = this.props;

    if (pathname !== nextPathname || search !== nextSearch) {
      const page = nextPathname + nextSearch;
      const referrer = pathname + search;
      const match = getMatchingPath(nextPathname);
      trackPageview({
        pageName: match && match.name,
        path: page,
        referrer,
        params: match && (match.match.params as any),
        isFirst: false,
      });
    }
  }

  render() {
    const { loading } = this.props;
    return (
      <>
        {/* Include default headers in case the page doesn't provide it */}
        <Head />
        <FakeTopProgressBar done={!loading} seconds={0.25} />

        <Switch>
          <Redirect exact path="/gsb" to="/groups/gsb" />
          {routes.map((route, index) => (
            <Route key={index} {...route} />
          ))}
        </Switch>
      </>
    );
  }
}

export default withRouter(Routes);
