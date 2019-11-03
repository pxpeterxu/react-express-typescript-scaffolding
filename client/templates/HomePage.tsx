import React from 'react';
import MainPage from './MainPage';

class HomePage extends React.PureComponent<{}> {
  render() {
    return (
      <MainPage>
        <div className="jumbotron">
          <div className="container">
            <h1>Hello world</h1>
            <p>Some text describing the product or website goes here.</p>
          </div>
        </div>
        <div className="container">
          <h1>Here's some text</h1>
        </div>
      </MainPage>
    );
  }
}

export default HomePage;
