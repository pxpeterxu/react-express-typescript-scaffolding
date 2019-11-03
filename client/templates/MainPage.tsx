import * as React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { adminEmail, adminName, siteName } from '../../common/constants';

class MainPage extends React.PureComponent<{}> {
  render() {
    return (
      <>
        <Navbar bg="light">
          <div className="container">
            <LinkContainer to="/">
              <Navbar.Brand className="ml-3">{siteName}</Navbar.Brand>
            </LinkContainer>
          </div>
        </Navbar>

        {this.props.children}

        <footer className="footer">
          <div className="container">
            <div>Created by {adminName}</div>
            <div>
              Email: <a href={`mailto:${adminEmail}`}>{adminEmail}</a>
            </div>
          </div>
        </footer>
      </>
    );
  }
}

export default MainPage;
