var __scripts = document.getElementsByTagName("script");
var __currentScriptPath = __scripts[__scripts.length-1].src;

angular.module('flexPopover',[])
.directive('flexPopoverView',['flexPopoverLayout2',function(flexPopoverLayout2){
   	var ctrl = ['$scope',function($scope){
         for(key in $scope._data){
            $scope[key] = $scope._data[key]
            }
          $scope.close = function(){
            $scope.$emit('flexViewClose')
            $scope.$destroy();
         }
         if('initialize' in $scope) $scope.initialize($scope);
   	}];
   	return{
   		restrict: 'AE',
   		scope: {
   			_data: '=data',
        _asyncView:'=asyncView',
        _clicked:"=clickedElement"
   		},
   		controller: ctrl,
   		templateUrl: function(element,attrs){
        return attrs.templateUrl?attrs.templateUrl:
        __currentScriptPath.substring(0, __currentScriptPath.lastIndexOf('/') + 1) 
        + 'flex-popover.html';
      },
        link:function(scope,element){
         if(scope._asyncView)
          scope.$on('flexViewRendered',function(event){
             flexPopoverLayout2(element,scope._clicked);
          });
         else
            flexPopoverLayout2(element,scope._clicked);
        }
   	};
}])
.directive('flexPopover',['$compile','$timeout',
   function($compile,$timeout){
   return{
      link:function(scope,element,attrs){
         $(element).click(function(){
            if(element.siblings('.fp-view-holder').length)
               return // if there is already a popover, skip rendering a new one

            if(scope.$eval(attrs.flexPopoverDisabled))
              return

            var holderScope = scope.$new(true),
            data = scope.$eval(attrs.data);
            holderScope.draggable = scope.$eval(attrs.draggable);
            var templateUrl = scope.$eval(attrs.templateUrl);
            holderScope.templateUrl = templateUrl?templateUrl:"";
            holderScope.container = attrs.container;
            // holderScope.asyncView = scope.$eval(attrs.asyncView);
            holderScope.clickedElement = element;
             if(data.constructor == Function){
               data(function(asyncData){
                  holderScope.data = asyncData;
                  render();
               })
             }else{
               holderScope.data = data;
               render();
             }
             function render(){
               holderScope.el = $($.parseHTML('<div class="fp-view-holder"><div class="fp-view" template-url="'+holderScope.templateUrl+'" clicked-element="clickedElement" flex-popover-view data="data"></div></div>'));
               $('body').append(holderScope.el);
               if(holderScope.draggable){
                  holderScope.el.draggable?holderScope.el.find('.fp-view').draggable():console.log("No jqueryUI avaiable for draggable feature.");
               }
               $compile(holderScope.el)(holderScope);
             } 
             holderScope.$on('flexViewClose',function(){
               holderScope.el.remove();
               holderScope.$destroy();
            });
         }); // end of click
      }
   }
}])
.factory('flexPopoverLayout',function($timeout){
   return function(element,target){
      var targetPosition = target.position(),
          targetWidth = target.width(),
          targetHeight = target.height(), 
          targetOffset = target.offset(),
          ePosition = element.position(),
          eWidth = element.width(),
          eHeight = element.height(),
          dWidth = $(document).width(),
          dHeight = $(document).height();

      var ratio = 0.382;// 0.618
      var top = targetPosition.top-eHeight/2*ratio,
         left = targetPosition.left-eWidth/2+targetWidth/2;

      // not higher than top of doc
      top = targetOffset.top+top<0? -targetOffset.top:top;
      // not righter than right of doc
      left = targetOffset.left+targetWidth/2+eWidth/2>dWidth?dWidth-eWidth:left;
      // not lefter than left of doc
      left = targetOffset.left+left<0? -targetOffset.left:left;

      element.css('left',left);
      element.css('top',top);
      $timeout(function(){
        var minWidth = 
        element.css('min-width',element.width()+2);
        element.css('min-height',element.height());
      },0)
   }
})
.factory('flexPopoverLayout2',['$timeout',function($timeout){
  return function(element,target){
     $timeout(function(){
      var targetOffset = target.offset(),
          targetWidth = target.width(),
          targetHeight = target.height(), 
          eOffset = element.offset(),
          eWidth = element.width(),
          eHeight = element.height(),
          dWidth = $(document).width(),
          dHeight = $(document).height();

      var ratio = 0.382;// 0.618
      var top = targetOffset.top-eHeight/2*ratio,
         left = targetOffset.left-eWidth/2+targetWidth/2;

      // not higher than top of doc
      top = targetOffset.top+top<0? -targetOffset.top:top;
      // not righter than right of doc
      left = targetOffset.left+targetWidth/2+eWidth/2>dWidth?dWidth-eWidth:left;
      // not lefter than left of doc
      left = targetOffset.left+left<0? -targetOffset.left:left;

      element.offset({top:top,left:left});

      },0)
   }
}])
// .directive('flexPopoverPostRepeat',function(){
//    return function(scope){
//       if(scope.$last){
//          scope.$emit('flexViewRendered');
//       }
//    }
// });;