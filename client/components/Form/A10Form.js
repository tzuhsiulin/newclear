import React, { Component, PropTypes } from 'react';
// import { connect } from 'react-redux';
import { Form } from 'react-bootstrap';
// import invariant from 'invariant';
import { Map, List, fromJS } from 'immutable';
import { toPath, has } from 'lodash';
import { getAppValueStore } from 'helpers/stateHelper';
import { widgetWrapper } from 'helpers/widgetWrapper';
import { FORM_FIELD_KEY } from 'configs/appKeys';
import { UPDATE_TARGET_DATA, HIDE_COMPONENT_MODAL, REDIRECT_ROUTE } from 'configs/messages';

class SchemaForm {
  static displayName = 'SchemaForm'

  constructor(context) {
    // invariant(schemas, 'Form schemas referred from your pages');
    const { schemas, edit, urlKeys } = context;
    this.context = context;
    this.schemas = schemas;
    this.isEdit = edit;
    this.urlKeys = urlKeys;
    this.state = {
      invalidProps: {}
    };

  }

  _parseAxapiURL(axapi, value) {
    let axapiOrg = axapi;
    if (this.isEdit !== true ) {
      axapiOrg = axapiOrg.replace(/\/[^\/]+?$/, '');
    }

    const path = axapiOrg.replace(/\{(.*?)\}/g, (matches, words) => { // eslint-disable-line
      // console.log(words, ' are mached words', this.urlKeys[words], ' keys from urlKeys');
      if (this.urlKeys && this.urlKeys[words]) {
        return this.urlKeys[words];
      } else {
        return value.getIn(words, '');
      }
    });
    // console.log(path, 'are submiting parth');
    return path;
  }

  _getObjectPrefixes() {
    let prefixes = {};
    this.schemas.forEach((schema) => {
      // console.log(schema);
      prefixes[schema['obj-name']] = schema;
    });
    // console.log(this.schemas, ' this schemas');
    return prefixes;
  }

  // remove invalid values by schema
  parseValues(values) {
    const newValues = fromJS(values);
    const prefixes = this._getObjectPrefixes();

    let parsedValues = Map({});
    let invalidProps = Map({});

    let result = List();
    // console.log(prefixes, ' prefixes ................');

    newValues.forEach((fieldGroup, fieldGroupName) => {
      // console.log(fieldGroupName, ' field group name');
      let fullRequestData = null;
      if (prefixes[fieldGroupName]) {
        const { properties, axapi } = prefixes[fieldGroupName];
        // check each properties
        fieldGroup.forEach((fieldValue, fieldName) => { // eslint-disable-line
          // console.log('properties.....', properties[fieldName], 'fieldName', fieldName);
          if (properties[fieldName]) {
            parsedValues = parsedValues.setIn([ fieldGroupName, fieldName ], fieldValue);
          } else {
            invalidProps = invalidProps.setIn([ fieldGroupName, fieldName ], fieldValue);
          }
        });
        fullRequestData = {
          path: this._parseAxapiURL(axapi, fieldGroup),
          method: 'POST',
          body: parsedValues
        };
        // console.log('full auth data', fullRequestData);
      }

      if (fullRequestData) {
        result = result.push(fullRequestData);
      }

    });

    // console.log('axapi path and result', result.toJS());
    return result;
  }

}

class A10SchemaForm extends Component {
  static displayName = 'A10SchemaForm'
  // static componentId = uniqueId('A10SchemaForm-')

  static contextTypes = {
    props: PropTypes.object,
    ballKicker: PropTypes.object
  }

  // context defined at page
  constructor(props, context) {
    super(props, context);
    if (!context.props) {
      throw new Error('Config should passed from parent');
    }
    this._parentProps = context.props;
    // console.log(this.props);
    // console.log(this.context);
    // this.props.registerBalls();
  }

