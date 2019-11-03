import React from 'react';
import { Props } from '@fortawesome/react-fontawesome';
import PureFontAwesomeIcon from './PureFontAwesomeIcon';

export default class LoadingIcon extends React.PureComponent<
  Omit<Props, 'icon'>
> {
  render() {
    const { ...props } = this.props;
    return <PureFontAwesomeIcon icon="circle-notch" spin {...props} />;
  }
}
