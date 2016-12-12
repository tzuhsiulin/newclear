import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import SVGInjector from 'svg-injector';

class Bazel extends Component {

  static propTypes = {
    logo: PropTypes.string.isRequired,
    posMapping: PropTypes.array.isRequired,
    url: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  injectorSVG = () => {
    const dom = ReactDOM.findDOMNode(this.refs.bazel);
    SVGInjector(dom, {
      evalScripts: 'once',
      each: svg => {
        const { logo, posMapping } = this.props;
        const logoGroup = svg.querySelector('#bazel-logo');
        if (logoGroup) {
          logoGroup.innerHTML = logo;
          logoGroup.setAttribute('transform', `translate${posMapping[0]} scale${posMapping[1]}`);
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.templateName !== this.props.templateName) {
      this.injectorSVG();
    }
  }

  componentDidMount() {
    this.injectorSVG();
  }

  render() {
    const { url } = this.props;
    // FIXME, should use anthor way
    return (
      <img ref="bazel" src={url} />
    );
  }

}

export default Bazel;
