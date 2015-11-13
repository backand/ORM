(function () {
  'use strict';

  /**
   * optimizations (nir)
   * @param $compileProvider
   * @param $httpProvider
   */
  function appConfig ($compileProvider, $httpProvider) {
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(true);
  }

  function run($log, editableOptions, $localStorage) {
    $log.debug('App is running!');
    editableOptions.theme = 'bs3';
    $localStorage.backand = $localStorage.backand || {};
  }

  angular.module('controllers', []);
  angular.module('services', []);

  angular.module('backand', [
    'ui.router',
    'ui.bootstrap',
    'ui.grid',
    'ui.tree',
    'ui.grid.edit',
    'ui.grid.rowEdit',
    'ui.grid.cellNav',
    'ui.grid.selection',
    'ui.grid.resizeColumns',
    'ui.ace',
    'ngClipboard',
    'backand.routes',
    'backand.consts',
    'angularSpinner',
    'ngAnimate',
    'toaster',
    'xeditable',
    'angular-ladda',
    'angularMoment',
    'ui.router.tabs',
    'common.modals',
    'common.directives',
    'theme.directives',
    'common.services',
    'common.data_models',
    'common.filters.uppercase',
    'common.filters.newTerminology',
    'common.interceptors.http',
    'controllers',
    'templates',
    'services',
    'backand.apps',
    'backand.database',
    'backand.backoffice',
    'backand.playground',
    'backand.docs',
    'backand.dbQueries',
    'ngMessages',
    'pascalprecht.translate',
    'angled-windows.directives',
    'ngStorage',
    'angulartics',
    'angulartics.segment.io',
    'flowChart'
  ])
    .config(['ngClipProvider', function (ngClipProvider) {
      ngClipProvider.setPath("vendor/zeroclipboard/dist/ZeroClipboard.swf");
    }])
    .run(run)
    .value('version', '1.0.1');


  angular.element(document).ready(function () {
    angular.bootstrap(document, ['backand']);
  });


})();
