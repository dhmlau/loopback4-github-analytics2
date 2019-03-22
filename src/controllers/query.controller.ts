import {inject} from '@loopback/core';
import {QueryService, QueryResponse} from '../services';
import {get, param} from '@loopback/rest';

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
const maintainerList: string[] = [
  'raymondfeng',
  'bajtos',
  'dhmlau',
  'jannyhou',
  'b-admike',
  'emonddr',
  'nabdelgadir',
];

export class QueryController {
  constructor(
    @inject('services.QueryService') protected queryService: QueryService,
  ) {}

  /**
   * Get all merged PRs
   * @param startdate
   * @param enddate
   */
  @get('/pr/{startdate}/{enddate}')
  async getAllMergedPRs(
    @param.path.string('startdate') startdate: string,
    @param.path.string('enddate') enddate: string,
  ): Promise<QueryResult> {
    let result: QueryResponse = await this.queryService.getPRs(
      startdate,
      enddate,
    );

    let count_maintainers: number = 0;
    let count_community: number = 0;

    // console.log('result.total_count=', result.total_count);
    // console.log('result.items.length = ', result.items.length);

    result.items.forEach(item => {
      if (maintainerList.includes(item.user.login)) {
        count_maintainers++;
      } else {
        count_community++;
      }
    });

    let qr = new QueryResult();
    qr.total_count = result.total_count;
    qr.count_maintainers = count_maintainers;
    qr.count_community = count_community;
    return qr;
  }
}

class QueryResult {
  total_count: number;
  count_community: number;
  count_maintainers: number;
}
