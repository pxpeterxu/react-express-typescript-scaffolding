import * as React from 'react';
import {
  Route,
  Switch,
  RouteProps,
  RouteComponentProps,
  withRouter,
} from 'react-router';
import HomePage from './HomePage';

export const routes: RouteProps[] = [
  { exact: true, path: '/', component: HomePage },
  { path: '/index', component: HomePage },
  { path: '*', component: HomePage },
];

interface Props extends RouteComponentProps<any> {}

class Routes extends React.Component<Props> {
  render() {
    return (
      <Switch>
        {routes.map((route, index) => (
          <Route key={index} {...route} />
        ))}
      </Switch>
    );
  }
}

export default withRouter(Routes);
