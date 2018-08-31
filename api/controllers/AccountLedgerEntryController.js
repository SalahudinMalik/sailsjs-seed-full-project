/**
 * AccountLedgerEntryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');
module.exports = {
  find: function (req, res) {
    var params = req.allParams(),
      params = _.defaults(params, {
        filters: [],
        page: 1,
        per_page: 20,
        sort_dir: 'ASC',
        sort: 'against_account',
        query: ''
      });

    var sortable = ['against_account'];

    var filters = params.filters;

    if (!filters || !_.isArray(filters)) {
      filters = [];
    }

    if (params.page) {
      if (!parseInt(params.page) || !_.isNumber(parseInt(params.page))) {
        return res.badRequest({
          err: 'Invalid page field value'
        });
      }
    }
    if (params.per_page) {
      if (!parseInt(params.per_page) || !_.isNumber(parseInt(params.per_page))) {
        return res.badRequest({
          err: 'Invalid per_page field value'
        });
      }
    }
    if (params.query) {
      if (!_.isString(params.query)) {
        return res.badRequest({
          err: 'Invalid search_term field value'
        });
      }
    }

    let queryObject = {
      where: { status_id: { '!=': Status.DELETED } },
      // limit: parseInt(params.per_page),
      sort: '',
    };
    if (params.sort && _.indexOf(sortable, params.sort) > -1) {
      queryObject.sort = params.sort + ' ' + params.sort_dir;
    }
    queryObject.where.or = [{
      'against_account': {
        'like': '%' + params.query + '%'
      }
    }];




    const getAccountLedgerEntry = async () => {

      const AccountLedgerEntry_count = await AccountLedgerEntry.count({ where: { status_id: { '!=': Status.DELETED } } });
      if (!AccountLedgerEntry_count) {
        throw new CustomError('AccountLedgerEntry not found', {
          status: 403
        });
      }
      let accountLedgerEntry = await AccountLedgerEntry.find(queryObject).populate('account');
      if (!accountLedgerEntry) {
        throw new CustomError('AccountLedgerEntry not found', {
          status: 403
        });
      }
      for (let key in accountLedgerEntry) {
        accountLedgerEntry[key].account = accountLedgerEntry[key].account.name;
        accountLedgerEntry[key].date = accountLedgerEntry[key].date ? moment(accountLedgerEntry[key].date).format('YYYY-MM-DD') : '';
      }
      //   const responseObject = {
      //     accountLedgerEntry: accountLedgerEntry,
      //     totalCount: AccountLedgerEntry_count,
      //     perPage: params.per_page,
      //     currentPage: params.page
      //   };
      return accountLedgerEntry;
    }

    getAccountLedgerEntry()
      .then(res.ok)
      .catch(err => util.errorResponse(err, res));
  },
  findOne: function (req, res) {

    if (!(req.param('id')) || isNaN(req.param('id')))
      return res.badRequest('Not a valid request');
    let AccountLedgerEntryId = req.param('id')
    let queryObject = {
      where: { account: AccountLedgerEntryId, status_id: { '!=': Status.DELETED } }
    };
    const getAccountLedgerEntry = async () => {
      let accountLedgerEntry = await AccountLedgerEntry.find(queryObject);

      if (accountLedgerEntry)
        return accountLedgerEntry;
      else
        throw new CustomError('AccountLedgerEntry not found', {
          status: 403
        });

      throw new CustomError('Some error occurred. Please contact development team for help.', {
        status: 403
      });
    }

    getAccountLedgerEntry()
      .then(res.ok)
      .catch(err => util.errorResponse(err, res));

  },
};