  // connect
  connectValues(storeData, parsedValues) {
    // const { fieldConnector: { options: { connectToApiStore } } } = this._parentProps;
    let primaryObj = parsedValues.first(), mergingObj = Map(), copyStoreData = [];
    storeData.forEach((apiRequestData) => {
      if (apiRequestData.connectOptions) {
        const { connectToApiStore: { source, target, targetIsArray } } = apiRequestData.connectOptions;
        const value = source ? apiRequestData.body.getIn([ source ]) : apiRequestData.body;
        if (targetIsArray || storeData.length > 1) {
          let l = mergingObj.getIn(toPath(target), List());
          l = l.push(value);
          mergingObj = mergingObj.setIn( toPath(target), l);
        } else {
          mergingObj =  mergingObj.setIn( toPath(target), value);
        }
      } else {
        copyStoreData.push(apiRequestData);
      }
    });

    if (mergingObj.size) {
      // console.log('parsed values on default submitter', mergingObj.toJS());
      primaryObj.body = primaryObj.body.mergeDeep(mergingObj);
      parsedValues = parsedValues.set(0, primaryObj);
    }

    if (copyStoreData.length) {
      return parsedValues.concat(copyStoreData);
    } else {
      return parsedValues;
    }

  }

  defaultHandleSubmit(values, form, save=true) {
    let parsedValues = values;
    const schemaFormHandler = new SchemaForm(this.props);
    parsedValues = schemaFormHandler.parseValues(parsedValues);

    if (save) {
      let storeData = getAppValueStore(this.props.app);
      if (storeData.length) {
        parsedValues = this.connectValues(storeData, parsedValues);
      }
      const promise = this.props.comAxapiRequest(parsedValues, true);
      // console.log(' returned promise ', promise);
      if (promise) {
        // TODO: release the store
        // promise.finally(() => {
        //   this.context.props.storeApiInfo(form, false);
        // });
        // console.log('returned from propmise');
      }

      return promise;
    } else {
      // console.log(values, form, save);
      this.context.props.storeApiInfo(form, parsedValues, this._parentProps.fieldConnector.options);
      return new Promise((resolve, reject) => { // eslint-disable-line
        resolve(parsedValues);
      });
    }
  }

  dataFinalize(values) {
    let newValues = values;
    const instanceParentPath = this.props.findParent(A10SchemaForm.displayName);
    // console.log(instanceParentPath);
    const formFields = this.props.page.getIn([ ...instanceParentPath, FORM_FIELD_KEY ]);
    formFields.forEach((fieldProps, fieldName) => {
      const visible = fieldProps.getIn([ 'conditionals', 'visible' ]);

      if (!visible) {
        newValues = newValues.deleteIn(toPath(fieldName));
      }
    });

    return newValues;
  }

  render() {
    const {
      instancePath,
      targetInstancePath,
      children,
      onBeforeSubmit,
      onAfterSubmit,
      onSubmit,
      // Form props
      bsClass,
      componentClass,
      horizontal,
      inline
    } = this.props;
    // console.log(urlKeys, 'is url keys...............');
    const { handleSubmit, fieldConnector } = this._parentProps;
    // const parentInstancePath = this.props.findParent('A10SchemaForm');
    // console.log(this._parentProps);
    let submit = (values) => {
      // validation triggle
      const parentInstancePath = this.props.findParent(A10SchemaForm.displayName);
      this.props.comTriggleValidation(parentInstancePath);

      let newValues = values, patchedValues = Map(), submitFunc = this.defaultHandleSubmit;
      if (onBeforeSubmit) {
        patchedValues = onBeforeSubmit(newValues);
      }
      // let visible data hidden
      newValues = this.dataFinalize(newValues);
      // patch values need keep outside newValues, otherwise, data finalizer could be remove it by visible
      newValues = newValues.mergeDeep(fromJS(patchedValues));

      if (onSubmit) {
        submitFunc = onSubmit;
      }

      let result = null;
      if (has(fieldConnector , 'options.connectToValue')) {
        // fieldConnector.connectToValues(newValues);
        result = submitFunc.call(this, newValues, instancePath[0], false);
      } else {
        result = submitFunc.call(this, newValues, instancePath[0], true);
        // console.log('5');
        // fieldConnector.connectToResult(result);
        if (onAfterSubmit) {
          result = onAfterSubmit.call(this, result);
        }
      }

      result.then(() => {
        this.props.kickBall(UPDATE_TARGET_DATA, newValues, targetInstancePath );
        if (this._parentProps.modal) {
          this.props.kickBall(HIDE_COMPONENT_MODAL, null, parentInstancePath);
        } else {
          this.props.kickBall(REDIRECT_ROUTE, { path: 'list' });
        }
        
      });
      return result;
    };

    // console.log('.......................................', children);
    const formProps = { bsClass, componentClass, horizontal, inline };
    return (
      <Form onSubmit={ handleSubmit(submit) } { ...formProps }>
        { children }
      </Form>
    );
  }
}

export default widgetWrapper()(A10SchemaForm);
