import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './githubds.datasource.json';

export class GithubdsDataSource extends juggler.DataSource {
  static dataSourceName = 'githubds';

  constructor(
    @inject('datasources.config.githubds', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
