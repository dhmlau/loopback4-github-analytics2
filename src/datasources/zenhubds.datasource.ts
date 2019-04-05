import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './zenhubds.datasource.json';

export class ZenhubdsDataSource extends juggler.DataSource {
  static dataSourceName = 'zenhubds';

  constructor(
    @inject('datasources.config.zenhubds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
