import React, { PropTypes } from 'react';
import Footer from './jsx/Layout/Footer';
import logoLarger from './img/logo-larger.png';
import OEMConfig from './Config';

import Bazel from 'components/Dashboard/Bazel';
import BaseInfo from 'components/Dashboard/BaseInfo';
import Licensed from 'components/Dashboard/Licensed';

import './sass/login.scss';

// import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';

class Login extends React.Component {

  static contextTypes = {
    appConfig: PropTypes.shape({
      OEM: PropTypes.string.isRequired,
      MODULE_NAME: PropTypes.string.isRequired
    })
  }

  render() {
    const { appConfig: { MODULE_NAME } } = this.context;
    const bazelUrl = require(`./img/bazel_templates/${MODULE_NAME}.svg`);

    return (
      <div id="login-layout">
        <div className="row">
          <div className="col-md-5 left">
            <div className="block-center mt-xl wd-xl">
              { /* START panel */ }
              <div className="panel panel-dark panel-flat">
                <div className="panel-heading text-center">
                  <a href="#">
                    <img src={logoLarger} alt="Image" style={{ height: '52px' }} className="block-center img-rounded" />
                  </a>
                </div>
                <div className="panel-body">
                  <p className="text-center pv">SIGN IN TO CONTINUE.</p>
                  { this.props.children }
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-7 right">
            <div className="front-bazel-container">
              <label>
                <span className="glyphicon glyphicon-bookmark"></span>Thunder 3030s
              </label>
              <Bazel url={bazelUrl} logo={OEMConfig.logo} posMapping={OEMConfig.logoPosMapping[MODULE_NAME]} />
            </div>
            <div className="baseinfo-container">
              <label>Basic Info</label>
              <BaseInfo />
            </div>
            <div className="licensed-container">
              <label>Licensed</label>
              <Licensed />
            </div>
          </div>
        </div>
        { /* END panel */ }
        <div className="p-lg text-right footer">
          <hr/>
          <Footer />
        </div>
      </div>
    );
  }

}

export default Login;
