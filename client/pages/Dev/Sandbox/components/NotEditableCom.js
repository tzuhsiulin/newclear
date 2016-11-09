import React, { PropTypes } from 'react';
// import { BootstrapTable } from 'react-bootstrap-table';  // in ECMAScript 6
import { widgetWrapper } from 'helpers/widgetWrapper';
// import { Panel } from 'react-bootstrap';


class NotEditableCom extends React.Component {
  static displayName = 'NotEditableCom'
  static contextTypes = {
    cm: PropTypes.object
  }

  click(event) {
    event.preventDefault();
    console.log('clicking... set ip address to ::9999');
    this.props.hold('::9999');
    // this.context.cm.printComponentTree(true);

    // const meta = this.props.getMeta();
    // const model = this.props.getModel();
    // this.props.setDataInvalid();
    // let invalid = this.props.getDataInvalid();
    // // this.setState({ ip: '::8999' });
    // console.log(' model:::', model, ' meta:::', meta, ' value:::', value, ' invalid:::', invalid);
    // this.props.setDataValid();
    // invalid = this.props.getDataInvalid();
    // console.log('Invalid:::', invalid);
    //
    // this.props.save();
    // invalid = this.props.getDataInvalid();
    // console.log('After saving, invalid:::', invalid);
  }

  render() {
    // console.log(this.props);
    return (
      <div>
        <h5>Static Component</h5>
        <a href="#" onClick={::this.click}>Set Value</a>
        <p>{ this.props.activeDate || 'not set' }</p>
      </div>
    );
  }
}

export default widgetWrapper([ 'app' ])(NotEditableCom);
