import fetcher from './fetcher';
import { type EndpointProps, type UrlParams } from './interfaces';
import { mergeDeep } from '../../utils/helpers';

class Endpoint {
  static alias = {
    create: 'POST',
    read  : 'GET',
    update: 'PUT',
    delete: 'DELETE'
  };

  /// Public methods
  constructor (
    public config?: Partial<EndpointProps>
  ) {
    this.config = config ?? { url: '' };
    Object.entries(Endpoint.alias).forEach(([alias, method]) => {
      this[alias] = this[method.toLowerCase()];
    });
  }

  get (urlParams?: UrlParams, config?: Partial<EndpointProps>) {
    const props = mergeDeep({}, this.config, config, { method: 'GET', urlParams });
    return fetcher(props);
  }

  post (body: any, urlParams?: UrlParams, config?: EndpointProps) {
    const props = mergeDeep({}, this.config, config, { method: 'POST', body: JSON.stringify(body), urlParams });
    return fetcher(props);
  }

  put (body: any, urlParams?: UrlParams, config?: EndpointProps) {
    const props = mergeDeep({}, this.config, config, { method: 'PUT', body: JSON.stringify(body), urlParams });
    return fetcher(props);
  }

  delete (urlParams?: UrlParams, config?: EndpointProps) {
    const props = mergeDeep({}, this.config, config, { method: 'DELETE', urlParams });
    return fetcher(props);
  }
}

export default Endpoint;
