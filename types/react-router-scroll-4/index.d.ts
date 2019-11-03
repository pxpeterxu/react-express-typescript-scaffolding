import { Component } from 'react';
import { RouteComponentProps } from 'react-router';

export interface ScrollContextProps {
  shouldUpdateScroll?: (
    prevRouterProps: RouteComponentProps<any> | undefined,
    nextRouterProps: RouteComponentProps<any>,
  ) => boolean;
}

export class ScrollContext extends Component<ScrollContextProps> {}
