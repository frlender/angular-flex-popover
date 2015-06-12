var __scripts = document.getElementsByTagName("script");
var __currentScriptPath = __scripts[__scripts.length-1].src;

angular.module('flexPopover',[])
.directive('flexPopoverView',['flexPopoverLayout',function(flexPopoverLayout){
   	var ctrl = ['$scope',function($scope){
         for(key in $scope._data){
            $scope[key] = $scope._data[key]
            $scope.close = function(){
               $scope.$emit('flexViewClose')
               $scope.$destroy();
            }
         }
   	}];
   	return{
   		restrict: 'AE',
   		scope: {
   			_data: '=data',
            _asyncView:'=asyncView'
   		},
   		controller: ctrl,
   		templateUrl: __currentScriptPath.substring(0, __currentScriptPath.lastIndexOf('/') + 1) 
        + 'flex-popover.html',
        link:function(scope,element){
         if(scope._asyncView)
          scope.$on('flexViewRendered',function(event){
             flexPopoverLayout(element);
          });
         else
            flexPopoverLayout(element);
        }
   	};
}])
.directive('flexPopover',['$compile','$timeout',
   function($compile,$timeout){
   return{
      link:function(scope,element,attrs){
         $(element).click(function(){
            var holderScope = scope.$new(true),
            data = scope.$eval(attrs.data);
            holderScope.draggable = scope.$eval(attrs.draggable);
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
               element.parent().append('<div class="fp-view-holder"><div class="fp-view" async-view="true" flex-popover-view data="data"></div></div>')
               if(holderScope){
                  $('.fp-view').draggable?$('.fp-view').draggable():"No jqueryUI avaiable";
               }
               // element.html('<div flex-popover-view data="data"></div>');
               $compile(element.siblings().contents())(holderScope);
             } 
             holderScope.$on('flexViewClose',function(){
               element.siblings().remove();
               holderScope.$destroy();
            });
         }); // end of click
      }
   }
}])
.factory('flexPopoverLayout',function(){
   return function(element){
      var parent = element.parent(), 
         pOffset = parent.offset(),
         pWidth = parent.width(),
         pHeight = parent.height(),
         eWidth = element.width(),
         eHeight = element.height(),
         ePosition = element.position(),
         dWidth = $(document).width(),
         dHeight = $(document).height();

      var ratio = 0.382;// 0.618
      var top = -eHeight/2*ratio,
         left = -eWidth/2+pWidth/2;

      // not higher than top of doc
      top = pOffset.top+top<0? -pOffset.top:top;
      // not righter than right of doc
      left = pOffset.left+pWidth/2+eWidth/2>dWidth?dWidth-eWidth:left;
      // not lefter than left of doc
      left = pOffset.left+left<0? -pOffset.left:left;

      element.css('left',left);
      element.css('top',top);
   }
})
.directive('flexPopoverPostRepeat',function(){
   return function(scope){
      if(scope.$last){
         scope.$emit('flexViewRendered');
      }
   }
});;