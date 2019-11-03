import React from 'react';
import LoadingIcon from './LoadingIcon';

interface Props {
  /** Whether to have the loading indicator on the left rather than on top */
  horizontal?: boolean;
  children?: React.ReactNode;
}

/** Show a loading spinner with some extra commentary in a card */
export default class Loading extends React.PureComponent<Props> {
  render() {
    const { horizontal, children } = this.props;

    if (horizontal) {
      return (
        <div className="row gutters-2 align-items-center text-muted">
          <div className="col-auto">
            <LoadingIcon className="text-muted" size="2x" />
          </div>
          <div className="col">{children}</div>
        </div>
      );
    } else {
      return (
        <div className="text-center text-muted">
          <div className={children ? 'mb-4' : ''}>
            <LoadingIcon size="3x" />
          </div>
          {children}
        </div>
      );
    }
  }
}
