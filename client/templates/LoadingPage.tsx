import React from 'react';
import MainPage from './MainPage';
import Loading from './Loading';

/** A page that only displays a loading icon */
export default class LoadingPage extends React.PureComponent<{}> {
  render() {
    return (
      <MainPage>
        <div className="py-5 text-center">
          <Loading />
        </div>
      </MainPage>
    );
  }
}
