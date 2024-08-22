import Endpoint from './Endpoint';
import { type EndpointProps } from './interfaces';

export default class RestApi {
  private readonly _endpoints: Map<string, Endpoint>;

  constructor (endpoints: EndpointProps[] = [], config?: Partial<EndpointProps>) {
    this._endpoints = new Map<string, Endpoint>(endpoints.map(endpoint => [endpoint.name, new Endpoint({ ...config, ...endpoint })]));

    this._endpoints.forEach((endpoint, name) => {
      this[name] = endpoint;
    });
  }

  add (props: EndpointProps) {
    const endpoint = new Endpoint(props);
    this._endpoints.set(props.name, endpoint);
    this[props.name] = endpoint;
  }

  remove (name: string) {
    this._endpoints.delete(name);
    this[name] = null;
    // delete this[name];
  }

  get (name: string) {
    return this._endpoints.get(name) as Endpoint;
  }
}
