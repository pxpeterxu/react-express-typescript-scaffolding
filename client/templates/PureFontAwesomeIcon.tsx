import * as React from 'react';
import { FontAwesomeIcon, Props } from '@fortawesome/react-fontawesome';

/** Simple wrapper to improve performance */
export default class PureFontAwesomeIcon extends React.PureComponent<Props> {
  render() {
    const { icon, ...restProps } = this.props;
    return (
      <FontAwesomeIcon
        // Ad-blockers will block icons if it has class names such as 'fa-share'
        // or 'fa-share-alt'. Since FontAwesome uses the icon name as its class name,
        // we can manually change it to avoid the ad-blocker. This will result in the
        // class name to not contain 'fa-share' or 'fa-share-alt'. Note that we only change
        // its icon name and every other props should still work the same.

        // https://stackoverflow.com/questions/38341769/adblock-plus-is-blocking-my-social-media-links
        icon={icon === 'share' ? ('my-share' as any) : icon}
        {...restProps}
      />
    );
  }
}
