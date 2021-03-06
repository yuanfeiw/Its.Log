// Generated by CoffeeScript 1.7.1
(function() {
  var chai, sinon;

  chai = require('chai');

  sinon = require('sinon');

  chai.use(require('chai-things'));

  chai.use(require('sinon-chai'));

  chai.should();

  describe('Monitoring view model', function() {
    var Q, viewModel;
    viewModel = require('../viewModel');
    Q = require('q');
    beforeEach(function() {
      Q.xhr = sinon.spy(function(urlOrObj) {
        var data, e;
        data = null;
        try {
          data = require("./" + ((urlOrObj.url || urlOrObj).replace(/\//g, '-').substr(1)) + ".js");
        } catch (_error) {
          e = _error;
          data = {};
        }
        return Q({
          data: typeof data === 'string' ? data : JSON.parse(JSON.stringify(data)),
          headers: function() {
            return {
              'Content-Type': 'application/json'
            };
          }
        });
      });
      Q.xhr.get = Q.xhr;
      return viewModel.querystring = null;
    });
    it('should create a friendly title for tests', function() {
      viewModel.pathname = '/tests/done/ordering';
      return viewModel.init().then(function() {
        return viewModel.filteredTests.map(function(t) {
          return t.title;
        }).should.deep.equal(['readmodels are caught up', 'blob storage is reachable', 'compute only call works', 'basic purchase works', 'buggy test', 'can save data to storage']);
      });
    });
    describe('runTest', function() {
      beforeEach(function() {
        viewModel.pathname = '/tests/done/ordering';
        return viewModel.init();
      });
      it('should request parameterless Urls as is', function() {
        viewModel.runTest(viewModel.filteredTests[0]);
        return Q.xhr.should.have.been.deep.calledWith({
          method: 'GET',
          url: '/tests/done/ordering/readmodels_are_caught_up'
        });
      });
      it('should have a status of "running" while the test request is in flight', function() {
        Q.xhr = function() {
          return Q.delay(10);
        };
        viewModel.runTest(viewModel.filteredTests[0]);
        return viewModel.filteredTests[0].status.should.equal('running');
      });
      it('should have a status of "succeeded" when the test finishes successfully', function() {
        viewModel.runTest(viewModel.filteredTests[0]);
        viewModel.filteredTests[0].status.should.equal('succeeded');
        return (viewModel.filteredTests[0].expanded === null).should.be["true"];
      });
      it('should have a status of "failed" if the test fails', function() {
        Q.xhr = function() {
          return Q.reject({
            status: 500
          });
        };
        viewModel.runTest(viewModel.filteredTests[0]);
        return viewModel.filteredTests[0].status.should.equal('failed');
      });
      xit('should expand the results if the test fails', function() {
        Q.xhr = function() {
          return Q.reject({
            status: 500
          });
        };
        viewModel.runTest(viewModel.filteredTests[0]);
        return viewModel.filteredTests[0].expanded.should.be["true"];
      });
      it('should not expand the results if explicitly collapsed', function() {
        Q.xhr = function() {
          return Q.reject({
            status: 500
          });
        };
        viewModel.filteredTests[0].expanded = false;
        viewModel.runTest(viewModel.filteredTests[0]);
        return viewModel.filteredTests[0].expanded.should.be["false"];
      });
      return it('should be able to run tests again', function() {
        viewModel.runTest(viewModel.filteredTests[0]);
        viewModel.filteredTests[0].status.should.equal('succeeded');
        viewModel.runTest(viewModel.filteredTests[0]);
        return Q.xhr.should.have.been.calledThrice;
      });
    });
    describe('runAll', function() {
      beforeEach(function() {
        viewModel.pathname = '/tests/done/ordering';
        return viewModel.init();
      });
      return it('runAll should run all tests', function() {
        viewModel.runAll();
        return Q.xhr.should.have.callCount(viewModel.filteredTests.length + 1);
      });
    });
    describe('tags', function() {
      var testTitles;
      beforeEach(function() {
        viewModel.pathname = '/tests/production';
        viewModel.includeTags = [];
        viewModel.excludeTags = [];
        return Q.xhr.get = sinon.spy(function(urlOrObj) {
          return Q({
            data: {
              Tests: [
                {
                  Environment: 'production',
                  Application: 'fruit-stand',
                  Tags: ['fruit', 'citris'],
                  Url: '/test/production/fruit-stand/tangerine'
                }, {
                  Environment: 'production',
                  Application: 'fruit-stand',
                  Tags: ['fruit'],
                  Url: '/test/production/fruit-stand/apple'
                }, {
                  Environment: 'production',
                  Application: 'fruit-stand',
                  Tags: ['fruit', 'citris'],
                  Url: '/test/production/fruit-stand/lemon'
                }, {
                  Environment: 'production',
                  Application: 'fruit-stand',
                  Tags: ['health'],
                  Url: '/test/production/fruit-stand/database-connection-is-good'
                }, {
                  Environment: 'production',
                  Application: 'fruit-stand',
                  Tags: [],
                  Url: '/test/production/fruit-stand/wip-test'
                }
              ]
            },
            headers: function() {
              return {
                'Content-Type': 'application/json'
              };
            }
          });
        });
      });
      testTitles = function() {
        return viewModel.filteredTests.map(function(t) {
          return t.title;
        });
      };
      it('should extract tag information from the query string', function() {
        viewModel.querystring = '?side-effecting=true&banana=false';
        viewModel.init();
        viewModel.includeTags.should.deep.equal(['side-effecting']);
        return viewModel.excludeTags.should.deep.equal(['banana']);
      });
      it('should query all test but filter them afterwards', function() {
        viewModel.querystring = '?citris=true';
        return viewModel.init().then(function() {
          Q.xhr.get.lastCall.args.should.deep.equal(['/tests/production']);
          return testTitles().should.deep.equal(['tangerine', 'lemon']);
        });
      });
      describe('filtering', function() {
        beforeEach(function() {
          return viewModel.init();
        });
        it('should return all tests when no filters', function() {
          return testTitles().length.should.equal(5);
        });
        it('should perform simple exclusion', function() {
          viewModel.excludeTags = ['fruit'];
          testTitles().should.deep.equal(['database connection is good', 'wip test']);
          viewModel.excludeTags = ['non-existant'];
          return testTitles().length.should.equal(5);
        });
        it('should perform exclusion and inclusion', function() {
          viewModel.includeTags = ['fruit'];
          viewModel.excludeTags = ['citris'];
          return testTitles().should.deep.equal(['apple']);
        });
        return it('should not return any tests if no test includes a tag', function() {
          viewModel.includeTags = ['fruit', 'something-random'];
          return testTitles().should.deep.equal([]);
        });
      });
      return describe('additionalTags', function() {
        beforeEach(function() {
          return viewModel.init();
        });
        it('should have tags not filtered on with counts of occourences', function() {
          return viewModel.additionalTags.should.deep.equal([
            {
              name: 'citris',
              count: 2
            }, {
              name: 'fruit',
              count: 3
            }, {
              name: 'health',
              count: 1
            }
          ]);
        });
        return it('should not have tag data of tests filtered out', function() {
          viewModel.includeTags = ['fruit'];
          return viewModel.additionalTags.should.deep.equal([
            {
              name: 'citris',
              count: 2
            }
          ]);
        });
      });
    });
    return xdescribe('environments', function() {
      return it('should aggregate by environment and application', function() {
        viewModel.pathname = '/tests/done/ordering';
        viewModel.init();
        viewModel.environments.length.should.equal(1);
        viewModel.environments[0].name.should.equal('done');
        viewModel.environments[0].applications.length.should.equal(1);
        return viewModel.environments[0].applications[0].tests.length.should.equal(7);
      });
    });
  });

}).call(this);
