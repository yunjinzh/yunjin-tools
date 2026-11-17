var o1=Object.create;var s_=Object.defineProperty;var l1=Object.getOwnPropertyDescriptor;var c1=Object.getOwnPropertyNames;var u1=Object.getPrototypeOf,h1=Object.prototype.hasOwnProperty;var zi=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f1=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of c1(t))!h1.call(e,s)&&s!==n&&s_(e,s,{get:()=>t[s],enumerable:!(i=l1(t,s))||i.enumerable});return e};var Fi=(e,t,n)=>(n=e!=null?o1(u1(e)):{},f1(t||!e||!e.__esModule?s_(n,"default",{value:e,enumerable:!0}):n,e));var m_=zi(Pt=>{"use strict";var Fd=Symbol.for("react.transitional.element"),d1=Symbol.for("react.portal"),p1=Symbol.for("react.fragment"),m1=Symbol.for("react.strict_mode"),g1=Symbol.for("react.profiler"),_1=Symbol.for("react.consumer"),v1=Symbol.for("react.context"),y1=Symbol.for("react.forward_ref"),x1=Symbol.for("react.suspense"),S1=Symbol.for("react.memo"),c_=Symbol.for("react.lazy"),M1=Symbol.for("react.activity"),a_=Symbol.iterator;function b1(e){return e===null||typeof e!="object"?null:(e=a_&&e[a_]||e["@@iterator"],typeof e=="function"?e:null)}var u_={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},h_=Object.assign,f_={};function _r(e,t,n){this.props=e,this.context=t,this.refs=f_,this.updater=n||u_}_r.prototype.isReactComponent={};_r.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};_r.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function d_(){}d_.prototype=_r.prototype;function Vd(e,t,n){this.props=e,this.context=t,this.refs=f_,this.updater=n||u_}var Hd=Vd.prototype=new d_;Hd.constructor=Vd;h_(Hd,_r.prototype);Hd.isPureReactComponent=!0;var r_=Array.isArray;function zd(){}var Me={H:null,A:null,T:null,S:null},p_=Object.prototype.hasOwnProperty;function Gd(e,t,n){var i=n.ref;return{$$typeof:Fd,type:e,key:t,ref:i!==void 0?i:null,props:n}}function E1(e,t){return Gd(e.type,t,e.props)}function kd(e){return typeof e=="object"&&e!==null&&e.$$typeof===Fd}function T1(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var o_=/\/+/g;function Bd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?T1(""+e.key):t.toString(36)}function A1(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(zd,zd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function gr(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Fd:case d1:r=!0;break;case c_:return r=e._init,gr(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+Bd(e,0):i,r_(s)?(n="",r!=null&&(n=r.replace(o_,"$&/")+"/"),gr(s,t,n,"",function(c){return c})):s!=null&&(kd(s)&&(s=E1(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(o_,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(r_(e))for(var l=0;l<e.length;l++)i=e[l],a=o+Bd(i,l),r+=gr(i,t,n,a,s);else if(l=b1(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+Bd(i,l++),r+=gr(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return gr(A1(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function Zc(e,t,n){if(e==null)return e;var i=[],s=0;return gr(e,i,"","",function(a){return t.call(n,a,s++)}),i}function w1(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var l_=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},C1={map:Zc,forEach:function(e,t,n){Zc(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Zc(e,function(){t++}),t},toArray:function(e){return Zc(e,function(t){return t})||[]},only:function(e){if(!kd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Pt.Activity=M1;Pt.Children=C1;Pt.Component=_r;Pt.Fragment=p1;Pt.Profiler=g1;Pt.PureComponent=Vd;Pt.StrictMode=m1;Pt.Suspense=x1;Pt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Me;Pt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Me.H.useMemoCache(e)}};Pt.cache=function(e){return function(){return e.apply(null,arguments)}};Pt.cacheSignal=function(){return null};Pt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=h_({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!p_.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Gd(e.type,s,i)};Pt.createContext=function(e){return e={$$typeof:v1,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:_1,_context:e},e};Pt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)p_.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Gd(e,a,s)};Pt.createRef=function(){return{current:null}};Pt.forwardRef=function(e){return{$$typeof:y1,render:e}};Pt.isValidElement=kd;Pt.lazy=function(e){return{$$typeof:c_,_payload:{_status:-1,_result:e},_init:w1}};Pt.memo=function(e,t){return{$$typeof:S1,type:e,compare:t===void 0?null:t}};Pt.startTransition=function(e){var t=Me.T,n={};Me.T=n;try{var i=e(),s=Me.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(zd,l_)}catch(a){l_(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),Me.T=t}};Pt.unstable_useCacheRefresh=function(){return Me.H.useCacheRefresh()};Pt.use=function(e){return Me.H.use(e)};Pt.useActionState=function(e,t,n){return Me.H.useActionState(e,t,n)};Pt.useCallback=function(e,t){return Me.H.useCallback(e,t)};Pt.useContext=function(e){return Me.H.useContext(e)};Pt.useDebugValue=function(){};Pt.useDeferredValue=function(e,t){return Me.H.useDeferredValue(e,t)};Pt.useEffect=function(e,t){return Me.H.useEffect(e,t)};Pt.useEffectEvent=function(e){return Me.H.useEffectEvent(e)};Pt.useId=function(){return Me.H.useId()};Pt.useImperativeHandle=function(e,t,n){return Me.H.useImperativeHandle(e,t,n)};Pt.useInsertionEffect=function(e,t){return Me.H.useInsertionEffect(e,t)};Pt.useLayoutEffect=function(e,t){return Me.H.useLayoutEffect(e,t)};Pt.useMemo=function(e,t){return Me.H.useMemo(e,t)};Pt.useOptimistic=function(e,t){return Me.H.useOptimistic(e,t)};Pt.useReducer=function(e,t,n){return Me.H.useReducer(e,t,n)};Pt.useRef=function(e){return Me.H.useRef(e)};Pt.useState=function(e){return Me.H.useState(e)};Pt.useSyncExternalStore=function(e,t,n){return Me.H.useSyncExternalStore(e,t,n)};Pt.useTransition=function(){return Me.H.useTransition()};Pt.version="19.2.6"});var vr=zi((mD,g_)=>{"use strict";g_.exports=m_()});var A_=zi(De=>{"use strict";function Yd(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<Kc(s,t))e[i]=t,e[n]=s,n=i;else break t}}function Vi(e){return e.length===0?null:e[0]}function jc(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>Kc(o,n))l<s&&0>Kc(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>Kc(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function Kc(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}De.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(__=performance,De.unstable_now=function(){return __.now()}):(Xd=Date,v_=Xd.now(),De.unstable_now=function(){return Xd.now()-v_});var __,Xd,v_,is=[],Fs=[],R1=1,ci=null,Sn=3,Zd=!1,Yo=!1,Zo=!1,Kd=!1,S_=typeof setTimeout=="function"?setTimeout:null,M_=typeof clearTimeout=="function"?clearTimeout:null,y_=typeof setImmediate<"u"?setImmediate:null;function Jc(e){for(var t=Vi(Fs);t!==null;){if(t.callback===null)jc(Fs);else if(t.startTime<=e)jc(Fs),t.sortIndex=t.expirationTime,Yd(is,t);else break;t=Vi(Fs)}}function Jd(e){if(Zo=!1,Jc(e),!Yo)if(Vi(is)!==null)Yo=!0,xr||(xr=!0,yr());else{var t=Vi(Fs);t!==null&&jd(Jd,t.startTime-e)}}var xr=!1,Ko=-1,b_=5,E_=-1;function T_(){return Kd?!0:!(De.unstable_now()-E_<b_)}function Wd(){if(Kd=!1,xr){var e=De.unstable_now();E_=e;var t=!0;try{t:{Yo=!1,Zo&&(Zo=!1,M_(Ko),Ko=-1),Zd=!0;var n=Sn;try{e:{for(Jc(e),ci=Vi(is);ci!==null&&!(ci.expirationTime>e&&T_());){var i=ci.callback;if(typeof i=="function"){ci.callback=null,Sn=ci.priorityLevel;var s=i(ci.expirationTime<=e);if(e=De.unstable_now(),typeof s=="function"){ci.callback=s,Jc(e),t=!0;break e}ci===Vi(is)&&jc(is),Jc(e)}else jc(is);ci=Vi(is)}if(ci!==null)t=!0;else{var a=Vi(Fs);a!==null&&jd(Jd,a.startTime-e),t=!1}}break t}finally{ci=null,Sn=n,Zd=!1}t=void 0}}finally{t?yr():xr=!1}}}var yr;typeof y_=="function"?yr=function(){y_(Wd)}:typeof MessageChannel<"u"?(qd=new MessageChannel,x_=qd.port2,qd.port1.onmessage=Wd,yr=function(){x_.postMessage(null)}):yr=function(){S_(Wd,0)};var qd,x_;function jd(e,t){Ko=S_(function(){e(De.unstable_now())},t)}De.unstable_IdlePriority=5;De.unstable_ImmediatePriority=1;De.unstable_LowPriority=4;De.unstable_NormalPriority=3;De.unstable_Profiling=null;De.unstable_UserBlockingPriority=2;De.unstable_cancelCallback=function(e){e.callback=null};De.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):b_=0<e?Math.floor(1e3/e):5};De.unstable_getCurrentPriorityLevel=function(){return Sn};De.unstable_next=function(e){switch(Sn){case 1:case 2:case 3:var t=3;break;default:t=Sn}var n=Sn;Sn=t;try{return e()}finally{Sn=n}};De.unstable_requestPaint=function(){Kd=!0};De.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=Sn;Sn=e;try{return t()}finally{Sn=n}};De.unstable_scheduleCallback=function(e,t,n){var i=De.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:R1++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,Yd(Fs,e),Vi(is)===null&&e===Vi(Fs)&&(Zo?(M_(Ko),Ko=-1):Zo=!0,jd(Jd,n-i))):(e.sortIndex=s,Yd(is,e),Yo||Zd||(Yo=!0,xr||(xr=!0,yr()))),e};De.unstable_shouldYield=T_;De.unstable_wrapCallback=function(e){var t=Sn;return function(){var n=Sn;Sn=t;try{return e.apply(this,arguments)}finally{Sn=n}}}});var C_=zi((_D,w_)=>{"use strict";w_.exports=A_()});var D_=zi(Cn=>{"use strict";var D1=vr();function R_(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Vs(){}var wn={d:{f:Vs,r:function(){throw Error(R_(522))},D:Vs,C:Vs,L:Vs,m:Vs,X:Vs,S:Vs,M:Vs},p:0,findDOMNode:null},N1=Symbol.for("react.portal");function U1(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:N1,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var Jo=D1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Qc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Cn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=wn;Cn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(R_(299));return U1(e,t,null,n)};Cn.flushSync=function(e){var t=Jo.T,n=wn.p;try{if(Jo.T=null,wn.p=2,e)return e()}finally{Jo.T=t,wn.p=n,wn.d.f()}};Cn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,wn.d.C(e,t))};Cn.prefetchDNS=function(e){typeof e=="string"&&wn.d.D(e)};Cn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=Qc(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?wn.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&wn.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Cn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=Qc(t.as,t.crossOrigin);wn.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&wn.d.M(e)};Cn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=Qc(n,t.crossOrigin);wn.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Cn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=Qc(t.as,t.crossOrigin);wn.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else wn.d.m(e)};Cn.requestFormReset=function(e){wn.d.r(e)};Cn.unstable_batchedUpdates=function(e,t){return e(t)};Cn.useFormState=function(e,t,n){return Jo.H.useFormState(e,t,n)};Cn.useFormStatus=function(){return Jo.H.useHostTransitionStatus()};Cn.version="19.2.6"});var L_=zi((yD,U_)=>{"use strict";function N_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(N_)}catch(e){console.error(e)}}N_(),U_.exports=D_()});var WS=zi(bh=>{"use strict";var $e=C_(),ay=vr(),L1=L_();function $(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ry(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Pl(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function oy(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ly(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function O_(e){if(Pl(e)!==e)throw Error($(188))}function O1(e){var t=e.alternate;if(!t){if(t=Pl(e),t===null)throw Error($(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return O_(s),e;if(a===i)return O_(s),t;a=a.sibling}throw Error($(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error($(189))}}if(n.alternate!==i)throw Error($(190))}if(n.tag!==3)throw Error($(188));return n.stateNode.current===n?e:t}function cy(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=cy(e),t!==null)return t;e=e.sibling}return null}var Te=Object.assign,I1=Symbol.for("react.element"),$c=Symbol.for("react.transitional.element"),sl=Symbol.for("react.portal"),Ar=Symbol.for("react.fragment"),uy=Symbol.for("react.strict_mode"),Np=Symbol.for("react.profiler"),hy=Symbol.for("react.consumer"),hs=Symbol.for("react.context"),Am=Symbol.for("react.forward_ref"),Up=Symbol.for("react.suspense"),Lp=Symbol.for("react.suspense_list"),wm=Symbol.for("react.memo"),Hs=Symbol.for("react.lazy");Symbol.for("react.scope");var Op=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var P1=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var I_=Symbol.iterator;function jo(e){return e===null||typeof e!="object"?null:(e=I_&&e[I_]||e["@@iterator"],typeof e=="function"?e:null)}var B1=Symbol.for("react.client.reference");function Ip(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===B1?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Ar:return"Fragment";case Np:return"Profiler";case uy:return"StrictMode";case Up:return"Suspense";case Lp:return"SuspenseList";case Op:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case sl:return"Portal";case hs:return e.displayName||"Context";case hy:return(e._context.displayName||"Context")+".Consumer";case Am:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case wm:return t=e.displayName||null,t!==null?t:Ip(e.type)||"Memo";case Hs:t=e._payload,e=e._init;try{return Ip(e(t))}catch{}}return null}var al=Array.isArray,Ut=ay.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ne=L1.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,za={pending:!1,data:null,method:null,action:null},Pp=[],wr=-1;function Wi(e){return{current:e}}function on(e){0>wr||(e.current=Pp[wr],Pp[wr]=null,wr--)}function xe(e,t){wr++,Pp[wr]=e.current,e.current=t}var Xi=Wi(null),Ml=Wi(null),Qs=Wi(null),Uu=Wi(null);function Lu(e,t){switch(xe(Qs,t),xe(Ml,e),xe(Xi,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Gv(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Gv(t),e=NS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}on(Xi),xe(Xi,e)}function Wr(){on(Xi),on(Ml),on(Qs)}function Bp(e){e.memoizedState!==null&&xe(Uu,e);var t=Xi.current,n=NS(t,e.type);t!==n&&(xe(Ml,e),xe(Xi,n))}function Ou(e){Ml.current===e&&(on(Xi),on(Ml)),Uu.current===e&&(on(Uu),Ll._currentValue=za)}var Qd,P_;function Oa(e){if(Qd===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Qd=t&&t[1]||"",P_=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Qd+e+P_}var $d=!1;function tp(e,t){if(!e||$d)return"";$d=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(d){var u=d}Reflect.construct(e,[],p)}else{try{p.call()}catch(d){u=d}e.call(p.prototype)}}else{try{throw Error()}catch(d){u=d}(p=e())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(d){if(d&&u&&typeof d.stack=="string")return[d.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var f=`
`+l[i].replace(" at new "," at ");return e.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",e.displayName)),f}while(1<=i&&0<=s);break}}}finally{$d=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?Oa(n):""}function z1(e,t){switch(e.tag){case 26:case 27:case 5:return Oa(e.type);case 16:return Oa("Lazy");case 13:return e.child!==t&&t!==null?Oa("Suspense Fallback"):Oa("Suspense");case 19:return Oa("SuspenseList");case 0:case 15:return tp(e.type,!1);case 11:return tp(e.type.render,!1);case 1:return tp(e.type,!0);case 31:return Oa("Activity");default:return""}}function B_(e){try{var t="",n=null;do t+=z1(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var zp=Object.prototype.hasOwnProperty,Cm=$e.unstable_scheduleCallback,ep=$e.unstable_cancelCallback,F1=$e.unstable_shouldYield,V1=$e.unstable_requestPaint,Jn=$e.unstable_now,H1=$e.unstable_getCurrentPriorityLevel,fy=$e.unstable_ImmediatePriority,dy=$e.unstable_UserBlockingPriority,Iu=$e.unstable_NormalPriority,G1=$e.unstable_LowPriority,py=$e.unstable_IdlePriority,k1=$e.log,X1=$e.unstable_setDisableYieldValue,Bl=null,jn=null;function Ys(e){if(typeof k1=="function"&&X1(e),jn&&typeof jn.setStrictMode=="function")try{jn.setStrictMode(Bl,e)}catch{}}var Qn=Math.clz32?Math.clz32:Y1,W1=Math.log,q1=Math.LN2;function Y1(e){return e>>>=0,e===0?32:31-(W1(e)/q1|0)|0}var tu=256,eu=262144,nu=4194304;function Ia(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function oh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=Ia(i):(r&=o,r!==0?s=Ia(r):n||(n=o&~e,n!==0&&(s=Ia(n))))):(o=i&~a,o!==0?s=Ia(o):r!==0?s=Ia(r):n||(n=i&~e,n!==0&&(s=Ia(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function zl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Z1(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function my(){var e=nu;return nu<<=1,(nu&62914560)===0&&(nu=4194304),e}function np(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Fl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function K1(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var f=31-Qn(n),p=1<<f;o[f]=0,l[f]=-1;var u=c[f];if(u!==null)for(c[f]=null,f=0;f<u.length;f++){var d=u[f];d!==null&&(d.lane&=-536870913)}n&=~p}i!==0&&gy(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function gy(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-Qn(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function _y(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-Qn(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function vy(e,t){var n=t&-t;return n=(n&42)!==0?1:Rm(n),(n&(e.suspendedLanes|t))!==0?0:n}function Rm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Dm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function yy(){var e=ne.p;return e!==0?e:(e=window.event,e===void 0?32:GS(e.type))}function z_(e,t){var n=ne.p;try{return ne.p=e,t()}finally{ne.p=n}}var ha=Math.random().toString(36).slice(2),pn="__reactFiber$"+ha,Vn="__reactProps$"+ha,no="__reactContainer$"+ha,Fp="__reactEvents$"+ha,J1="__reactListeners$"+ha,j1="__reactHandles$"+ha,F_="__reactResources$"+ha,Vl="__reactMarker$"+ha;function Nm(e){delete e[pn],delete e[Vn],delete e[Fp],delete e[J1],delete e[j1]}function Cr(e){var t=e[pn];if(t)return t;for(var n=e.parentNode;n;){if(t=n[no]||n[pn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Yv(e);e!==null;){if(n=e[pn])return n;e=Yv(e)}return t}e=n,n=e.parentNode}return null}function io(e){if(e=e[pn]||e[no]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function rl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error($(33))}function zr(e){var t=e[F_];return t||(t=e[F_]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function rn(e){e[Vl]=!0}var xy=new Set,Sy={};function Za(e,t){qr(e,t),qr(e+"Capture",t)}function qr(e,t){for(Sy[e]=t,e=0;e<t.length;e++)xy.add(t[e])}var Q1=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),V_={},H_={};function $1(e){return zp.call(H_,e)?!0:zp.call(V_,e)?!1:Q1.test(e)?H_[e]=!0:(V_[e]=!0,!1)}function _u(e,t,n){if($1(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function iu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function ss(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function hi(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function My(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function tE(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Vp(e){if(!e._valueTracker){var t=My(e)?"checked":"value";e._valueTracker=tE(e,t,""+e[t])}}function by(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=My(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function Pu(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var eE=/[\n"\\]/g;function pi(e){return e.replace(eE,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Hp(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+hi(t)):e.value!==""+hi(t)&&(e.value=""+hi(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Gp(e,r,hi(t)):n!=null?Gp(e,r,hi(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+hi(o):e.removeAttribute("name")}function Ey(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){Vp(e);return}n=n!=null?""+hi(n):"",t=t!=null?""+hi(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i??s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),Vp(e)}function Gp(e,t,n){t==="number"&&Pu(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function Fr(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+hi(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function Ty(e,t,n){if(t!=null&&(t=""+hi(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+hi(n):""}function Ay(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error($(92));if(al(i)){if(1<i.length)throw Error($(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=hi(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Vp(e)}function Yr(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var nE=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function G_(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||nE.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function wy(e,t,n){if(t!=null&&typeof t!="object")throw Error($(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&G_(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&G_(e,a,t[a])}function Um(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var iE=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),sE=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function vu(e){return sE.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function fs(){}var kp=null;function Lm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Rr=null,Vr=null;function k_(e){var t=io(e);if(t&&(e=t.stateNode)){var n=e[Vn]||null;t:switch(e=t.stateNode,t.type){case"input":if(Hp(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+pi(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[Vn]||null;if(!s)throw Error($(90));Hp(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&by(i)}break t;case"textarea":Ty(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&Fr(e,!!n.multiple,t,!1)}}}var ip=!1;function Cy(e,t,n){if(ip)return e(t,n);ip=!0;try{var i=e(t);return i}finally{if(ip=!1,(Rr!==null||Vr!==null)&&(yh(),Rr&&(t=Rr,e=Vr,Vr=Rr=null,k_(t),e)))for(t=0;t<e.length;t++)k_(e[t])}}function bl(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Vn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error($(231,t,typeof n));return n}var _s=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Xp=!1;if(_s)try{Sr={},Object.defineProperty(Sr,"passive",{get:function(){Xp=!0}}),window.addEventListener("test",Sr,Sr),window.removeEventListener("test",Sr,Sr)}catch{Xp=!1}var Sr,Zs=null,Om=null,yu=null;function Ry(){if(yu)return yu;var e,t=Om,n=t.length,i,s="value"in Zs?Zs.value:Zs.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return yu=s.slice(e,1<i?1-i:void 0)}function xu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function su(){return!0}function X_(){return!1}function Hn(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?su:X_,this.isPropagationStopped=X_,this}return Te(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=su)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=su)},persist:function(){},isPersistent:su}),t}var Ka={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},lh=Hn(Ka),Hl=Te({},Ka,{view:0,detail:0}),aE=Hn(Hl),sp,ap,Qo,ch=Te({},Hl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Im,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Qo&&(Qo&&e.type==="mousemove"?(sp=e.screenX-Qo.screenX,ap=e.screenY-Qo.screenY):ap=sp=0,Qo=e),sp)},movementY:function(e){return"movementY"in e?e.movementY:ap}}),W_=Hn(ch),rE=Te({},ch,{dataTransfer:0}),oE=Hn(rE),lE=Te({},Hl,{relatedTarget:0}),rp=Hn(lE),cE=Te({},Ka,{animationName:0,elapsedTime:0,pseudoElement:0}),uE=Hn(cE),hE=Te({},Ka,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),fE=Hn(hE),dE=Te({},Ka,{data:0}),q_=Hn(dE),pE={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},mE={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},gE={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function _E(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=gE[e])?!!t[e]:!1}function Im(){return _E}var vE=Te({},Hl,{key:function(e){if(e.key){var t=pE[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=xu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?mE[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Im,charCode:function(e){return e.type==="keypress"?xu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?xu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),yE=Hn(vE),xE=Te({},ch,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Y_=Hn(xE),SE=Te({},Hl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Im}),ME=Hn(SE),bE=Te({},Ka,{propertyName:0,elapsedTime:0,pseudoElement:0}),EE=Hn(bE),TE=Te({},ch,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),AE=Hn(TE),wE=Te({},Ka,{newState:0,oldState:0}),CE=Hn(wE),RE=[9,13,27,32],Pm=_s&&"CompositionEvent"in window,cl=null;_s&&"documentMode"in document&&(cl=document.documentMode);var DE=_s&&"TextEvent"in window&&!cl,Dy=_s&&(!Pm||cl&&8<cl&&11>=cl),Z_=" ",K_=!1;function Ny(e,t){switch(e){case"keyup":return RE.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Uy(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Dr=!1;function NE(e,t){switch(e){case"compositionend":return Uy(t);case"keypress":return t.which!==32?null:(K_=!0,Z_);case"textInput":return e=t.data,e===Z_&&K_?null:e;default:return null}}function UE(e,t){if(Dr)return e==="compositionend"||!Pm&&Ny(e,t)?(e=Ry(),yu=Om=Zs=null,Dr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Dy&&t.locale!=="ko"?null:t.data;default:return null}}var LE={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function J_(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!LE[e.type]:t==="textarea"}function Ly(e,t,n,i){Rr?Vr?Vr.push(i):Vr=[i]:Rr=i,t=th(t,"onChange"),0<t.length&&(n=new lh("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var ul=null,El=null;function OE(e){CS(e,0)}function uh(e){var t=rl(e);if(by(t))return e}function j_(e,t){if(e==="change")return t}var Oy=!1;_s&&(_s?(ru="oninput"in document,ru||(op=document.createElement("div"),op.setAttribute("oninput","return;"),ru=typeof op.oninput=="function"),au=ru):au=!1,Oy=au&&(!document.documentMode||9<document.documentMode));var au,ru,op;function Q_(){ul&&(ul.detachEvent("onpropertychange",Iy),El=ul=null)}function Iy(e){if(e.propertyName==="value"&&uh(El)){var t=[];Ly(t,El,e,Lm(e)),Cy(OE,t)}}function IE(e,t,n){e==="focusin"?(Q_(),ul=t,El=n,ul.attachEvent("onpropertychange",Iy)):e==="focusout"&&Q_()}function PE(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return uh(El)}function BE(e,t){if(e==="click")return uh(t)}function zE(e,t){if(e==="input"||e==="change")return uh(t)}function FE(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ti=typeof Object.is=="function"?Object.is:FE;function Tl(e,t){if(ti(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!zp.call(t,s)||!ti(e[s],t[s]))return!1}return!0}function $_(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function tv(e,t){var n=$_(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=$_(n)}}function Py(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Py(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function By(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Pu(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Pu(e.document)}return t}function Bm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var VE=_s&&"documentMode"in document&&11>=document.documentMode,Nr=null,Wp=null,hl=null,qp=!1;function ev(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;qp||Nr==null||Nr!==Pu(i)||(i=Nr,"selectionStart"in i&&Bm(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),hl&&Tl(hl,i)||(hl=i,i=th(Wp,"onSelect"),0<i.length&&(t=new lh("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=Nr)))}function La(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Ur={animationend:La("Animation","AnimationEnd"),animationiteration:La("Animation","AnimationIteration"),animationstart:La("Animation","AnimationStart"),transitionrun:La("Transition","TransitionRun"),transitionstart:La("Transition","TransitionStart"),transitioncancel:La("Transition","TransitionCancel"),transitionend:La("Transition","TransitionEnd")},lp={},zy={};_s&&(zy=document.createElement("div").style,"AnimationEvent"in window||(delete Ur.animationend.animation,delete Ur.animationiteration.animation,delete Ur.animationstart.animation),"TransitionEvent"in window||delete Ur.transitionend.transition);function Ja(e){if(lp[e])return lp[e];if(!Ur[e])return e;var t=Ur[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in zy)return lp[e]=t[n];return e}var Fy=Ja("animationend"),Vy=Ja("animationiteration"),Hy=Ja("animationstart"),HE=Ja("transitionrun"),GE=Ja("transitionstart"),kE=Ja("transitioncancel"),Gy=Ja("transitionend"),ky=new Map,Yp="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Yp.push("scrollEnd");function Ti(e,t){ky.set(e,t),Za(t,[e])}var Bu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ui=[],Lr=0,zm=0;function hh(){for(var e=Lr,t=zm=Lr=0;t<e;){var n=ui[t];ui[t++]=null;var i=ui[t];ui[t++]=null;var s=ui[t];ui[t++]=null;var a=ui[t];if(ui[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&Xy(n,s,a)}}function fh(e,t,n,i){ui[Lr++]=e,ui[Lr++]=t,ui[Lr++]=n,ui[Lr++]=i,zm|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function Fm(e,t,n,i){return fh(e,t,n,i),zu(e)}function ja(e,t){return fh(e,null,null,t),zu(e)}function Xy(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-Qn(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function zu(e){if(50<xl)throw xl=0,pm=null,Error($(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Or={};function XE(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Zn(e,t,n,i){return new XE(e,t,n,i)}function Vm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ps(e,t){var n=e.alternate;return n===null?(n=Zn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function Wy(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Su(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")Vm(e)&&(r=1);else if(typeof e=="string")r=YT(e,n,Xi.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case Op:return e=Zn(31,n,t,s),e.elementType=Op,e.lanes=a,e;case Ar:return Fa(n.children,s,a,t);case uy:r=8,s|=24;break;case Np:return e=Zn(12,n,t,s|2),e.elementType=Np,e.lanes=a,e;case Up:return e=Zn(13,n,t,s),e.elementType=Up,e.lanes=a,e;case Lp:return e=Zn(19,n,t,s),e.elementType=Lp,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case hs:r=10;break t;case hy:r=9;break t;case Am:r=11;break t;case wm:r=14;break t;case Hs:r=16,i=null;break t}r=29,n=Error($(130,e===null?"null":typeof e,"")),i=null}return t=Zn(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function Fa(e,t,n,i){return e=Zn(7,e,i,t),e.lanes=n,e}function cp(e,t,n){return e=Zn(6,e,null,t),e.lanes=n,e}function qy(e){var t=Zn(18,null,null,0);return t.stateNode=e,t}function up(e,t,n){return t=Zn(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var nv=new WeakMap;function mi(e,t){if(typeof e=="object"&&e!==null){var n=nv.get(e);return n!==void 0?n:(t={value:e,source:t,stack:B_(t)},nv.set(e,t),t)}return{value:e,source:t,stack:B_(t)}}var Ir=[],Pr=0,Fu=null,Al=0,fi=[],di=0,oa=null,Hi=1,Gi="";function cs(e,t){Ir[Pr++]=Al,Ir[Pr++]=Fu,Fu=e,Al=t}function Yy(e,t,n){fi[di++]=Hi,fi[di++]=Gi,fi[di++]=oa,oa=e;var i=Hi;e=Gi;var s=32-Qn(i)-1;i&=~(1<<s),n+=1;var a=32-Qn(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,Hi=1<<32-Qn(t)+s|n<<s|i,Gi=a+e}else Hi=1<<a|n<<s|i,Gi=e}function Hm(e){e.return!==null&&(cs(e,1),Yy(e,1,0))}function Gm(e){for(;e===Fu;)Fu=Ir[--Pr],Ir[Pr]=null,Al=Ir[--Pr],Ir[Pr]=null;for(;e===oa;)oa=fi[--di],fi[di]=null,Gi=fi[--di],fi[di]=null,Hi=fi[--di],fi[di]=null}function Zy(e,t){fi[di++]=Hi,fi[di++]=Gi,fi[di++]=oa,Hi=t.id,Gi=t.overflow,oa=e}var mn=null,Ee=null,Kt=!1,$s=null,gi=!1,Zp=Error($(519));function la(e){var t=Error($(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw wl(mi(t,e)),Zp}function iv(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[pn]=e,t[Vn]=i,n){case"dialog":Xt("cancel",t),Xt("close",t);break;case"iframe":case"object":case"embed":Xt("load",t);break;case"video":case"audio":for(n=0;n<Nl.length;n++)Xt(Nl[n],t);break;case"source":Xt("error",t);break;case"img":case"image":case"link":Xt("error",t),Xt("load",t);break;case"details":Xt("toggle",t);break;case"input":Xt("invalid",t),Ey(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":Xt("invalid",t);break;case"textarea":Xt("invalid",t),Ay(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||DS(t.textContent,n)?(i.popover!=null&&(Xt("beforetoggle",t),Xt("toggle",t)),i.onScroll!=null&&Xt("scroll",t),i.onScrollEnd!=null&&Xt("scrollend",t),i.onClick!=null&&(t.onclick=fs),t=!0):t=!1,t||la(e,!0)}function sv(e){for(mn=e.return;mn;)switch(mn.tag){case 5:case 31:case 13:gi=!1;return;case 27:case 3:gi=!0;return;default:mn=mn.return}}function Mr(e){if(e!==mn)return!1;if(!Kt)return sv(e),Kt=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||ym(e.type,e.memoizedProps)),n=!n),n&&Ee&&la(e),sv(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(317));Ee=qv(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(317));Ee=qv(e)}else t===27?(t=Ee,fa(e.type)?(e=bm,bm=null,Ee=e):Ee=t):Ee=mn?vi(e.stateNode.nextSibling):null;return!0}function ka(){Ee=mn=null,Kt=!1}function hp(){var e=$s;return e!==null&&(zn===null?zn=e:zn.push.apply(zn,e),$s=null),e}function wl(e){$s===null?$s=[e]:$s.push(e)}var Kp=Wi(null),Qa=null,ds=null;function ks(e,t,n){xe(Kp,t._currentValue),t._currentValue=n}function ms(e){e._currentValue=Kp.current,on(Kp)}function Jp(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function jp(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Jp(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error($(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),Jp(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function so(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error($(387));if(r=r.memoizedProps,r!==null){var o=s.type;ti(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Uu.current){if(r=s.alternate,r===null)throw Error($(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push(Ll):e=[Ll])}s=s.return}e!==null&&jp(t,e,n,i),t.flags|=262144}function Vu(e){for(e=e.firstContext;e!==null;){if(!ti(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Xa(e){Qa=e,ds=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function gn(e){return Ky(Qa,e)}function ou(e,t){return Qa===null&&Xa(e),Ky(e,t)}function Ky(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},ds===null){if(e===null)throw Error($(308));ds=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ds=ds.next=t;return n}var WE=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},qE=$e.unstable_scheduleCallback,YE=$e.unstable_NormalPriority,Ye={$$typeof:hs,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function km(){return{controller:new WE,data:new Map,refCount:0}}function Gl(e){e.refCount--,e.refCount===0&&qE(YE,function(){e.controller.abort()})}var fl=null,Qp=0,Zr=0,Hr=null;function ZE(e,t){if(fl===null){var n=fl=[];Qp=0,Zr=pg(),Hr={status:"pending",value:void 0,then:function(i){n.push(i)}}}return Qp++,t.then(av,av),t}function av(){if(--Qp===0&&fl!==null){Hr!==null&&(Hr.status="fulfilled");var e=fl;fl=null,Zr=0,Hr=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function KE(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var rv=Ut.S;Ut.S=function(e,t){cS=Jn(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&ZE(e,t),rv!==null&&rv(e,t)};var Va=Wi(null);function Xm(){var e=Va.current;return e!==null?e:ge.pooledCache}function Mu(e,t){t===null?xe(Va,Va.current):xe(Va,t.pool)}function Jy(){var e=Xm();return e===null?null:{parent:Ye._currentValue,pool:e}}var ao=Error($(460)),Wm=Error($(474)),dh=Error($(542)),Hu={then:function(){}};function ov(e){return e=e.status,e==="fulfilled"||e==="rejected"}function jy(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(fs,fs),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,cv(e),e;default:if(typeof t.status=="string")t.then(fs,fs);else{if(e=ge,e!==null&&100<e.shellSuspendCounter)throw Error($(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,cv(e),e}throw Ha=t,ao}}function Pa(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Ha=n,ao):n}}var Ha=null;function lv(){if(Ha===null)throw Error($(459));var e=Ha;return Ha=null,e}function cv(e){if(e===ao||e===dh)throw Error($(483))}var Gr=null,Cl=0;function lu(e){var t=Cl;return Cl+=1,Gr===null&&(Gr=[]),jy(Gr,e,t)}function $o(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function cu(e,t){throw t.$$typeof===I1?Error($(525)):(e=Object.prototype.toString.call(t),Error($(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Qy(e){function t(h,_){if(e){var S=h.deletions;S===null?(h.deletions=[_],h.flags|=16):S.push(_)}}function n(h,_){if(!e)return null;for(;_!==null;)t(h,_),_=_.sibling;return null}function i(h){for(var _=new Map;h!==null;)h.key!==null?_.set(h.key,h):_.set(h.index,h),h=h.sibling;return _}function s(h,_){return h=ps(h,_),h.index=0,h.sibling=null,h}function a(h,_,S){return h.index=S,e?(S=h.alternate,S!==null?(S=S.index,S<_?(h.flags|=67108866,_):S):(h.flags|=67108866,_)):(h.flags|=1048576,_)}function r(h){return e&&h.alternate===null&&(h.flags|=67108866),h}function o(h,_,S,y){return _===null||_.tag!==6?(_=cp(S,h.mode,y),_.return=h,_):(_=s(_,S),_.return=h,_)}function l(h,_,S,y){var E=S.type;return E===Ar?f(h,_,S.props.children,y,S.key):_!==null&&(_.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===Hs&&Pa(E)===_.type)?(_=s(_,S.props),$o(_,S),_.return=h,_):(_=Su(S.type,S.key,S.props,null,h.mode,y),$o(_,S),_.return=h,_)}function c(h,_,S,y){return _===null||_.tag!==4||_.stateNode.containerInfo!==S.containerInfo||_.stateNode.implementation!==S.implementation?(_=up(S,h.mode,y),_.return=h,_):(_=s(_,S.children||[]),_.return=h,_)}function f(h,_,S,y,E){return _===null||_.tag!==7?(_=Fa(S,h.mode,y,E),_.return=h,_):(_=s(_,S),_.return=h,_)}function p(h,_,S){if(typeof _=="string"&&_!==""||typeof _=="number"||typeof _=="bigint")return _=cp(""+_,h.mode,S),_.return=h,_;if(typeof _=="object"&&_!==null){switch(_.$$typeof){case $c:return S=Su(_.type,_.key,_.props,null,h.mode,S),$o(S,_),S.return=h,S;case sl:return _=up(_,h.mode,S),_.return=h,_;case Hs:return _=Pa(_),p(h,_,S)}if(al(_)||jo(_))return _=Fa(_,h.mode,S,null),_.return=h,_;if(typeof _.then=="function")return p(h,lu(_),S);if(_.$$typeof===hs)return p(h,ou(h,_),S);cu(h,_)}return null}function u(h,_,S,y){var E=_!==null?_.key:null;if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return E!==null?null:o(h,_,""+S,y);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case $c:return S.key===E?l(h,_,S,y):null;case sl:return S.key===E?c(h,_,S,y):null;case Hs:return S=Pa(S),u(h,_,S,y)}if(al(S)||jo(S))return E!==null?null:f(h,_,S,y,null);if(typeof S.then=="function")return u(h,_,lu(S),y);if(S.$$typeof===hs)return u(h,_,ou(h,S),y);cu(h,S)}return null}function d(h,_,S,y,E){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return h=h.get(S)||null,o(_,h,""+y,E);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case $c:return h=h.get(y.key===null?S:y.key)||null,l(_,h,y,E);case sl:return h=h.get(y.key===null?S:y.key)||null,c(_,h,y,E);case Hs:return y=Pa(y),d(h,_,S,y,E)}if(al(y)||jo(y))return h=h.get(S)||null,f(_,h,y,E,null);if(typeof y.then=="function")return d(h,_,S,lu(y),E);if(y.$$typeof===hs)return d(h,_,S,ou(_,y),E);cu(_,y)}return null}function g(h,_,S,y){for(var E=null,A=null,w=_,v=_=0,T=null;w!==null&&v<S.length;v++){w.index>v?(T=w,w=null):T=w.sibling;var D=u(h,w,S[v],y);if(D===null){w===null&&(w=T);break}e&&w&&D.alternate===null&&t(h,w),_=a(D,_,v),A===null?E=D:A.sibling=D,A=D,w=T}if(v===S.length)return n(h,w),Kt&&cs(h,v),E;if(w===null){for(;v<S.length;v++)w=p(h,S[v],y),w!==null&&(_=a(w,_,v),A===null?E=w:A.sibling=w,A=w);return Kt&&cs(h,v),E}for(w=i(w);v<S.length;v++)T=d(w,h,v,S[v],y),T!==null&&(e&&T.alternate!==null&&w.delete(T.key===null?v:T.key),_=a(T,_,v),A===null?E=T:A.sibling=T,A=T);return e&&w.forEach(function(N){return t(h,N)}),Kt&&cs(h,v),E}function M(h,_,S,y){if(S==null)throw Error($(151));for(var E=null,A=null,w=_,v=_=0,T=null,D=S.next();w!==null&&!D.done;v++,D=S.next()){w.index>v?(T=w,w=null):T=w.sibling;var N=u(h,w,D.value,y);if(N===null){w===null&&(w=T);break}e&&w&&N.alternate===null&&t(h,w),_=a(N,_,v),A===null?E=N:A.sibling=N,A=N,w=T}if(D.done)return n(h,w),Kt&&cs(h,v),E;if(w===null){for(;!D.done;v++,D=S.next())D=p(h,D.value,y),D!==null&&(_=a(D,_,v),A===null?E=D:A.sibling=D,A=D);return Kt&&cs(h,v),E}for(w=i(w);!D.done;v++,D=S.next())D=d(w,h,v,D.value,y),D!==null&&(e&&D.alternate!==null&&w.delete(D.key===null?v:D.key),_=a(D,_,v),A===null?E=D:A.sibling=D,A=D);return e&&w.forEach(function(R){return t(h,R)}),Kt&&cs(h,v),E}function m(h,_,S,y){if(typeof S=="object"&&S!==null&&S.type===Ar&&S.key===null&&(S=S.props.children),typeof S=="object"&&S!==null){switch(S.$$typeof){case $c:t:{for(var E=S.key;_!==null;){if(_.key===E){if(E=S.type,E===Ar){if(_.tag===7){n(h,_.sibling),y=s(_,S.props.children),y.return=h,h=y;break t}}else if(_.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===Hs&&Pa(E)===_.type){n(h,_.sibling),y=s(_,S.props),$o(y,S),y.return=h,h=y;break t}n(h,_);break}else t(h,_);_=_.sibling}S.type===Ar?(y=Fa(S.props.children,h.mode,y,S.key),y.return=h,h=y):(y=Su(S.type,S.key,S.props,null,h.mode,y),$o(y,S),y.return=h,h=y)}return r(h);case sl:t:{for(E=S.key;_!==null;){if(_.key===E)if(_.tag===4&&_.stateNode.containerInfo===S.containerInfo&&_.stateNode.implementation===S.implementation){n(h,_.sibling),y=s(_,S.children||[]),y.return=h,h=y;break t}else{n(h,_);break}else t(h,_);_=_.sibling}y=up(S,h.mode,y),y.return=h,h=y}return r(h);case Hs:return S=Pa(S),m(h,_,S,y)}if(al(S))return g(h,_,S,y);if(jo(S)){if(E=jo(S),typeof E!="function")throw Error($(150));return S=E.call(S),M(h,_,S,y)}if(typeof S.then=="function")return m(h,_,lu(S),y);if(S.$$typeof===hs)return m(h,_,ou(h,S),y);cu(h,S)}return typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint"?(S=""+S,_!==null&&_.tag===6?(n(h,_.sibling),y=s(_,S),y.return=h,h=y):(n(h,_),y=cp(S,h.mode,y),y.return=h,h=y),r(h)):n(h,_)}return function(h,_,S,y){try{Cl=0;var E=m(h,_,S,y);return Gr=null,E}catch(w){if(w===ao||w===dh)throw w;var A=Zn(29,w,null,h.mode);return A.lanes=y,A.return=h,A}finally{}}}var Wa=Qy(!0),$y=Qy(!1),Gs=!1;function qm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function $p(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ta(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function ea(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(ee&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=zu(e),Xy(e,null,n),t}return fh(e,i,t,n),zu(e)}function dl(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,_y(e,n)}}function fp(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var tm=!1;function pl(){if(tm){var e=Hr;if(e!==null)throw e}}function ml(e,t,n,i){tm=!1;var s=e.updateQueue;Gs=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var f=e.alternate;f!==null&&(f=f.updateQueue,o=f.lastBaseUpdate,o!==r&&(o===null?f.firstBaseUpdate=c:o.next=c,f.lastBaseUpdate=l))}if(a!==null){var p=s.baseState;r=0,f=c=l=null,o=a;do{var u=o.lane&-536870913,d=u!==o.lane;if(d?(Yt&u)===u:(i&u)===u){u!==0&&u===Zr&&(tm=!0),f!==null&&(f=f.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var g=e,M=o;u=t;var m=n;switch(M.tag){case 1:if(g=M.payload,typeof g=="function"){p=g.call(m,p,u);break t}p=g;break t;case 3:g.flags=g.flags&-65537|128;case 0:if(g=M.payload,u=typeof g=="function"?g.call(m,p,u):g,u==null)break t;p=Te({},p,u);break t;case 2:Gs=!0}}u=o.callback,u!==null&&(e.flags|=64,d&&(e.flags|=8192),d=s.callbacks,d===null?s.callbacks=[u]:d.push(u))}else d={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},f===null?(c=f=d,l=p):f=f.next=d,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;d=o,o=d.next,d.next=null,s.lastBaseUpdate=d,s.shared.pending=null}}while(!0);f===null&&(l=p),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=f,a===null&&(s.shared.lanes=0),ua|=r,e.lanes=r,e.memoizedState=p}}function tx(e,t){if(typeof e!="function")throw Error($(191,e));e.call(t)}function ex(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)tx(n[e],t)}var Kr=Wi(null),Gu=Wi(0);function uv(e,t){e=Ss,xe(Gu,e),xe(Kr,t),Ss=e|t.baseLanes}function em(){xe(Gu,Ss),xe(Kr,Kr.current)}function Ym(){Ss=Gu.current,on(Kr),on(Gu)}var ei=Wi(null),_i=null;function Xs(e){var t=e.alternate;xe(He,He.current&1),xe(ei,e),_i===null&&(t===null||Kr.current!==null||t.memoizedState!==null)&&(_i=e)}function nm(e){xe(He,He.current),xe(ei,e),_i===null&&(_i=e)}function nx(e){e.tag===22?(xe(He,He.current),xe(ei,e),_i===null&&(_i=e)):Ws(e)}function Ws(){xe(He,He.current),xe(ei,ei.current)}function Yn(e){on(ei),_i===e&&(_i=null),on(He)}var He=Wi(0);function ku(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Sm(n)||Mm(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var vs=0,Vt=null,ue=null,We=null,Xu=!1,kr=!1,qa=!1,Wu=0,Rl=0,Xr=null,JE=0;function Pe(){throw Error($(321))}function Zm(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!ti(e[n],t[n]))return!1;return!0}function Km(e,t,n,i,s,a){return vs=a,Vt=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Ut.H=e===null||e.memoizedState===null?Lx:rg,qa=!1,a=n(i,s),qa=!1,kr&&(a=sx(t,n,i,s)),ix(e),a}function ix(e){Ut.H=Dl;var t=ue!==null&&ue.next!==null;if(vs=0,We=ue=Vt=null,Xu=!1,Rl=0,Xr=null,t)throw Error($(300));e===null||Ze||(e=e.dependencies,e!==null&&Vu(e)&&(Ze=!0))}function sx(e,t,n,i){Vt=e;var s=0;do{if(kr&&(Xr=null),Rl=0,kr=!1,25<=s)throw Error($(301));if(s+=1,We=ue=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}Ut.H=Ox,a=t(n,i)}while(kr);return a}function jE(){var e=Ut.H,t=e.useState()[0];return t=typeof t.then=="function"?kl(t):t,e=e.useState()[0],(ue!==null?ue.memoizedState:null)!==e&&(Vt.flags|=1024),t}function Jm(){var e=Wu!==0;return Wu=0,e}function jm(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Qm(e){if(Xu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Xu=!1}vs=0,We=ue=Vt=null,kr=!1,Rl=Wu=0,Xr=null}function Rn(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return We===null?Vt.memoizedState=We=e:We=We.next=e,We}function Ge(){if(ue===null){var e=Vt.alternate;e=e!==null?e.memoizedState:null}else e=ue.next;var t=We===null?Vt.memoizedState:We.next;if(t!==null)We=t,ue=e;else{if(e===null)throw Vt.alternate===null?Error($(467)):Error($(310));ue=e,e={memoizedState:ue.memoizedState,baseState:ue.baseState,baseQueue:ue.baseQueue,queue:ue.queue,next:null},We===null?Vt.memoizedState=We=e:We=We.next=e}return We}function ph(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function kl(e){var t=Rl;return Rl+=1,Xr===null&&(Xr=[]),e=jy(Xr,e,t),t=Vt,(We===null?t.memoizedState:We.next)===null&&(t=t.alternate,Ut.H=t===null||t.memoizedState===null?Lx:rg),e}function mh(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return kl(e);if(e.$$typeof===hs)return gn(e)}throw Error($(438,String(e)))}function $m(e){var t=null,n=Vt.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=Vt.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=ph(),Vt.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=P1;return t.index++,n}function ys(e,t){return typeof t=="function"?t(e):t}function bu(e){var t=Ge();return tg(t,ue,e)}function tg(e,t,n){var i=e.queue;if(i===null)throw Error($(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(Yt&p)===p:(vs&p)===p){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===Zr&&(f=!0);else if((vs&u)===u){c=c.next,u===Zr&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,r=a):l=l.next=p,Vt.lanes|=u,ua|=u;p=c.action,qa&&n(a,p),a=c.hasEagerState?c.eagerState:n(a,p)}else u={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,Vt.lanes|=p,ua|=p;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!ti(a,e.memoizedState)&&(Ze=!0,f&&(n=Hr,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function dp(e){var t=Ge(),n=t.queue;if(n===null)throw Error($(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);ti(a,t.memoizedState)||(Ze=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function ax(e,t,n){var i=Vt,s=Ge(),a=Kt;if(a){if(n===void 0)throw Error($(407));n=n()}else n=t();var r=!ti((ue||s).memoizedState,n);if(r&&(s.memoizedState=n,Ze=!0),s=s.queue,eg(lx.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||We!==null&&We.memoizedState.tag&1){if(i.flags|=2048,Jr(9,{destroy:void 0},ox.bind(null,i,s,n,t),null),ge===null)throw Error($(349));a||(vs&127)!==0||rx(i,t,n)}return n}function rx(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Vt.updateQueue,t===null?(t=ph(),Vt.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function ox(e,t,n,i){t.value=n,t.getSnapshot=i,cx(t)&&ux(e)}function lx(e,t,n){return n(function(){cx(t)&&ux(e)})}function cx(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!ti(e,n)}catch{return!0}}function ux(e){var t=ja(e,2);t!==null&&Fn(t,e,2)}function im(e){var t=Rn();if(typeof e=="function"){var n=e;if(e=n(),qa){Ys(!0);try{n()}finally{Ys(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:e},t}function hx(e,t,n,i){return e.baseState=n,tg(e,ue,typeof i=="function"?i:ys)}function QE(e,t,n,i,s){if(_h(e))throw Error($(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};Ut.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,fx(t,a)):(a.next=n.next,t.pending=n.next=a)}}function fx(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=Ut.T,r={};Ut.T=r;try{var o=n(s,i),l=Ut.S;l!==null&&l(r,o),hv(e,t,o)}catch(c){sm(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),Ut.T=a}}else try{a=n(s,i),hv(e,t,a)}catch(c){sm(e,t,c)}}function hv(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){fv(e,t,i)},function(i){return sm(e,t,i)}):fv(e,t,n)}function fv(e,t,n){t.status="fulfilled",t.value=n,dx(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,fx(e,n)))}function sm(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,dx(t),t=t.next;while(t!==i)}e.action=null}function dx(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function px(e,t){return t}function dv(e,t){if(Kt){var n=ge.formState;if(n!==null){t:{var i=Vt;if(Kt){if(Ee){e:{for(var s=Ee,a=gi;s.nodeType!==8;){if(!a){s=null;break e}if(s=vi(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Ee=vi(s.nextSibling),i=s.data==="F!";break t}}la(i)}i=!1}i&&(t=n[0])}}return n=Rn(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:px,lastRenderedState:t},n.queue=i,n=Dx.bind(null,Vt,i),i.dispatch=n,i=im(!1),a=ag.bind(null,Vt,!1,i.queue),i=Rn(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=QE.bind(null,Vt,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function pv(e){var t=Ge();return mx(t,ue,e)}function mx(e,t,n){if(t=tg(e,t,px)[0],e=bu(ys)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=kl(t)}catch(r){throw r===ao?dh:r}else i=t;t=Ge();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&(Vt.flags|=2048,Jr(9,{destroy:void 0},$E.bind(null,s,n),null)),[i,a,e]}function $E(e,t){e.action=t}function mv(e){var t=Ge(),n=ue;if(n!==null)return mx(t,n,e);Ge(),t=t.memoizedState,n=Ge();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function Jr(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=Vt.updateQueue,t===null&&(t=ph(),Vt.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function gx(){return Ge().memoizedState}function Eu(e,t,n,i){var s=Rn();Vt.flags|=e,s.memoizedState=Jr(1|t,{destroy:void 0},n,i===void 0?null:i)}function gh(e,t,n,i){var s=Ge();i=i===void 0?null:i;var a=s.memoizedState.inst;ue!==null&&i!==null&&Zm(i,ue.memoizedState.deps)?s.memoizedState=Jr(t,a,n,i):(Vt.flags|=e,s.memoizedState=Jr(1|t,a,n,i))}function gv(e,t){Eu(8390656,8,e,t)}function eg(e,t){gh(2048,8,e,t)}function tT(e){Vt.flags|=4;var t=Vt.updateQueue;if(t===null)t=ph(),Vt.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function _x(e){var t=Ge().memoizedState;return tT({ref:t,nextImpl:e}),function(){if((ee&2)!==0)throw Error($(440));return t.impl.apply(void 0,arguments)}}function vx(e,t){return gh(4,2,e,t)}function yx(e,t){return gh(4,4,e,t)}function xx(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Sx(e,t,n){n=n!=null?n.concat([e]):null,gh(4,4,xx.bind(null,t,e),n)}function ng(){}function Mx(e,t){var n=Ge();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&Zm(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function bx(e,t){var n=Ge();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&Zm(t,i[1]))return i[0];if(i=e(),qa){Ys(!0);try{e()}finally{Ys(!1)}}return n.memoizedState=[i,t],i}function ig(e,t,n){return n===void 0||(vs&1073741824)!==0&&(Yt&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=hS(),Vt.lanes|=e,ua|=e,n)}function Ex(e,t,n,i){return ti(n,t)?n:Kr.current!==null?(e=ig(e,n,i),ti(e,t)||(Ze=!0),e):(vs&42)===0||(vs&1073741824)!==0&&(Yt&261930)===0?(Ze=!0,e.memoizedState=n):(e=hS(),Vt.lanes|=e,ua|=e,t)}function Tx(e,t,n,i,s){var a=ne.p;ne.p=a!==0&&8>a?a:8;var r=Ut.T,o={};Ut.T=o,ag(e,!1,t,n);try{var l=s(),c=Ut.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=KE(l,i);gl(e,t,f,$n(e))}else gl(e,t,i,$n(e))}catch(p){gl(e,t,{then:function(){},status:"rejected",reason:p},$n())}finally{ne.p=a,r!==null&&o.types!==null&&(r.types=o.types),Ut.T=r}}function eT(){}function am(e,t,n,i){if(e.tag!==5)throw Error($(476));var s=Ax(e).queue;Tx(e,s,t,za,n===null?eT:function(){return wx(e),n(i)})}function Ax(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:za,baseState:za,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:za},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ys,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function wx(e){var t=Ax(e);t.next===null&&(t=e.alternate.memoizedState),gl(e,t.next.queue,{},$n())}function sg(){return gn(Ll)}function Cx(){return Ge().memoizedState}function Rx(){return Ge().memoizedState}function nT(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=$n();e=ta(n);var i=ea(t,e,n);i!==null&&(Fn(i,t,n),dl(i,t,n)),t={cache:km()},e.payload=t;return}t=t.return}}function iT(e,t,n){var i=$n();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},_h(e)?Nx(t,n):(n=Fm(e,t,n,i),n!==null&&(Fn(n,e,i),Ux(n,t,i)))}function Dx(e,t,n){var i=$n();gl(e,t,n,i)}function gl(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(_h(e))Nx(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,ti(o,r))return fh(e,t,s,0),ge===null&&hh(),!1}catch{}finally{}if(n=Fm(e,t,s,i),n!==null)return Fn(n,e,i),Ux(n,t,i),!0}return!1}function ag(e,t,n,i){if(i={lane:2,revertLane:pg(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},_h(e)){if(t)throw Error($(479))}else t=Fm(e,n,i,2),t!==null&&Fn(t,e,2)}function _h(e){var t=e.alternate;return e===Vt||t!==null&&t===Vt}function Nx(e,t){kr=Xu=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Ux(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,_y(e,n)}}var Dl={readContext:gn,use:mh,useCallback:Pe,useContext:Pe,useEffect:Pe,useImperativeHandle:Pe,useLayoutEffect:Pe,useInsertionEffect:Pe,useMemo:Pe,useReducer:Pe,useRef:Pe,useState:Pe,useDebugValue:Pe,useDeferredValue:Pe,useTransition:Pe,useSyncExternalStore:Pe,useId:Pe,useHostTransitionStatus:Pe,useFormState:Pe,useActionState:Pe,useOptimistic:Pe,useMemoCache:Pe,useCacheRefresh:Pe};Dl.useEffectEvent=Pe;var Lx={readContext:gn,use:mh,useCallback:function(e,t){return Rn().memoizedState=[e,t===void 0?null:t],e},useContext:gn,useEffect:gv,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Eu(4194308,4,xx.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Eu(4194308,4,e,t)},useInsertionEffect:function(e,t){Eu(4,2,e,t)},useMemo:function(e,t){var n=Rn();t=t===void 0?null:t;var i=e();if(qa){Ys(!0);try{e()}finally{Ys(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=Rn();if(n!==void 0){var s=n(t);if(qa){Ys(!0);try{n(t)}finally{Ys(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=iT.bind(null,Vt,e),[i.memoizedState,e]},useRef:function(e){var t=Rn();return e={current:e},t.memoizedState=e},useState:function(e){e=im(e);var t=e.queue,n=Dx.bind(null,Vt,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:ng,useDeferredValue:function(e,t){var n=Rn();return ig(n,e,t)},useTransition:function(){var e=im(!1);return e=Tx.bind(null,Vt,e.queue,!0,!1),Rn().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=Vt,s=Rn();if(Kt){if(n===void 0)throw Error($(407));n=n()}else{if(n=t(),ge===null)throw Error($(349));(Yt&127)!==0||rx(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,gv(lx.bind(null,i,a,e),[e]),i.flags|=2048,Jr(9,{destroy:void 0},ox.bind(null,i,a,n,t),null),n},useId:function(){var e=Rn(),t=ge.identifierPrefix;if(Kt){var n=Gi,i=Hi;n=(i&~(1<<32-Qn(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=Wu++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=JE++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:sg,useFormState:dv,useActionState:dv,useOptimistic:function(e){var t=Rn();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=ag.bind(null,Vt,!0,n),n.dispatch=t,[e,t]},useMemoCache:$m,useCacheRefresh:function(){return Rn().memoizedState=nT.bind(null,Vt)},useEffectEvent:function(e){var t=Rn(),n={impl:e};return t.memoizedState=n,function(){if((ee&2)!==0)throw Error($(440));return n.impl.apply(void 0,arguments)}}},rg={readContext:gn,use:mh,useCallback:Mx,useContext:gn,useEffect:eg,useImperativeHandle:Sx,useInsertionEffect:vx,useLayoutEffect:yx,useMemo:bx,useReducer:bu,useRef:gx,useState:function(){return bu(ys)},useDebugValue:ng,useDeferredValue:function(e,t){var n=Ge();return Ex(n,ue.memoizedState,e,t)},useTransition:function(){var e=bu(ys)[0],t=Ge().memoizedState;return[typeof e=="boolean"?e:kl(e),t]},useSyncExternalStore:ax,useId:Cx,useHostTransitionStatus:sg,useFormState:pv,useActionState:pv,useOptimistic:function(e,t){var n=Ge();return hx(n,ue,e,t)},useMemoCache:$m,useCacheRefresh:Rx};rg.useEffectEvent=_x;var Ox={readContext:gn,use:mh,useCallback:Mx,useContext:gn,useEffect:eg,useImperativeHandle:Sx,useInsertionEffect:vx,useLayoutEffect:yx,useMemo:bx,useReducer:dp,useRef:gx,useState:function(){return dp(ys)},useDebugValue:ng,useDeferredValue:function(e,t){var n=Ge();return ue===null?ig(n,e,t):Ex(n,ue.memoizedState,e,t)},useTransition:function(){var e=dp(ys)[0],t=Ge().memoizedState;return[typeof e=="boolean"?e:kl(e),t]},useSyncExternalStore:ax,useId:Cx,useHostTransitionStatus:sg,useFormState:mv,useActionState:mv,useOptimistic:function(e,t){var n=Ge();return ue!==null?hx(n,ue,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:$m,useCacheRefresh:Rx};Ox.useEffectEvent=_x;function pp(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:Te({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var rm={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=$n(),s=ta(i);s.payload=t,n!=null&&(s.callback=n),t=ea(e,s,i),t!==null&&(Fn(t,e,i),dl(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=$n(),s=ta(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=ea(e,s,i),t!==null&&(Fn(t,e,i),dl(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=$n(),i=ta(n);i.tag=2,t!=null&&(i.callback=t),t=ea(e,i,n),t!==null&&(Fn(t,e,n),dl(t,e,n))}};function _v(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!Tl(n,i)||!Tl(s,a):!0}function vv(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&rm.enqueueReplaceState(t,t.state,null)}function Ya(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=Te({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function Ix(e){Bu(e)}function Px(e){console.error(e)}function Bx(e){Bu(e)}function qu(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function yv(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function om(e,t,n){return n=ta(n),n.tag=3,n.payload={element:null},n.callback=function(){qu(e,t)},n}function zx(e){return e=ta(e),e.tag=3,e}function Fx(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){yv(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){yv(t,n,i),typeof s!="function"&&(na===null?na=new Set([this]):na.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function sT(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&so(t,n,s,!0),n=ei.current,n!==null){switch(n.tag){case 31:case 13:return _i===null?ju():n.alternate===null&&Be===0&&(Be=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===Hu?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),Tp(e,i,s)),!1;case 22:return n.flags|=65536,i===Hu?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),Tp(e,i,s)),!1}throw Error($(435,n.tag))}return Tp(e,i,s),ju(),!1}if(Kt)return t=ei.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==Zp&&(e=Error($(422),{cause:i}),wl(mi(e,n)))):(i!==Zp&&(t=Error($(423),{cause:i}),wl(mi(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=mi(i,n),s=om(e.stateNode,i,s),fp(e,s),Be!==4&&(Be=2)),!1;var a=Error($(520),{cause:i});if(a=mi(a,n),yl===null?yl=[a]:yl.push(a),Be!==4&&(Be=2),t===null)return!0;i=mi(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=om(n.stateNode,i,e),fp(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(na===null||!na.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=zx(s),Fx(s,e,n,i),fp(n,s),!1}n=n.return}while(n!==null);return!1}var og=Error($(461)),Ze=!1;function dn(e,t,n,i){t.child=e===null?$y(t,null,n,i):Wa(t,e.child,n,i)}function xv(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return Xa(t),i=Km(e,t,n,r,a,s),o=Jm(),e!==null&&!Ze?(jm(e,t,s),xs(e,t,s)):(Kt&&o&&Hm(t),t.flags|=1,dn(e,t,i,s),t.child)}function Sv(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!Vm(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Vx(e,t,a,i,s)):(e=Su(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!lg(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:Tl,n(r,i)&&e.ref===t.ref)return xs(e,t,s)}return t.flags|=1,e=ps(a,i),e.ref=t.ref,e.return=t,t.child=e}function Vx(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(Tl(a,i)&&e.ref===t.ref)if(Ze=!1,t.pendingProps=i=a,lg(e,s))(e.flags&131072)!==0&&(Ze=!0);else return t.lanes=e.lanes,xs(e,t,s)}return lm(e,t,n,i,s)}function Hx(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return Mv(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Mu(t,a!==null?a.cachePool:null),a!==null?uv(t,a):em(),nx(t);else return i=t.lanes=536870912,Mv(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(Mu(t,a.cachePool),uv(t,a),Ws(t),t.memoizedState=null):(e!==null&&Mu(t,null),em(),Ws(t));return dn(e,t,s,n),t.child}function ol(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Mv(e,t,n,i,s){var a=Xm();return a=a===null?null:{parent:Ye._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Mu(t,null),em(),nx(t),e!==null&&so(e,t,i,!0),t.childLanes=s,null}function Tu(e,t){return t=Yu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function bv(e,t,n){return Wa(t,e.child,null,n),e=Tu(t,t.pendingProps),e.flags|=2,Yn(t),t.memoizedState=null,e}function aT(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(Kt){if(i.mode==="hidden")return e=Tu(t,i),t.lanes=536870912,ol(null,e);if(nm(t),(e=Ee)?(e=LS(e,gi),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:oa!==null?{id:Hi,overflow:Gi}:null,retryLane:536870912,hydrationErrors:null},n=qy(e),n.return=t,t.child=n,mn=t,Ee=null)):e=null,e===null)throw la(t);return t.lanes=536870912,null}return Tu(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(nm(t),s)if(t.flags&256)t.flags&=-257,t=bv(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error($(558));else if(Ze||so(e,t,n,!1),s=(n&e.childLanes)!==0,Ze||s){if(i=ge,i!==null&&(r=vy(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,ja(e,r),Fn(i,e,r),og;ju(),t=bv(e,t,n)}else e=a.treeContext,Ee=vi(r.nextSibling),mn=t,Kt=!0,$s=null,gi=!1,e!==null&&Zy(t,e),t=Tu(t,i),t.flags|=4096;return t}return e=ps(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Au(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error($(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function lm(e,t,n,i,s){return Xa(t),n=Km(e,t,n,i,void 0,s),i=Jm(),e!==null&&!Ze?(jm(e,t,s),xs(e,t,s)):(Kt&&i&&Hm(t),t.flags|=1,dn(e,t,n,s),t.child)}function Ev(e,t,n,i,s,a){return Xa(t),t.updateQueue=null,n=sx(t,i,n,s),ix(e),i=Jm(),e!==null&&!Ze?(jm(e,t,a),xs(e,t,a)):(Kt&&i&&Hm(t),t.flags|=1,dn(e,t,n,a),t.child)}function Tv(e,t,n,i,s){if(Xa(t),t.stateNode===null){var a=Or,r=n.contextType;typeof r=="object"&&r!==null&&(a=gn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=rm,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},qm(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?gn(r):Or,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&(pp(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&rm.enqueueReplaceState(a,a.state,null),ml(t,i,a,s),pl(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=Ya(n,o);a.props=l;var c=a.context,f=n.contextType;r=Or,typeof f=="object"&&f!==null&&(r=gn(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&vv(t,a,i,r),Gs=!1;var u=t.memoizedState;a.state=u,ml(t,i,a,s),pl(),c=t.memoizedState,o||u!==c||Gs?(typeof p=="function"&&(pp(t,n,p,i),c=t.memoizedState),(l=Gs||_v(t,n,l,i,u,c,r))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,$p(e,t),r=t.memoizedProps,f=Ya(n,r),a.props=f,p=t.pendingProps,u=a.context,c=n.contextType,l=Or,typeof c=="object"&&c!==null&&(l=gn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==p||u!==l)&&vv(t,a,i,l),Gs=!1,u=t.memoizedState,a.state=u,ml(t,i,a,s),pl();var d=t.memoizedState;r!==p||u!==d||Gs||e!==null&&e.dependencies!==null&&Vu(e.dependencies)?(typeof o=="function"&&(pp(t,n,o,i),d=t.memoizedState),(f=Gs||_v(t,n,f,i,u,d,l)||e!==null&&e.dependencies!==null&&Vu(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,d,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,d,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=d),a.props=i,a.state=d,a.context=l,i=f):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,Au(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=Wa(t,e.child,null,s),t.child=Wa(t,null,n,s)):dn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=xs(e,t,s),e}function Av(e,t,n,i){return ka(),t.flags|=256,dn(e,t,n,i),t.child}var mp={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function gp(e){return{baseLanes:e,cachePool:Jy()}}function _p(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=Kn),e}function Gx(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(He.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(Kt){if(s?Xs(t):Ws(t),(e=Ee)?(e=LS(e,gi),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:oa!==null?{id:Hi,overflow:Gi}:null,retryLane:536870912,hydrationErrors:null},n=qy(e),n.return=t,t.child=n,mn=t,Ee=null)):e=null,e===null)throw la(t);return Mm(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(Ws(t),s=t.mode,o=Yu({mode:"hidden",children:o},s),i=Fa(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=gp(n),i.childLanes=_p(e,r,n),t.memoizedState=mp,ol(null,i)):(Xs(t),cm(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(Xs(t),t.flags&=-257,t=vp(e,t,n)):t.memoizedState!==null?(Ws(t),t.child=e.child,t.flags|=128,t=null):(Ws(t),o=i.fallback,s=t.mode,i=Yu({mode:"visible",children:i.children},s),o=Fa(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,Wa(t,e.child,null,n),i=t.child,i.memoizedState=gp(n),i.childLanes=_p(e,r,n),t.memoizedState=mp,t=ol(null,i));else if(Xs(t),Mm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error($(419)),i.stack="",i.digest=r,wl({value:i,source:null,stack:null}),t=vp(e,t,n)}else if(Ze||so(e,t,n,!1),r=(n&e.childLanes)!==0,Ze||r){if(r=ge,r!==null&&(i=vy(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,ja(e,i),Fn(r,e,i),og;Sm(o)||ju(),t=vp(e,t,n)}else Sm(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Ee=vi(o.nextSibling),mn=t,Kt=!0,$s=null,gi=!1,e!==null&&Zy(t,e),t=cm(t,i.children),t.flags|=4096);return t}return s?(Ws(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=ps(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=ps(c,o):(o=Fa(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,ol(null,i),i=t.child,o=e.child.memoizedState,o===null?o=gp(n):(s=o.cachePool,s!==null?(l=Ye._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=Jy(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=_p(e,r,n),t.memoizedState=mp,ol(e.child,i)):(Xs(t),n=e.child,e=n.sibling,n=ps(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function cm(e,t){return t=Yu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Yu(e,t){return e=Zn(22,e,null,t),e.lanes=0,e}function vp(e,t,n){return Wa(t,e.child,null,n),e=cm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function wv(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Jp(e.return,t,n)}function yp(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function kx(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=He.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,xe(He,r),dn(e,t,i,n),i=Kt?Al:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&wv(e,n,t);else if(e.tag===19)wv(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&ku(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),yp(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&ku(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}yp(t,!0,n,null,a,i);break;case"together":yp(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function xs(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),ua|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(so(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error($(153));if(t.child!==null){for(e=t.child,n=ps(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ps(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function lg(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Vu(e)))}function rT(e,t,n){switch(t.tag){case 3:Lu(t,t.stateNode.containerInfo),ks(t,Ye,e.memoizedState.cache),ka();break;case 27:case 5:Bp(t);break;case 4:Lu(t,t.stateNode.containerInfo);break;case 10:ks(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,nm(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(Xs(t),t.flags|=128,null):(n&t.child.childLanes)!==0?Gx(e,t,n):(Xs(t),e=xs(e,t,n),e!==null?e.sibling:null);Xs(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(so(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return kx(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),xe(He,He.current),i)break;return null;case 22:return t.lanes=0,Hx(e,t,n,t.pendingProps);case 24:ks(t,Ye,e.memoizedState.cache)}return xs(e,t,n)}function Xx(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)Ze=!0;else{if(!lg(e,n)&&(t.flags&128)===0)return Ze=!1,rT(e,t,n);Ze=(e.flags&131072)!==0}else Ze=!1,Kt&&(t.flags&1048576)!==0&&Yy(t,Al,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=Pa(t.elementType),t.type=e,typeof e=="function")Vm(e)?(i=Ya(e,i),t.tag=1,t=Tv(null,t,e,i,n)):(t.tag=0,t=lm(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===Am){t.tag=11,t=xv(null,t,e,i,n);break t}else if(s===wm){t.tag=14,t=Sv(null,t,e,i,n);break t}}throw t=Ip(e)||e,Error($(306,t,""))}}return t;case 0:return lm(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=Ya(i,t.pendingProps),Tv(e,t,i,s,n);case 3:t:{if(Lu(t,t.stateNode.containerInfo),e===null)throw Error($(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,$p(e,t),ml(t,i,null,n);var r=t.memoizedState;if(i=r.cache,ks(t,Ye,i),i!==a.cache&&jp(t,[Ye],n,!0),pl(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Av(e,t,i,n);break t}else if(i!==s){s=mi(Error($(424)),t),wl(s),t=Av(e,t,i,n);break t}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Ee=vi(e.firstChild),mn=t,Kt=!0,$s=null,gi=!0,n=$y(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(ka(),i===s){t=xs(e,t,n);break t}dn(e,t,i,n)}t=t.child}return t;case 26:return Au(e,t),e===null?(n=Kv(t.type,null,t.pendingProps,null))?t.memoizedState=n:Kt||(n=t.type,e=t.pendingProps,i=eh(Qs.current).createElement(n),i[pn]=t,i[Vn]=e,_n(i,n,e),rn(i),t.stateNode=i):t.memoizedState=Kv(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Bp(t),e===null&&Kt&&(i=t.stateNode=OS(t.type,t.pendingProps,Qs.current),mn=t,gi=!0,s=Ee,fa(t.type)?(bm=s,Ee=vi(i.firstChild)):Ee=s),dn(e,t,t.pendingProps.children,n),Au(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&Kt&&((s=i=Ee)&&(i=OT(i,t.type,t.pendingProps,gi),i!==null?(t.stateNode=i,mn=t,Ee=vi(i.firstChild),gi=!1,s=!0):s=!1),s||la(t)),Bp(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,ym(s,a)?i=null:r!==null&&ym(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=Km(e,t,jE,null,null,n),Ll._currentValue=s),Au(e,t),dn(e,t,i,n),t.child;case 6:return e===null&&Kt&&((e=n=Ee)&&(n=IT(n,t.pendingProps,gi),n!==null?(t.stateNode=n,mn=t,Ee=null,e=!0):e=!1),e||la(t)),null;case 13:return Gx(e,t,n);case 4:return Lu(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=Wa(t,null,i,n):dn(e,t,i,n),t.child;case 11:return xv(e,t,t.type,t.pendingProps,n);case 7:return dn(e,t,t.pendingProps,n),t.child;case 8:return dn(e,t,t.pendingProps.children,n),t.child;case 12:return dn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,ks(t,t.type,i.value),dn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,Xa(t),s=gn(s),i=i(s),t.flags|=1,dn(e,t,i,n),t.child;case 14:return Sv(e,t,t.type,t.pendingProps,n);case 15:return Vx(e,t,t.type,t.pendingProps,n);case 19:return kx(e,t,n);case 31:return aT(e,t,n);case 22:return Hx(e,t,n,t.pendingProps);case 24:return Xa(t),i=gn(Ye),e===null?(s=Xm(),s===null&&(s=ge,a=km(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},qm(t),ks(t,Ye,s)):((e.lanes&n)!==0&&($p(e,t),ml(t,null,null,n),pl()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),ks(t,Ye,i)):(i=a.cache,ks(t,Ye,i),i!==s.cache&&jp(t,[Ye],n,!0))),dn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error($(156,t.tag))}function as(e){e.flags|=4}function xp(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(pS())e.flags|=8192;else throw Ha=Hu,Wm}else e.flags&=-16777217}function Cv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!BS(t))if(pS())e.flags|=8192;else throw Ha=Hu,Wm}function uu(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?my():536870912,e.lanes|=t,jr|=t)}function tl(e,t){if(!Kt)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function be(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function oT(e,t,n){var i=t.pendingProps;switch(Gm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return be(t),null;case 1:return be(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),ms(Ye),Wr(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Mr(t)?as(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,hp())),be(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(as(t),a!==null?(be(t),Cv(t,a)):(be(t),xp(t,s,null,i,n))):a?a!==e.memoizedState?(as(t),be(t),Cv(t,a)):(be(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&as(t),be(t),xp(t,s,e,i,n)),null;case 27:if(Ou(t),n=Qs.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(!i){if(t.stateNode===null)throw Error($(166));return be(t),null}e=Xi.current,Mr(t)?iv(t,e):(e=OS(s,i,n),t.stateNode=e,as(t))}return be(t),null;case 5:if(Ou(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(!i){if(t.stateNode===null)throw Error($(166));return be(t),null}if(a=Xi.current,Mr(t))iv(t,a);else{var r=eh(Qs.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[pn]=t,a[Vn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(_n(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&as(t)}}return be(t),xp(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&as(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error($(166));if(e=Qs.current,Mr(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=mn,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[pn]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||DS(e.nodeValue,n)),e||la(t,!0)}else e=eh(e).createTextNode(i),e[pn]=t,t.stateNode=e}return be(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Mr(t),n!==null){if(e===null){if(!i)throw Error($(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(557));e[pn]=t}else ka(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;be(t),e=!1}else n=hp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(Yn(t),t):(Yn(t),null);if((t.flags&128)!==0)throw Error($(558))}return be(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Mr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error($(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error($(317));s[pn]=t}else ka(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;be(t),s=!1}else s=hp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(Yn(t),t):(Yn(t),null)}return Yn(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),uu(t,t.updateQueue),be(t),null);case 4:return Wr(),e===null&&mg(t.stateNode.containerInfo),be(t),null;case 10:return ms(t.type),be(t),null;case 19:if(on(He),i=t.memoizedState,i===null)return be(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)tl(i,!1);else{if(Be!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=ku(e),a!==null){for(t.flags|=128,tl(i,!1),e=a.updateQueue,t.updateQueue=e,uu(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)Wy(n,e),n=n.sibling;return xe(He,He.current&1|2),Kt&&cs(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&Jn()>Ku&&(t.flags|=128,s=!0,tl(i,!1),t.lanes=4194304)}else{if(!s)if(e=ku(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,uu(t,e),tl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!Kt)return be(t),null}else 2*Jn()-i.renderingStartTime>Ku&&n!==536870912&&(t.flags|=128,s=!0,tl(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=Jn(),e.sibling=null,n=He.current,xe(He,s?n&1|2:n&1),Kt&&cs(t,i.treeForkCount),e):(be(t),null);case 22:case 23:return Yn(t),Ym(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(be(t),t.subtreeFlags&6&&(t.flags|=8192)):be(t),n=t.updateQueue,n!==null&&uu(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&on(Va),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ms(Ye),be(t),null;case 25:return null;case 30:return null}throw Error($(156,t.tag))}function lT(e,t){switch(Gm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ms(Ye),Wr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ou(t),null;case 31:if(t.memoizedState!==null){if(Yn(t),t.alternate===null)throw Error($(340));ka()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Yn(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error($(340));ka()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return on(He),null;case 4:return Wr(),null;case 10:return ms(t.type),null;case 22:case 23:return Yn(t),Ym(),e!==null&&on(Va),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ms(Ye),null;case 25:return null;default:return null}}function Wx(e,t){switch(Gm(t),t.tag){case 3:ms(Ye),Wr();break;case 26:case 27:case 5:Ou(t);break;case 4:Wr();break;case 31:t.memoizedState!==null&&Yn(t);break;case 13:Yn(t);break;case 19:on(He);break;case 10:ms(t.type);break;case 22:case 23:Yn(t),Ym(),e!==null&&on(Va);break;case 24:ms(Ye)}}function Xl(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){re(t,t.return,o)}}function ca(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(f){re(s,l,f)}}}i=i.next}while(i!==a)}}catch(f){re(t,t.return,f)}}function qx(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{ex(t,n)}catch(i){re(e,e.return,i)}}}function Yx(e,t,n){n.props=Ya(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){re(e,t,i)}}function _l(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){re(e,t,s)}}function ki(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){re(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){re(e,t,s)}else n.current=null}function Zx(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){re(e,e.return,s)}}function Sp(e,t,n){try{var i=e.stateNode;CT(i,e.type,n,t),i[Vn]=t}catch(s){re(e,e.return,s)}}function Kx(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&fa(e.type)||e.tag===4}function Mp(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Kx(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&fa(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function um(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=fs));else if(i!==4&&(i===27&&fa(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(um(e,t,n),e=e.sibling;e!==null;)um(e,t,n),e=e.sibling}function Zu(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&fa(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Zu(e,t,n),e=e.sibling;e!==null;)Zu(e,t,n),e=e.sibling}function Jx(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);_n(t,i,n),t[pn]=e,t[Vn]=n}catch(a){re(e,e.return,a)}}var us=!1,qe=!1,bp=!1,Rv=typeof WeakSet=="function"?WeakSet:Set,an=null;function cT(e,t){if(e=e.containerInfo,_m=ah,e=By(e),Bm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,f=0,p=e,u=null;e:for(;;){for(var d;p!==n||s!==0&&p.nodeType!==3||(o=r+s),p!==a||i!==0&&p.nodeType!==3||(l=r+i),p.nodeType===3&&(r+=p.nodeValue.length),(d=p.firstChild)!==null;)u=p,p=d;for(;;){if(p===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++f===i&&(l=r),(d=p.nextSibling)!==null)break;p=u,u=p.parentNode}p=d}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(vm={focusedElem:e,selectionRange:n},ah=!1,an=t;an!==null;)if(t=an,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,an=e;else for(;an!==null;){switch(t=an,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var g=Ya(n.type,s);e=i.getSnapshotBeforeUpdate(g,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(M){re(n,n.return,M)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)xm(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":xm(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error($(163))}if(e=t.sibling,e!==null){e.return=t.return,an=e;break}an=t.return}}function jx(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:os(e,n),i&4&&Xl(5,n);break;case 1:if(os(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){re(n,n.return,r)}else{var s=Ya(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){re(n,n.return,r)}}i&64&&qx(n),i&512&&_l(n,n.return);break;case 3:if(os(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{ex(e,t)}catch(r){re(n,n.return,r)}}break;case 27:t===null&&i&4&&Jx(n);case 26:case 5:os(e,n),t===null&&i&4&&Zx(n),i&512&&_l(n,n.return);break;case 12:os(e,n);break;case 31:os(e,n),i&4&&tS(e,n);break;case 13:os(e,n),i&4&&eS(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=vT.bind(null,n),PT(e,n))));break;case 22:if(i=n.memoizedState!==null||us,!i){t=t!==null&&t.memoizedState!==null||qe,s=us;var a=qe;us=i,(qe=t)&&!a?ls(e,n,(n.subtreeFlags&8772)!==0):os(e,n),us=s,qe=a}break;case 30:break;default:os(e,n)}}function Qx(e){var t=e.alternate;t!==null&&(e.alternate=null,Qx(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Nm(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ne=null,Bn=!1;function rs(e,t,n){for(n=n.child;n!==null;)$x(e,t,n),n=n.sibling}function $x(e,t,n){if(jn&&typeof jn.onCommitFiberUnmount=="function")try{jn.onCommitFiberUnmount(Bl,n)}catch{}switch(n.tag){case 26:qe||ki(n,t),rs(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:qe||ki(n,t);var i=Ne,s=Bn;fa(n.type)&&(Ne=n.stateNode,Bn=!1),rs(e,t,n),Sl(n.stateNode),Ne=i,Bn=s;break;case 5:qe||ki(n,t);case 6:if(i=Ne,s=Bn,Ne=null,rs(e,t,n),Ne=i,Bn=s,Ne!==null)if(Bn)try{(Ne.nodeType===9?Ne.body:Ne.nodeName==="HTML"?Ne.ownerDocument.body:Ne).removeChild(n.stateNode)}catch(a){re(n,t,a)}else try{Ne.removeChild(n.stateNode)}catch(a){re(n,t,a)}break;case 18:Ne!==null&&(Bn?(e=Ne,Xv(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),eo(e)):Xv(Ne,n.stateNode));break;case 4:i=Ne,s=Bn,Ne=n.stateNode.containerInfo,Bn=!0,rs(e,t,n),Ne=i,Bn=s;break;case 0:case 11:case 14:case 15:ca(2,n,t),qe||ca(4,n,t),rs(e,t,n);break;case 1:qe||(ki(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&Yx(n,t,i)),rs(e,t,n);break;case 21:rs(e,t,n);break;case 22:qe=(i=qe)||n.memoizedState!==null,rs(e,t,n),qe=i;break;default:rs(e,t,n)}}function tS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{eo(e)}catch(n){re(t,t.return,n)}}}function eS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{eo(e)}catch(n){re(t,t.return,n)}}function uT(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Rv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Rv),t;default:throw Error($(435,e.tag))}}function hu(e,t){var n=uT(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=yT.bind(null,e,i);i.then(s,s)}})}function In(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(fa(o.type)){Ne=o.stateNode,Bn=!1;break t}break;case 5:Ne=o.stateNode,Bn=!1;break t;case 3:case 4:Ne=o.stateNode.containerInfo,Bn=!0;break t}o=o.return}if(Ne===null)throw Error($(160));$x(a,r,s),Ne=null,Bn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)nS(t,e),t=t.sibling}var Ei=null;function nS(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:In(t,e),Pn(e),i&4&&(ca(3,e,e.return),Xl(3,e),ca(5,e,e.return));break;case 1:In(t,e),Pn(e),i&512&&(qe||n===null||ki(n,n.return)),i&64&&us&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Ei;if(In(t,e),Pn(e),i&512&&(qe||n===null||ki(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[Vl]||a[pn]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),_n(a,i,n),a[pn]=e,rn(a),i=a;break t;case"link":var r=jv("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),_n(a,i,n),s.head.appendChild(a);break;case"meta":if(r=jv("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),_n(a,i,n),s.head.appendChild(a);break;default:throw Error($(468,i))}a[pn]=e,rn(a),i=a}e.stateNode=i}else Qv(s,e.type,e.stateNode);else e.stateNode=Jv(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?Qv(s,e.type,e.stateNode):Jv(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&Sp(e,e.memoizedProps,n.memoizedProps)}break;case 27:In(t,e),Pn(e),i&512&&(qe||n===null||ki(n,n.return)),n!==null&&i&4&&Sp(e,e.memoizedProps,n.memoizedProps);break;case 5:if(In(t,e),Pn(e),i&512&&(qe||n===null||ki(n,n.return)),e.flags&32){s=e.stateNode;try{Yr(s,"")}catch(g){re(e,e.return,g)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,Sp(e,s,n!==null?n.memoizedProps:s)),i&1024&&(bp=!0);break;case 6:if(In(t,e),Pn(e),i&4){if(e.stateNode===null)throw Error($(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(g){re(e,e.return,g)}}break;case 3:if(Ru=null,s=Ei,Ei=nh(t.containerInfo),In(t,e),Ei=s,Pn(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{eo(t.containerInfo)}catch(g){re(e,e.return,g)}bp&&(bp=!1,iS(e));break;case 4:i=Ei,Ei=nh(e.stateNode.containerInfo),In(t,e),Pn(e),Ei=i;break;case 12:In(t,e),Pn(e);break;case 31:In(t,e),Pn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,hu(e,i)));break;case 13:In(t,e),Pn(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(vh=Jn()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,hu(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=us,f=qe;if(us=c||s,qe=f||l,In(t,e),qe=f,us=c,Pn(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||us||qe||Ba(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var p=l.memoizedProps.style,u=p!=null&&p.hasOwnProperty("display")?p.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(g){re(l,l.return,g)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(g){re(l,l.return,g)}}}else if(t.tag===18){if(n===null){l=t;try{var d=l.stateNode;s?Wv(d,!0):Wv(l.stateNode,!1)}catch(g){re(l,l.return,g)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,hu(e,n))));break;case 19:In(t,e),Pn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,hu(e,i)));break;case 30:break;case 21:break;default:In(t,e),Pn(e)}}function Pn(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Kx(i)){n=i;break}i=i.return}if(n==null)throw Error($(160));switch(n.tag){case 27:var s=n.stateNode,a=Mp(e);Zu(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&(Yr(r,""),n.flags&=-33);var o=Mp(e);Zu(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=Mp(e);um(e,c,l);break;default:throw Error($(161))}}catch(f){re(e,e.return,f)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function iS(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;iS(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function os(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)jx(e,t.alternate,t),t=t.sibling}function Ba(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:ca(4,t,t.return),Ba(t);break;case 1:ki(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&Yx(t,t.return,n),Ba(t);break;case 27:Sl(t.stateNode);case 26:case 5:ki(t,t.return),Ba(t);break;case 22:t.memoizedState===null&&Ba(t);break;case 30:Ba(t);break;default:Ba(t)}e=e.sibling}}function ls(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:ls(s,a,n),Xl(4,a);break;case 1:if(ls(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){re(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)tx(l[s],o)}catch(c){re(i,i.return,c)}}n&&r&64&&qx(a),_l(a,a.return);break;case 27:Jx(a);case 26:case 5:ls(s,a,n),n&&i===null&&r&4&&Zx(a),_l(a,a.return);break;case 12:ls(s,a,n);break;case 31:ls(s,a,n),n&&r&4&&tS(s,a);break;case 13:ls(s,a,n),n&&r&4&&eS(s,a);break;case 22:a.memoizedState===null&&ls(s,a,n),_l(a,a.return);break;case 30:break;default:ls(s,a,n)}t=t.sibling}}function cg(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Gl(n))}function ug(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gl(e))}function bi(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)sS(e,t,n,i),t=t.sibling}function sS(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:bi(e,t,n,i),s&2048&&Xl(9,t);break;case 1:bi(e,t,n,i);break;case 3:bi(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Gl(e)));break;case 12:if(s&2048){bi(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){re(t,t.return,l)}}else bi(e,t,n,i);break;case 31:bi(e,t,n,i);break;case 13:bi(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?bi(e,t,n,i):vl(e,t):a._visibility&2?bi(e,t,n,i):(a._visibility|=2,Er(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&cg(r,t);break;case 24:bi(e,t,n,i),s&2048&&ug(t.alternate,t);break;default:bi(e,t,n,i)}}function Er(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:Er(a,r,o,l,s),Xl(8,r);break;case 23:break;case 22:var f=r.stateNode;r.memoizedState!==null?f._visibility&2?Er(a,r,o,l,s):vl(a,r):(f._visibility|=2,Er(a,r,o,l,s)),s&&c&2048&&cg(r.alternate,r);break;case 24:Er(a,r,o,l,s),s&&c&2048&&ug(r.alternate,r);break;default:Er(a,r,o,l,s)}t=t.sibling}}function vl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:vl(n,i),s&2048&&cg(i.alternate,i);break;case 24:vl(n,i),s&2048&&ug(i.alternate,i);break;default:vl(n,i)}t=t.sibling}}var ll=8192;function br(e,t,n){if(e.subtreeFlags&ll)for(e=e.child;e!==null;)aS(e,t,n),e=e.sibling}function aS(e,t,n){switch(e.tag){case 26:br(e,t,n),e.flags&ll&&e.memoizedState!==null&&ZT(n,Ei,e.memoizedState,e.memoizedProps);break;case 5:br(e,t,n);break;case 3:case 4:var i=Ei;Ei=nh(e.stateNode.containerInfo),br(e,t,n),Ei=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=ll,ll=16777216,br(e,t,n),ll=i):br(e,t,n));break;default:br(e,t,n)}}function rS(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function el(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];an=i,lS(i,e)}rS(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)oS(e),e=e.sibling}function oS(e){switch(e.tag){case 0:case 11:case 15:el(e),e.flags&2048&&ca(9,e,e.return);break;case 3:el(e);break;case 12:el(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,wu(e)):el(e);break;default:el(e)}}function wu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];an=i,lS(i,e)}rS(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:ca(8,t,t.return),wu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,wu(t));break;default:wu(t)}e=e.sibling}}function lS(e,t){for(;an!==null;){var n=an;switch(n.tag){case 0:case 11:case 15:ca(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Gl(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,an=i;else t:for(n=e;an!==null;){i=an;var s=i.sibling,a=i.return;if(Qx(i),i===n){an=null;break t}if(s!==null){s.return=a,an=s;break t}an=a}}}var hT={getCacheForType:function(e){var t=gn(Ye),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return gn(Ye).controller.signal}},fT=typeof WeakMap=="function"?WeakMap:Map,ee=0,ge=null,Wt=null,Yt=0,ae=0,qn=null,Ks=!1,ro=!1,hg=!1,Ss=0,Be=0,ua=0,Ga=0,fg=0,Kn=0,jr=0,yl=null,zn=null,hm=!1,vh=0,cS=0,Ku=1/0,Ju=null,na=null,Qe=0,ia=null,Qr=null,gs=0,fm=0,dm=null,uS=null,xl=0,pm=null;function $n(){return(ee&2)!==0&&Yt!==0?Yt&-Yt:Ut.T!==null?pg():yy()}function hS(){if(Kn===0)if((Yt&536870912)===0||Kt){var e=eu;eu<<=1,(eu&3932160)===0&&(eu=262144),Kn=e}else Kn=536870912;return e=ei.current,e!==null&&(e.flags|=32),Kn}function Fn(e,t,n){(e===ge&&(ae===2||ae===9)||e.cancelPendingCommit!==null)&&($r(e,0),Js(e,Yt,Kn,!1)),Fl(e,n),((ee&2)===0||e!==ge)&&(e===ge&&((ee&2)===0&&(Ga|=n),Be===4&&Js(e,Yt,Kn,!1)),qi(e))}function fS(e,t,n){if((ee&6)!==0)throw Error($(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||zl(e,t),s=i?mT(e,t):Ep(e,t,!0),a=i;do{if(s===0){ro&&!i&&Js(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!dT(n)){s=Ep(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=yl;var l=o.current.memoizedState.isDehydrated;if(l&&($r(o,r).flags|=256),r=Ep(o,r,!1),r!==2){if(hg&&!l){o.errorRecoveryDisabledLanes|=a,Ga|=a,s=4;break t}a=zn,zn=s,a!==null&&(zn===null?zn=a:zn.push.apply(zn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){$r(e,0),Js(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error($(345));case 4:if((t&4194048)!==t)break;case 6:Js(i,t,Kn,!Ks);break t;case 2:zn=null;break;case 3:case 5:break;default:throw Error($(329))}if((t&62914560)===t&&(s=vh+300-Jn(),10<s)){if(Js(i,t,Kn,!Ks),oh(i,0,!0)!==0)break t;gs=t,i.timeoutHandle=US(Dv.bind(null,i,n,zn,Ju,hm,t,Kn,Ga,jr,Ks,a,"Throttled",-0,0),s);break t}Dv(i,n,zn,Ju,hm,t,Kn,Ga,jr,Ks,a,null,-0,0)}}break}while(!0);qi(e)}function Dv(e,t,n,i,s,a,r,o,l,c,f,p,u,d){if(e.timeoutHandle=-1,p=t.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:fs},aS(t,a,p);var g=(a&62914560)===a?vh-Jn():(a&4194048)===a?cS-Jn():0;if(g=KT(p,g),g!==null){gs=a,e.cancelPendingCommit=g(Uv.bind(null,e,t,a,n,i,s,r,o,l,f,p,null,u,d)),Js(e,a,r,!c);return}}Uv(e,t,a,n,i,s,r,o,l)}function dT(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!ti(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Js(e,t,n,i){t&=~fg,t&=~Ga,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-Qn(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&gy(e,n,t)}function yh(){return(ee&6)===0?(Wl(0,!1),!1):!0}function dg(){if(Wt!==null){if(ae===0)var e=Wt.return;else e=Wt,ds=Qa=null,Qm(e),Gr=null,Cl=0,e=Wt;for(;e!==null;)Wx(e.alternate,e),e=e.return;Wt=null}}function $r(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,NT(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),gs=0,dg(),ge=e,Wt=n=ps(e.current,null),Yt=t,ae=0,qn=null,Ks=!1,ro=zl(e,t),hg=!1,jr=Kn=fg=Ga=ua=Be=0,zn=yl=null,hm=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-Qn(i),a=1<<s;t|=e[s],i&=~a}return Ss=t,hh(),n}function dS(e,t){Vt=null,Ut.H=Dl,t===ao||t===dh?(t=lv(),ae=3):t===Wm?(t=lv(),ae=4):ae=t===og?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,qn=t,Wt===null&&(Be=1,qu(e,mi(t,e.current)))}function pS(){var e=ei.current;return e===null?!0:(Yt&4194048)===Yt?_i===null:(Yt&62914560)===Yt||(Yt&536870912)!==0?e===_i:!1}function mS(){var e=Ut.H;return Ut.H=Dl,e===null?Dl:e}function gS(){var e=Ut.A;return Ut.A=hT,e}function ju(){Be=4,Ks||(Yt&4194048)!==Yt&&ei.current!==null||(ro=!0),(ua&134217727)===0&&(Ga&134217727)===0||ge===null||Js(ge,Yt,Kn,!1)}function Ep(e,t,n){var i=ee;ee|=2;var s=mS(),a=gS();(ge!==e||Yt!==t)&&(Ju=null,$r(e,t)),t=!1;var r=Be;t:do try{if(ae!==0&&Wt!==null){var o=Wt,l=qn;switch(ae){case 8:dg(),r=6;break t;case 3:case 2:case 9:case 6:ei.current===null&&(t=!0);var c=ae;if(ae=0,qn=null,Br(e,o,l,c),n&&ro){r=0;break t}break;default:c=ae,ae=0,qn=null,Br(e,o,l,c)}}pT(),r=Be;break}catch(f){dS(e,f)}while(!0);return t&&e.shellSuspendCounter++,ds=Qa=null,ee=i,Ut.H=s,Ut.A=a,Wt===null&&(ge=null,Yt=0,hh()),r}function pT(){for(;Wt!==null;)_S(Wt)}function mT(e,t){var n=ee;ee|=2;var i=mS(),s=gS();ge!==e||Yt!==t?(Ju=null,Ku=Jn()+500,$r(e,t)):ro=zl(e,t);t:do try{if(ae!==0&&Wt!==null){t=Wt;var a=qn;e:switch(ae){case 1:ae=0,qn=null,Br(e,t,a,1);break;case 2:case 9:if(ov(a)){ae=0,qn=null,Nv(t);break}t=function(){ae!==2&&ae!==9||ge!==e||(ae=7),qi(e)},a.then(t,t);break t;case 3:ae=7;break t;case 4:ae=5;break t;case 7:ov(a)?(ae=0,qn=null,Nv(t)):(ae=0,qn=null,Br(e,t,a,7));break;case 5:var r=null;switch(Wt.tag){case 26:r=Wt.memoizedState;case 5:case 27:var o=Wt;if(r?BS(r):o.stateNode.complete){ae=0,qn=null;var l=o.sibling;if(l!==null)Wt=l;else{var c=o.return;c!==null?(Wt=c,xh(c)):Wt=null}break e}}ae=0,qn=null,Br(e,t,a,5);break;case 6:ae=0,qn=null,Br(e,t,a,6);break;case 8:dg(),Be=6;break t;default:throw Error($(462))}}gT();break}catch(f){dS(e,f)}while(!0);return ds=Qa=null,Ut.H=i,Ut.A=s,ee=n,Wt!==null?0:(ge=null,Yt=0,hh(),Be)}function gT(){for(;Wt!==null&&!F1();)_S(Wt)}function _S(e){var t=Xx(e.alternate,e,Ss);e.memoizedProps=e.pendingProps,t===null?xh(e):Wt=t}function Nv(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Ev(n,t,t.pendingProps,t.type,void 0,Yt);break;case 11:t=Ev(n,t,t.pendingProps,t.type.render,t.ref,Yt);break;case 5:Qm(t);default:Wx(n,t),t=Wt=Wy(t,Ss),t=Xx(n,t,Ss)}e.memoizedProps=e.pendingProps,t===null?xh(e):Wt=t}function Br(e,t,n,i){ds=Qa=null,Qm(t),Gr=null,Cl=0;var s=t.return;try{if(sT(e,s,t,n,Yt)){Be=1,qu(e,mi(n,e.current)),Wt=null;return}}catch(a){if(s!==null)throw Wt=s,a;Be=1,qu(e,mi(n,e.current)),Wt=null;return}t.flags&32768?(Kt||i===1?e=!0:ro||(Yt&536870912)!==0?e=!1:(Ks=e=!0,(i===2||i===9||i===3||i===6)&&(i=ei.current,i!==null&&i.tag===13&&(i.flags|=16384))),vS(t,e)):xh(t)}function xh(e){var t=e;do{if((t.flags&32768)!==0){vS(t,Ks);return}e=t.return;var n=oT(t.alternate,t,Ss);if(n!==null){Wt=n;return}if(t=t.sibling,t!==null){Wt=t;return}Wt=t=e}while(t!==null);Be===0&&(Be=5)}function vS(e,t){do{var n=lT(e.alternate,e);if(n!==null){n.flags&=32767,Wt=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Wt=e;return}Wt=e=n}while(e!==null);Be=6,Wt=null}function Uv(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do Sh();while(Qe!==0);if((ee&6)!==0)throw Error($(327));if(t!==null){if(t===e.current)throw Error($(177));if(a=t.lanes|t.childLanes,a|=zm,K1(e,n,a,r,o,l),e===ge&&(Wt=ge=null,Yt=0),Qr=t,ia=e,gs=n,fm=a,dm=s,uS=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,xT(Iu,function(){return bS(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=Ut.T,Ut.T=null,s=ne.p,ne.p=2,r=ee,ee|=4;try{cT(e,t,n)}finally{ee=r,ne.p=s,Ut.T=i}}Qe=1,yS(),xS(),SS()}}function yS(){if(Qe===1){Qe=0;var e=ia,t=Qr,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=Ut.T,Ut.T=null;var i=ne.p;ne.p=2;var s=ee;ee|=4;try{nS(t,e);var a=vm,r=By(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&Py(o.ownerDocument.documentElement,o)){if(l!==null&&Bm(o)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(f,o.value.length);else{var p=o.ownerDocument||document,u=p&&p.defaultView||window;if(u.getSelection){var d=u.getSelection(),g=o.textContent.length,M=Math.min(l.start,g),m=l.end===void 0?M:Math.min(l.end,g);!d.extend&&M>m&&(r=m,m=M,M=r);var h=tv(o,M),_=tv(o,m);if(h&&_&&(d.rangeCount!==1||d.anchorNode!==h.node||d.anchorOffset!==h.offset||d.focusNode!==_.node||d.focusOffset!==_.offset)){var S=p.createRange();S.setStart(h.node,h.offset),d.removeAllRanges(),M>m?(d.addRange(S),d.extend(_.node,_.offset)):(S.setEnd(_.node,_.offset),d.addRange(S))}}}}for(p=[],d=o;d=d.parentNode;)d.nodeType===1&&p.push({element:d,left:d.scrollLeft,top:d.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<p.length;o++){var y=p[o];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}ah=!!_m,vm=_m=null}finally{ee=s,ne.p=i,Ut.T=n}}e.current=t,Qe=2}}function xS(){if(Qe===2){Qe=0;var e=ia,t=Qr,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=Ut.T,Ut.T=null;var i=ne.p;ne.p=2;var s=ee;ee|=4;try{jx(e,t.alternate,t)}finally{ee=s,ne.p=i,Ut.T=n}}Qe=3}}function SS(){if(Qe===4||Qe===3){Qe=0,V1();var e=ia,t=Qr,n=gs,i=uS;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?Qe=5:(Qe=0,Qr=ia=null,MS(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(na=null),Dm(n),t=t.stateNode,jn&&typeof jn.onCommitFiberRoot=="function")try{jn.onCommitFiberRoot(Bl,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=Ut.T,s=ne.p,ne.p=2,Ut.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{Ut.T=t,ne.p=s}}(gs&3)!==0&&Sh(),qi(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===pm?xl++:(xl=0,pm=e):xl=0,Wl(0,!1)}}function MS(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Gl(t)))}function Sh(){return yS(),xS(),SS(),bS()}function bS(){if(Qe!==5)return!1;var e=ia,t=fm;fm=0;var n=Dm(gs),i=Ut.T,s=ne.p;try{ne.p=32>n?32:n,Ut.T=null,n=dm,dm=null;var a=ia,r=gs;if(Qe=0,Qr=ia=null,gs=0,(ee&6)!==0)throw Error($(331));var o=ee;if(ee|=4,oS(a.current),sS(a,a.current,r,n),ee=o,Wl(0,!1),jn&&typeof jn.onPostCommitFiberRoot=="function")try{jn.onPostCommitFiberRoot(Bl,a)}catch{}return!0}finally{ne.p=s,Ut.T=i,MS(e,t)}}function Lv(e,t,n){t=mi(n,t),t=om(e.stateNode,t,2),e=ea(e,t,2),e!==null&&(Fl(e,2),qi(e))}function re(e,t,n){if(e.tag===3)Lv(e,e,n);else for(;t!==null;){if(t.tag===3){Lv(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(na===null||!na.has(i))){e=mi(n,e),n=zx(2),i=ea(t,n,2),i!==null&&(Fx(n,i,t,e),Fl(i,2),qi(i));break}}t=t.return}}function Tp(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new fT;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(hg=!0,s.add(n),e=_T.bind(null,e,t,n),t.then(e,e))}function _T(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,ge===e&&(Yt&n)===n&&(Be===4||Be===3&&(Yt&62914560)===Yt&&300>Jn()-vh?(ee&2)===0&&$r(e,0):fg|=n,jr===Yt&&(jr=0)),qi(e)}function ES(e,t){t===0&&(t=my()),e=ja(e,t),e!==null&&(Fl(e,t),qi(e))}function vT(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),ES(e,n)}function yT(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error($(314))}i!==null&&i.delete(t),ES(e,n)}function xT(e,t){return Cm(e,t)}var Qu=null,Tr=null,mm=!1,$u=!1,Ap=!1,js=0;function qi(e){e!==Tr&&e.next===null&&(Tr===null?Qu=Tr=e:Tr=Tr.next=e),$u=!0,mm||(mm=!0,MT())}function Wl(e,t){if(!Ap&&$u){Ap=!0;do for(var n=!1,i=Qu;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-Qn(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Ov(i,a))}else a=Yt,a=oh(i,i===ge?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||zl(i,a)||(n=!0,Ov(i,a));i=i.next}while(n);Ap=!1}}function ST(){TS()}function TS(){$u=mm=!1;var e=0;js!==0&&DT()&&(e=js);for(var t=Jn(),n=null,i=Qu;i!==null;){var s=i.next,a=AS(i,t);a===0?(i.next=null,n===null?Qu=s:n.next=s,s===null&&(Tr=n)):(n=i,(e!==0||(a&3)!==0)&&($u=!0)),i=s}Qe!==0&&Qe!==5||Wl(e,!1),js!==0&&(js=0)}function AS(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-Qn(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=Z1(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=ge,n=Yt,n=oh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(ae===2||ae===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&ep(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||zl(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&ep(i),Dm(n)){case 2:case 8:n=dy;break;case 32:n=Iu;break;case 268435456:n=py;break;default:n=Iu}return i=wS.bind(null,e),n=Cm(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&ep(i),e.callbackPriority=2,e.callbackNode=null,2}function wS(e,t){if(Qe!==0&&Qe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Sh()&&e.callbackNode!==n)return null;var i=Yt;return i=oh(e,e===ge?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(fS(e,i,t),AS(e,Jn()),e.callbackNode!=null&&e.callbackNode===n?wS.bind(null,e):null)}function Ov(e,t){if(Sh())return null;fS(e,t,!0)}function MT(){UT(function(){(ee&6)!==0?Cm(fy,ST):TS()})}function pg(){if(js===0){var e=Zr;e===0&&(e=tu,tu<<=1,(tu&261888)===0&&(tu=256)),js=e}return js}function Iv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:vu(""+e)}function Pv(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function bT(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=Iv((s[Vn]||null).action),r=i.submitter;r&&(t=(t=r[Vn]||null)?Iv(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new lh("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(js!==0){var l=r?Pv(s,r):new FormData(s);am(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?Pv(s,r):new FormData(s),am(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(fu=0;fu<Yp.length;fu++)du=Yp[fu],Bv=du.toLowerCase(),zv=du[0].toUpperCase()+du.slice(1),Ti(Bv,"on"+zv);var du,Bv,zv,fu;Ti(Fy,"onAnimationEnd");Ti(Vy,"onAnimationIteration");Ti(Hy,"onAnimationStart");Ti("dblclick","onDoubleClick");Ti("focusin","onFocus");Ti("focusout","onBlur");Ti(HE,"onTransitionRun");Ti(GE,"onTransitionStart");Ti(kE,"onTransitionCancel");Ti(Gy,"onTransitionEnd");qr("onMouseEnter",["mouseout","mouseover"]);qr("onMouseLeave",["mouseout","mouseover"]);qr("onPointerEnter",["pointerout","pointerover"]);qr("onPointerLeave",["pointerout","pointerover"]);Za("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Za("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Za("onBeforeInput",["compositionend","keypress","textInput","paste"]);Za("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Za("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Za("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Nl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ET=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Nl));function CS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Bu(f)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(f){Bu(f)}s.currentTarget=null,a=l}}}}function Xt(e,t){var n=t[Fp];n===void 0&&(n=t[Fp]=new Set);var i=e+"__bubble";n.has(i)||(RS(t,e,2,!1),n.add(i))}function wp(e,t,n){var i=0;t&&(i|=4),RS(n,e,i,t)}var pu="_reactListening"+Math.random().toString(36).slice(2);function mg(e){if(!e[pu]){e[pu]=!0,xy.forEach(function(n){n!=="selectionchange"&&(ET.has(n)||wp(n,!1,e),wp(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[pu]||(t[pu]=!0,wp("selectionchange",!1,t))}}function RS(e,t,n,i){switch(GS(t)){case 2:var s=QT;break;case 8:s=$T;break;default:s=yg}n=s.bind(null,t,n,e),s=void 0,!Xp||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function Cp(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Cr(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}Cy(function(){var c=a,f=Lm(n),p=[];t:{var u=ky.get(e);if(u!==void 0){var d=lh,g=e;switch(e){case"keypress":if(xu(n)===0)break t;case"keydown":case"keyup":d=yE;break;case"focusin":g="focus",d=rp;break;case"focusout":g="blur",d=rp;break;case"beforeblur":case"afterblur":d=rp;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":d=W_;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":d=oE;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":d=ME;break;case Fy:case Vy:case Hy:d=uE;break;case Gy:d=EE;break;case"scroll":case"scrollend":d=aE;break;case"wheel":d=AE;break;case"copy":case"cut":case"paste":d=fE;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":d=Y_;break;case"toggle":case"beforetoggle":d=CE}var M=(t&4)!==0,m=!M&&(e==="scroll"||e==="scrollend"),h=M?u!==null?u+"Capture":null:u;M=[];for(var _=c,S;_!==null;){var y=_;if(S=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||S===null||h===null||(y=bl(_,h),y!=null&&M.push(Ul(_,y,S))),m)break;_=_.return}0<M.length&&(u=new d(u,g,null,n,f),p.push({event:u,listeners:M}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",d=e==="mouseout"||e==="pointerout",u&&n!==kp&&(g=n.relatedTarget||n.fromElement)&&(Cr(g)||g[no]))break t;if((d||u)&&(u=f.window===f?f:(u=f.ownerDocument)?u.defaultView||u.parentWindow:window,d?(g=n.relatedTarget||n.toElement,d=c,g=g?Cr(g):null,g!==null&&(m=Pl(g),M=g.tag,g!==m||M!==5&&M!==27&&M!==6)&&(g=null)):(d=null,g=c),d!==g)){if(M=W_,y="onMouseLeave",h="onMouseEnter",_="mouse",(e==="pointerout"||e==="pointerover")&&(M=Y_,y="onPointerLeave",h="onPointerEnter",_="pointer"),m=d==null?u:rl(d),S=g==null?u:rl(g),u=new M(y,_+"leave",d,n,f),u.target=m,u.relatedTarget=S,y=null,Cr(f)===c&&(M=new M(h,_+"enter",g,n,f),M.target=S,M.relatedTarget=m,y=M),m=y,d&&g)e:{for(M=TT,h=d,_=g,S=0,y=h;y;y=M(y))S++;y=0;for(var E=_;E;E=M(E))y++;for(;0<S-y;)h=M(h),S--;for(;0<y-S;)_=M(_),y--;for(;S--;){if(h===_||_!==null&&h===_.alternate){M=h;break e}h=M(h),_=M(_)}M=null}else M=null;d!==null&&Fv(p,u,d,M,!1),g!==null&&m!==null&&Fv(p,m,g,M,!0)}}t:{if(u=c?rl(c):window,d=u.nodeName&&u.nodeName.toLowerCase(),d==="select"||d==="input"&&u.type==="file")var A=j_;else if(J_(u))if(Oy)A=zE;else{A=PE;var w=IE}else d=u.nodeName,!d||d.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&Um(c.elementType)&&(A=j_):A=BE;if(A&&(A=A(e,c))){Ly(p,A,n,f);break t}w&&w(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Gp(u,"number",u.value)}switch(w=c?rl(c):window,e){case"focusin":(J_(w)||w.contentEditable==="true")&&(Nr=w,Wp=c,hl=null);break;case"focusout":hl=Wp=Nr=null;break;case"mousedown":qp=!0;break;case"contextmenu":case"mouseup":case"dragend":qp=!1,ev(p,n,f);break;case"selectionchange":if(VE)break;case"keydown":case"keyup":ev(p,n,f)}var v;if(Pm)t:{switch(e){case"compositionstart":var T="onCompositionStart";break t;case"compositionend":T="onCompositionEnd";break t;case"compositionupdate":T="onCompositionUpdate";break t}T=void 0}else Dr?Ny(e,n)&&(T="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(T="onCompositionStart");T&&(Dy&&n.locale!=="ko"&&(Dr||T!=="onCompositionStart"?T==="onCompositionEnd"&&Dr&&(v=Ry()):(Zs=f,Om="value"in Zs?Zs.value:Zs.textContent,Dr=!0)),w=th(c,T),0<w.length&&(T=new q_(T,e,null,n,f),p.push({event:T,listeners:w}),v?T.data=v:(v=Uy(n),v!==null&&(T.data=v)))),(v=DE?NE(e,n):UE(e,n))&&(T=th(c,"onBeforeInput"),0<T.length&&(w=new q_("onBeforeInput","beforeinput",null,n,f),p.push({event:w,listeners:T}),w.data=v)),bT(p,e,c,n,f)}CS(p,t)})}function Ul(e,t,n){return{instance:e,listener:t,currentTarget:n}}function th(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=bl(e,n),s!=null&&i.unshift(Ul(e,s,a)),s=bl(e,t),s!=null&&i.push(Ul(e,s,a))),e.tag===3)return i;e=e.return}return[]}function TT(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Fv(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=bl(n,a),c!=null&&r.unshift(Ul(n,c,l))):s||(c=bl(n,a),c!=null&&r.push(Ul(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var AT=/\r\n?/g,wT=/\u0000|\uFFFD/g;function Vv(e){return(typeof e=="string"?e:""+e).replace(AT,`
`).replace(wT,"")}function DS(e,t){return t=Vv(t),Vv(e)===t}function ce(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||Yr(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&Yr(e,""+i);break;case"className":iu(e,"class",i);break;case"tabIndex":iu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":iu(e,n,i);break;case"style":wy(e,i,a);break;case"data":if(t!=="object"){iu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=vu(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&ce(e,t,"name",s.name,s,null),ce(e,t,"formEncType",s.formEncType,s,null),ce(e,t,"formMethod",s.formMethod,s,null),ce(e,t,"formTarget",s.formTarget,s,null)):(ce(e,t,"encType",s.encType,s,null),ce(e,t,"method",s.method,s,null),ce(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=vu(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=fs);break;case"onScroll":i!=null&&Xt("scroll",e);break;case"onScrollEnd":i!=null&&Xt("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error($(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error($(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=vu(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":Xt("beforetoggle",e),Xt("toggle",e),_u(e,"popover",i);break;case"xlinkActuate":ss(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":ss(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":ss(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":ss(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":ss(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":ss(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":ss(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":ss(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":ss(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":_u(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=iE.get(n)||n,_u(e,n,i))}}function gm(e,t,n,i,s,a){switch(n){case"style":wy(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error($(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error($(60));e.innerHTML=n}}break;case"children":typeof i=="string"?Yr(e,i):(typeof i=="number"||typeof i=="bigint")&&Yr(e,""+i);break;case"onScroll":i!=null&&Xt("scroll",e);break;case"onScrollEnd":i!=null&&Xt("scrollend",e);break;case"onClick":i!=null&&(e.onclick=fs);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Sy.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[Vn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):_u(e,n,i)}}}function _n(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Xt("error",e),Xt("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error($(137,t));default:ce(e,t,a,r,n,null)}}s&&ce(e,t,"srcSet",n.srcSet,n,null),i&&ce(e,t,"src",n.src,n,null);return;case"input":Xt("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var f=n[i];if(f!=null)switch(i){case"name":s=f;break;case"type":r=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":a=f;break;case"defaultValue":o=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error($(137,t));break;default:ce(e,t,i,f,n,null)}}Ey(e,a,o,l,c,r,s,!1);return;case"select":Xt("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:ce(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?Fr(e,!!i,t,!1):n!=null&&Fr(e,!!i,n,!0);return;case"textarea":Xt("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error($(91));break;default:ce(e,t,r,o,n,null)}Ay(e,i,s,a);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(i=n[l],i!=null))switch(l){case"selected":e.selected=i&&typeof i!="function"&&typeof i!="symbol";break;default:ce(e,t,l,i,n,null)}return;case"dialog":Xt("beforetoggle",e),Xt("toggle",e),Xt("cancel",e),Xt("close",e);break;case"iframe":case"object":Xt("load",e);break;case"video":case"audio":for(i=0;i<Nl.length;i++)Xt(Nl[i],e);break;case"image":Xt("error",e),Xt("load",e);break;case"details":Xt("toggle",e);break;case"embed":case"source":case"link":Xt("error",e),Xt("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error($(137,t));default:ce(e,t,c,i,n,null)}return;default:if(Um(t)){for(f in n)n.hasOwnProperty(f)&&(i=n[f],i!==void 0&&gm(e,t,f,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&ce(e,t,o,i,n,null))}function CT(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,f=null;for(d in n){var p=n[d];if(n.hasOwnProperty(d)&&p!=null)switch(d){case"checked":break;case"value":break;case"defaultValue":l=p;default:i.hasOwnProperty(d)||ce(e,t,d,null,i,p)}}for(var u in i){var d=i[u];if(p=n[u],i.hasOwnProperty(u)&&(d!=null||p!=null))switch(u){case"type":a=d;break;case"name":s=d;break;case"checked":c=d;break;case"defaultChecked":f=d;break;case"value":r=d;break;case"defaultValue":o=d;break;case"children":case"dangerouslySetInnerHTML":if(d!=null)throw Error($(137,t));break;default:d!==p&&ce(e,t,u,d,i,p)}}Hp(e,r,o,l,c,f,a,s);return;case"select":d=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":d=l;default:i.hasOwnProperty(a)||ce(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&ce(e,t,s,a,i,l)}t=o,n=r,i=d,u!=null?Fr(e,!!n,u,!1):!!i!=!!n&&(t!=null?Fr(e,!!n,t,!0):Fr(e,!!n,n?[]:"",!1));return;case"textarea":d=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:ce(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":d=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error($(91));break;default:s!==a&&ce(e,t,r,s,i,a)}Ty(e,u,d);return;case"option":for(var g in n)if(u=n[g],n.hasOwnProperty(g)&&u!=null&&!i.hasOwnProperty(g))switch(g){case"selected":e.selected=!1;break;default:ce(e,t,g,null,i,u)}for(l in i)if(u=i[l],d=n[l],i.hasOwnProperty(l)&&u!==d&&(u!=null||d!=null))switch(l){case"selected":e.selected=u&&typeof u!="function"&&typeof u!="symbol";break;default:ce(e,t,l,u,i,d)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var M in n)u=n[M],n.hasOwnProperty(M)&&u!=null&&!i.hasOwnProperty(M)&&ce(e,t,M,null,i,u);for(c in i)if(u=i[c],d=n[c],i.hasOwnProperty(c)&&u!==d&&(u!=null||d!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error($(137,t));break;default:ce(e,t,c,u,i,d)}return;default:if(Um(t)){for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!==void 0&&!i.hasOwnProperty(m)&&gm(e,t,m,void 0,i,u);for(f in i)u=i[f],d=n[f],!i.hasOwnProperty(f)||u===d||u===void 0&&d===void 0||gm(e,t,f,u,i,d);return}}for(var h in n)u=n[h],n.hasOwnProperty(h)&&u!=null&&!i.hasOwnProperty(h)&&ce(e,t,h,null,i,u);for(p in i)u=i[p],d=n[p],!i.hasOwnProperty(p)||u===d||u==null&&d==null||ce(e,t,p,u,i,d)}function Hv(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function RT(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&Hv(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var f=l.transferSize,p=l.initiatorType;f&&Hv(p)&&(l=l.responseEnd,r+=f*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var _m=null,vm=null;function eh(e){return e.nodeType===9?e:e.ownerDocument}function Gv(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function NS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function ym(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Rp=null;function DT(){var e=window.event;return e&&e.type==="popstate"?e===Rp?!1:(Rp=e,!0):(Rp=null,!1)}var US=typeof setTimeout=="function"?setTimeout:void 0,NT=typeof clearTimeout=="function"?clearTimeout:void 0,kv=typeof Promise=="function"?Promise:void 0,UT=typeof queueMicrotask=="function"?queueMicrotask:typeof kv<"u"?function(e){return kv.resolve(null).then(e).catch(LT)}:US;function LT(e){setTimeout(function(){throw e})}function fa(e){return e==="head"}function Xv(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),eo(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Sl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Sl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[Vl]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&Sl(e.ownerDocument.body);n=s}while(n);eo(t)}function Wv(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function xm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":xm(n),Nm(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function OT(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[Vl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=vi(e.nextSibling),e===null)break}return null}function IT(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=vi(e.nextSibling),e===null))return null;return e}function LS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=vi(e.nextSibling),e===null))return null;return e}function Sm(e){return e.data==="$?"||e.data==="$~"}function Mm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function PT(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function vi(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var bm=null;function qv(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return vi(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function Yv(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function OS(e,t,n){switch(t=eh(n),e){case"html":if(e=t.documentElement,!e)throw Error($(452));return e;case"head":if(e=t.head,!e)throw Error($(453));return e;case"body":if(e=t.body,!e)throw Error($(454));return e;default:throw Error($(451))}}function Sl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Nm(e)}var yi=new Map,Zv=new Set;function nh(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ms=ne.d;ne.d={f:BT,r:zT,D:FT,C:VT,L:HT,m:GT,X:XT,S:kT,M:WT};function BT(){var e=Ms.f(),t=yh();return e||t}function zT(e){var t=io(e);t!==null&&t.tag===5&&t.type==="form"?wx(t):Ms.r(e)}var oo=typeof document>"u"?null:document;function IS(e,t,n){var i=oo;if(i&&typeof t=="string"&&t){var s=pi(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),Zv.has(s)||(Zv.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),_n(t,"link",e),rn(t),i.head.appendChild(t)))}}function FT(e){Ms.D(e),IS("dns-prefetch",e,null)}function VT(e,t){Ms.C(e,t),IS("preconnect",e,t)}function HT(e,t,n){Ms.L(e,t,n);var i=oo;if(i&&e&&t){var s='link[rel="preload"][as="'+pi(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+pi(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+pi(n.imageSizes)+'"]')):s+='[href="'+pi(e)+'"]';var a=s;switch(t){case"style":a=to(e);break;case"script":a=lo(e)}yi.has(a)||(e=Te({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),yi.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(ql(a))||t==="script"&&i.querySelector(Yl(a))||(t=i.createElement("link"),_n(t,"link",e),rn(t),i.head.appendChild(t)))}}function GT(e,t){Ms.m(e,t);var n=oo;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+pi(i)+'"][href="'+pi(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=lo(e)}if(!yi.has(a)&&(e=Te({rel:"modulepreload",href:e},t),yi.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Yl(a)))return}i=n.createElement("link"),_n(i,"link",e),rn(i),n.head.appendChild(i)}}}function kT(e,t,n){Ms.S(e,t,n);var i=oo;if(i&&e){var s=zr(i).hoistableStyles,a=to(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(ql(a)))o.loading=5;else{e=Te({rel:"stylesheet",href:e,"data-precedence":t},n),(n=yi.get(a))&&gg(e,n);var l=r=i.createElement("link");rn(l),_n(l,"link",e),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,Cu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function XT(e,t){Ms.X(e,t);var n=oo;if(n&&e){var i=zr(n).hoistableScripts,s=lo(e),a=i.get(s);a||(a=n.querySelector(Yl(s)),a||(e=Te({src:e,async:!0},t),(t=yi.get(s))&&_g(e,t),a=n.createElement("script"),rn(a),_n(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function WT(e,t){Ms.M(e,t);var n=oo;if(n&&e){var i=zr(n).hoistableScripts,s=lo(e),a=i.get(s);a||(a=n.querySelector(Yl(s)),a||(e=Te({src:e,async:!0,type:"module"},t),(t=yi.get(s))&&_g(e,t),a=n.createElement("script"),rn(a),_n(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function Kv(e,t,n,i){var s=(s=Qs.current)?nh(s):null;if(!s)throw Error($(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=to(n.href),n=zr(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=to(n.href);var a=zr(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(ql(e)))&&!a._p&&(r.instance=a,r.state.loading=5),yi.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},yi.set(e,n),a||qT(s,e,n,r.state))),t&&i===null)throw Error($(528,""));return r}if(t&&i!==null)throw Error($(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=lo(n),n=zr(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error($(444,e))}}function to(e){return'href="'+pi(e)+'"'}function ql(e){return'link[rel="stylesheet"]['+e+"]"}function PS(e){return Te({},e,{"data-precedence":e.precedence,precedence:null})}function qT(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),_n(t,"link",n),rn(t),e.head.appendChild(t))}function lo(e){return'[src="'+pi(e)+'"]'}function Yl(e){return"script[async]"+e}function Jv(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+pi(n.href)+'"]');if(i)return t.instance=i,rn(i),i;var s=Te({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),rn(i),_n(i,"style",s),Cu(i,n.precedence,e),t.instance=i;case"stylesheet":s=to(n.href);var a=e.querySelector(ql(s));if(a)return t.state.loading|=4,t.instance=a,rn(a),a;i=PS(n),(s=yi.get(s))&&gg(i,s),a=(e.ownerDocument||e).createElement("link"),rn(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),_n(a,"link",i),t.state.loading|=4,Cu(a,n.precedence,e),t.instance=a;case"script":return a=lo(n.src),(s=e.querySelector(Yl(a)))?(t.instance=s,rn(s),s):(i=n,(s=yi.get(a))&&(i=Te({},n),_g(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),rn(s),_n(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error($(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,Cu(i,n.precedence,e));return t.instance}function Cu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function gg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function _g(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Ru=null;function jv(e,t,n){if(Ru===null){var i=new Map,s=Ru=new Map;s.set(n,i)}else s=Ru,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[Vl]||a[pn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function Qv(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function YT(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return e=t.disabled,typeof t.precedence=="string"&&e==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function BS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function ZT(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=to(i.href),a=t.querySelector(ql(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=ih.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,rn(a);return}a=t.ownerDocument||t,i=PS(i),(s=yi.get(s))&&gg(i,s),a=a.createElement("link"),rn(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),_n(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=ih.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var Dp=0;function KT(e,t){return e.stylesheets&&e.count===0&&Du(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&Du(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&Dp===0&&(Dp=62500*RT());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Du(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>Dp?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function ih(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Du(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var sh=null;function Du(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,sh=new Map,t.forEach(JT,e),sh=null,ih.call(e))}function JT(e,t){if(!(t.state.loading&4)){var n=sh.get(e);if(n)var i=n.get(null);else{n=new Map,sh.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=ih.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var Ll={$$typeof:hs,Provider:null,Consumer:null,_currentValue:za,_currentValue2:za,_threadCount:0};function jT(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=np(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=np(0),this.hiddenUpdates=np(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function zS(e,t,n,i,s,a,r,o,l,c,f,p){return e=new jT(e,t,n,r,l,c,f,p,o),t=1,a===!0&&(t|=24),a=Zn(3,null,null,t),e.current=a,a.stateNode=e,t=km(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},qm(a),e}function FS(e){return e?(e=Or,e):Or}function VS(e,t,n,i,s,a){s=FS(s),i.context===null?i.context=s:i.pendingContext=s,i=ta(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=ea(e,i,t),n!==null&&(Fn(n,e,t),dl(n,e,t))}function $v(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function vg(e,t){$v(e,t),(e=e.alternate)&&$v(e,t)}function HS(e){if(e.tag===13||e.tag===31){var t=ja(e,67108864);t!==null&&Fn(t,e,67108864),vg(e,67108864)}}function ty(e){if(e.tag===13||e.tag===31){var t=$n();t=Rm(t);var n=ja(e,t);n!==null&&Fn(n,e,t),vg(e,t)}}var ah=!0;function QT(e,t,n,i){var s=Ut.T;Ut.T=null;var a=ne.p;try{ne.p=2,yg(e,t,n,i)}finally{ne.p=a,Ut.T=s}}function $T(e,t,n,i){var s=Ut.T;Ut.T=null;var a=ne.p;try{ne.p=8,yg(e,t,n,i)}finally{ne.p=a,Ut.T=s}}function yg(e,t,n,i){if(ah){var s=Em(i);if(s===null)Cp(e,t,i,rh,n),ey(e,i);else if(eA(s,e,t,n,i))i.stopPropagation();else if(ey(e,i),t&4&&-1<tA.indexOf(e)){for(;s!==null;){var a=io(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=Ia(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-Qn(r);o.entanglements[1]|=l,r&=~l}qi(a),(ee&6)===0&&(Ku=Jn()+500,Wl(0,!1))}}break;case 31:case 13:o=ja(a,2),o!==null&&Fn(o,a,2),yh(),vg(a,2)}if(a=Em(i),a===null&&Cp(e,t,i,rh,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else Cp(e,t,i,null,n)}}function Em(e){return e=Lm(e),xg(e)}var rh=null;function xg(e){if(rh=null,e=Cr(e),e!==null){var t=Pl(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=oy(t),e!==null)return e;e=null}else if(n===31){if(e=ly(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return rh=e,null}function GS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(H1()){case fy:return 2;case dy:return 8;case Iu:case G1:return 32;case py:return 268435456;default:return 32}default:return 32}}var Tm=!1,sa=null,aa=null,ra=null,Ol=new Map,Il=new Map,qs=[],tA="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ey(e,t){switch(e){case"focusin":case"focusout":sa=null;break;case"dragenter":case"dragleave":aa=null;break;case"mouseover":case"mouseout":ra=null;break;case"pointerover":case"pointerout":Ol.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Il.delete(t.pointerId)}}function nl(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=io(t),t!==null&&HS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function eA(e,t,n,i,s){switch(t){case"focusin":return sa=nl(sa,e,t,n,i,s),!0;case"dragenter":return aa=nl(aa,e,t,n,i,s),!0;case"mouseover":return ra=nl(ra,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return Ol.set(a,nl(Ol.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,Il.set(a,nl(Il.get(a)||null,e,t,n,i,s)),!0}return!1}function kS(e){var t=Cr(e.target);if(t!==null){var n=Pl(t);if(n!==null){if(t=n.tag,t===13){if(t=oy(n),t!==null){e.blockedOn=t,z_(e.priority,function(){ty(n)});return}}else if(t===31){if(t=ly(n),t!==null){e.blockedOn=t,z_(e.priority,function(){ty(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Nu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Em(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);kp=i,n.target.dispatchEvent(i),kp=null}else return t=io(n),t!==null&&HS(t),e.blockedOn=n,!1;t.shift()}return!0}function ny(e,t,n){Nu(e)&&n.delete(t)}function nA(){Tm=!1,sa!==null&&Nu(sa)&&(sa=null),aa!==null&&Nu(aa)&&(aa=null),ra!==null&&Nu(ra)&&(ra=null),Ol.forEach(ny),Il.forEach(ny)}function mu(e,t){e.blockedOn===t&&(e.blockedOn=null,Tm||(Tm=!0,$e.unstable_scheduleCallback($e.unstable_NormalPriority,nA)))}var gu=null;function iy(e){gu!==e&&(gu=e,$e.unstable_scheduleCallback($e.unstable_NormalPriority,function(){gu===e&&(gu=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(xg(i||n)===null)continue;break}var a=io(n);a!==null&&(e.splice(t,3),t-=3,am(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function eo(e){function t(l){return mu(l,e)}sa!==null&&mu(sa,e),aa!==null&&mu(aa,e),ra!==null&&mu(ra,e),Ol.forEach(t),Il.forEach(t);for(var n=0;n<qs.length;n++){var i=qs[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<qs.length&&(n=qs[0],n.blockedOn===null);)kS(n),n.blockedOn===null&&qs.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[Vn]||null;if(typeof a=="function")r||iy(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[Vn]||null)o=r.formAction;else if(xg(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),iy(n)}}}function XS(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function Sg(e){this._internalRoot=e}Mh.prototype.render=Sg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error($(409));var n=t.current,i=$n();VS(n,i,e,t,null,null)};Mh.prototype.unmount=Sg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;VS(e.current,2,null,e,null,null),yh(),t[no]=null}};function Mh(e){this._internalRoot=e}Mh.prototype.unstable_scheduleHydration=function(e){if(e){var t=yy();e={blockedOn:null,target:e,priority:t};for(var n=0;n<qs.length&&t!==0&&t<qs[n].priority;n++);qs.splice(n,0,e),n===0&&kS(e)}};var sy=ay.version;if(sy!=="19.2.6")throw Error($(527,sy,"19.2.6"));ne.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error($(188)):(e=Object.keys(e).join(","),Error($(268,e)));return e=O1(t),e=e!==null?cy(e):null,e=e===null?null:e.stateNode,e};var iA={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:Ut,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(il=__REACT_DEVTOOLS_GLOBAL_HOOK__,!il.isDisabled&&il.supportsFiber))try{Bl=il.inject(iA),jn=il}catch{}var il;bh.createRoot=function(e,t){if(!ry(e))throw Error($(299));var n=!1,i="",s=Ix,a=Px,r=Bx;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=zS(e,1,!1,null,null,n,i,null,s,a,r,XS),e[no]=t.current,mg(e),new Sg(t)};bh.hydrateRoot=function(e,t,n){if(!ry(e))throw Error($(299));var i=!1,s="",a=Ix,r=Px,o=Bx,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=zS(e,1,!0,t,n??null,i,s,l,a,r,o,XS),t.context=FS(null),n=t.current,i=$n(),i=Rm(i),s=ta(i),s.callback=null,ea(n,s,i),n=i,t.current.lanes=n,Fl(t,n),qi(t),e[no]=t.current,mg(e),new Mh(t)};bh.version="19.2.6"});var ZS=zi((SD,YS)=>{"use strict";function qS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(qS)}catch(e){console.error(e)}}qS(),YS.exports=WS()});var qb=zi(Od=>{"use strict";var oD=Symbol.for("react.transitional.element"),lD=Symbol.for("react.fragment");function Wb(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:oD,type:e,key:i,ref:t!==void 0?t:null,props:n}}Od.Fragment=lD;Od.jsx=Wb;Od.jsxs=Wb});var dr=zi((HL,Yb)=>{"use strict";Yb.exports=qb()});var qL=Fi(vr()),$b=Fi(ZS());var _e=Fi(vr(),1),sA=(e,t,n,i,s,a,r,o)=>{let l=document.documentElement,c=["light","dark"];function f(d){(Array.isArray(e)?e:[e]).forEach(g=>{let M=g==="class",m=M&&a?s.map(h=>a[h]||h):s;M?(l.classList.remove(...m),l.classList.add(a&&a[d]?a[d]:d)):l.setAttribute(g,d)}),p(d)}function p(d){o&&c.includes(d)&&(l.style.colorScheme=d)}function u(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(i)f(i);else try{let d=localStorage.getItem(t)||n,g=r&&d==="system"?u():d;f(g)}catch{}},KS=["light","dark"],JS="(prefers-color-scheme: dark)",aA=typeof window>"u",jS=_e.createContext(void 0);var QS=e=>_e.useContext(jS)?_e.createElement(_e.Fragment,null,e.children):_e.createElement(oA,{...e}),rA=["light","dark"],oA=({forcedTheme:e,disableTransitionOnChange:t=!1,enableSystem:n=!0,enableColorScheme:i=!0,storageKey:s="theme",themes:a=rA,defaultTheme:r=n?"system":"light",attribute:o="data-theme",value:l,children:c,nonce:f,scriptProps:p})=>{let[u,d]=_e.useState(()=>cA(s,r)),[g,M]=_e.useState(()=>u==="system"?Mg():u),m=l?Object.values(l):a,h=_e.useCallback(E=>{let A=E;if(!A)return;E==="system"&&n&&(A=Mg());let w=l?l[A]:A,v=t?uA(f):null,T=document.documentElement,D=N=>{N==="class"?(T.classList.remove(...m),w&&T.classList.add(w)):N.startsWith("data-")&&(w?T.setAttribute(N,w):T.removeAttribute(N))};if(Array.isArray(o)?o.forEach(D):D(o),i){let N=KS.includes(r)?r:null,R=KS.includes(A)?A:N;T.style.colorScheme=R}v?.()},[f]),_=_e.useCallback(E=>{let A=typeof E=="function"?E(u):E;d(A);try{localStorage.setItem(s,A)}catch{}},[u]),S=_e.useCallback(E=>{let A=Mg(E);M(A),u==="system"&&n&&!e&&h("system")},[u,e]);_e.useEffect(()=>{let E=window.matchMedia(JS);return E.addListener(S),S(E),()=>E.removeListener(S)},[S]),_e.useEffect(()=>{let E=A=>{A.key===s&&(A.newValue?d(A.newValue):_(r))};return window.addEventListener("storage",E),()=>window.removeEventListener("storage",E)},[_]),_e.useEffect(()=>{h(e??u)},[e,u]);let y=_e.useMemo(()=>({theme:u,setTheme:_,forcedTheme:e,resolvedTheme:u==="system"?g:u,themes:n?[...a,"system"]:a,systemTheme:n?g:void 0}),[u,_,e,g,n,a]);return _e.createElement(jS.Provider,{value:y},_e.createElement(lA,{forcedTheme:e,storageKey:s,attribute:o,enableSystem:n,enableColorScheme:i,defaultTheme:r,value:l,themes:a,nonce:f,scriptProps:p}),c)},lA=_e.memo(({forcedTheme:e,storageKey:t,attribute:n,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:r,themes:o,nonce:l,scriptProps:c})=>{let f=JSON.stringify([n,t,a,e,o,r,i,s]).slice(1,-1);return _e.createElement("script",{...c,suppressHydrationWarning:!0,nonce:typeof window>"u"?l:"",dangerouslySetInnerHTML:{__html:`(${sA.toString()})(${f})`}})}),cA=(e,t)=>{if(aA)return;let n;try{n=localStorage.getItem(e)||void 0}catch{}return n||t},uA=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},Mg=e=>(e||(e=window.matchMedia(JS)),e.matches?"dark":"light");var Ce=Fi(vr(),1);var Ta={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Aa={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},CM=0,i0=1,RM=2;var Lc=1,Pf=2,Ho=3,Ns=0,Un=1,Qi=2,$i=0,ar=1,s0=2,a0=3,r0=4,DM=5;var ya=100,NM=101,UM=102,LM=103,OM=104,IM=200,PM=201,BM=202,zM=203,jh=204,Qh=205,FM=206,VM=207,HM=208,GM=209,kM=210,XM=211,WM=212,qM=213,YM=214,$h=0,tf=1,ef=2,rr=3,nf=4,sf=5,af=6,rf=7,o0=0,ZM=1,KM=2,Ui=0,l0=1,c0=2,u0=3,Oc=4,h0=5,f0=6,d0=7;var p0=300,wa=301,ur=302,Bf=303,zf=304,Ic=306,of=1e3,Zi=1001,lf=1002,cn=1003,JM=1004;var Pc=1005;var yn=1006,Ff=1007;var Ca=1008;var Gn=1009,m0=1010,g0=1011,Go=1012,Vf=1013,Li=1014,Oi=1015,ts=1016,Hf=1017,Gf=1018,ko=1020,_0=35902,v0=35899,y0=1021,x0=1022,Mi=1023,Ji=1026,Ra=1027,S0=1028,kf=1029,Da=1030,Xf=1031;var Wf=1033,Bc=33776,zc=33777,Fc=33778,Vc=33779,qf=35840,Yf=35841,Zf=35842,Kf=35843,Jf=36196,jf=37492,Qf=37496,$f=37488,td=37489,Hc=37490,ed=37491,nd=37808,id=37809,sd=37810,ad=37811,rd=37812,od=37813,ld=37814,cd=37815,ud=37816,hd=37817,fd=37818,dd=37819,pd=37820,md=37821,gd=36492,_d=36494,vd=36495,yd=36283,xd=36284,Gc=36285,Sd=36286;var sc=2300,cf=2301,Jh=2302,Yg=2303,Zg=2400,Kg=2401,Jg=2402;var jM=3200;var Md=0,QM=1,Is="",En="srgb",ac="srgb-linear",rc="linear",ie="srgb";var ir=7680;var jg=519,$M=512,tb=513,eb=514,bd=515,nb=516,ib=517,Ed=518,sb=519,uf=35044;var M0="300 es",Di=2e3,wo=2001;function hA(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function fA(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function oc(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function ab(){let e=oc("canvas");return e.style.display="block",e}var $S={},Co=null;function lc(...e){let t="THREE."+e.shift();Co?Co("log",t,...e):console.log(t,...e)}function rb(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function wt(...e){e=rb(e);let t="THREE."+e.shift();if(Co)Co("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Rt(...e){e=rb(e);let t="THREE."+e.shift();if(Co)Co("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function sr(...e){let t=e.join(" ");t in $S||($S[t]=!0,wt(...e))}function ob(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var lb={[$h]:tf,[ef]:af,[nf]:rf,[rr]:sf,[tf]:$h,[af]:ef,[rf]:nf,[sf]:rr},Ni=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},Mn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],tM=1234567,nc=Math.PI/180,Ro=180/Math.PI;function Rs(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Mn[e&255]+Mn[e>>8&255]+Mn[e>>16&255]+Mn[e>>24&255]+"-"+Mn[t&255]+Mn[t>>8&255]+"-"+Mn[t>>16&15|64]+Mn[t>>24&255]+"-"+Mn[n&63|128]+Mn[n>>8&255]+"-"+Mn[n>>16&255]+Mn[n>>24&255]+Mn[i&255]+Mn[i>>8&255]+Mn[i>>16&255]+Mn[i>>24&255]).toLowerCase()}function kt(e,t,n){return Math.max(t,Math.min(n,e))}function b0(e,t){return(e%t+t)%t}function dA(e,t,n,i,s){return i+(e-t)*(s-i)/(n-t)}function pA(e,t,n){return e!==t?(n-e)/(t-e):0}function ic(e,t,n){return(1-n)*e+n*t}function mA(e,t,n,i){return ic(e,t,1-Math.exp(-n*i))}function gA(e,t=1){return t-Math.abs(b0(e,t*2)-t)}function _A(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function vA(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function yA(e,t){return e+Math.floor(Math.random()*(t-e+1))}function xA(e,t){return e+Math.random()*(t-e)}function SA(e){return e*(.5-Math.random())}function MA(e){e!==void 0&&(tM=e);let t=tM+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function bA(e){return e*nc}function EA(e){return e*Ro}function TA(e){return(e&e-1)===0&&e!==0}function AA(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function wA(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function CA(e,t,n,i,s){let a=Math.cos,r=Math.sin,o=a(n/2),l=r(n/2),c=a((t+i)/2),f=r((t+i)/2),p=a((t-i)/2),u=r((t-i)/2),d=a((i-t)/2),g=r((i-t)/2);switch(s){case"XYX":e.set(o*f,l*p,l*u,o*c);break;case"YZY":e.set(l*u,o*f,l*p,o*c);break;case"ZXZ":e.set(l*p,l*u,o*f,o*c);break;case"XZX":e.set(o*f,l*g,l*d,o*c);break;case"YXY":e.set(l*d,o*f,l*g,o*c);break;case"ZYZ":e.set(l*g,l*d,o*f,o*c);break;default:wt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ri(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function oe(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var E0={DEG2RAD:nc,RAD2DEG:Ro,generateUUID:Rs,clamp:kt,euclideanModulo:b0,mapLinear:dA,inverseLerp:pA,lerp:ic,damp:mA,pingpong:gA,smoothstep:_A,smootherstep:vA,randInt:yA,randFloat:xA,randFloatSpread:SA,seededRandom:MA,degToRad:bA,radToDeg:EA,isPowerOfTwo:TA,ceilPowerOfTwo:AA,floorPowerOfTwo:wA,setQuaternionFromProperEuler:CA,normalize:oe,denormalize:Ri},bt=class e{static{e.prototype.isVector2=!0}constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=kt(this.x,t.x,n.x),this.y=kt(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=kt(this.x,t,n),this.y=kt(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},si=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],f=i[s+2],p=i[s+3],u=a[r+0],d=a[r+1],g=a[r+2],M=a[r+3];if(p!==M||l!==u||c!==d||f!==g){let m=l*u+c*d+f*g+p*M;m<0&&(u=-u,d=-d,g=-g,M=-M,m=-m);let h=1-o;if(m<.9995){let _=Math.acos(m),S=Math.sin(_);h=Math.sin(h*_)/S,o=Math.sin(o*_)/S,l=l*h+u*o,c=c*h+d*o,f=f*h+g*o,p=p*h+M*o}else{l=l*h+u*o,c=c*h+d*o,f=f*h+g*o,p=p*h+M*o;let _=1/Math.sqrt(l*l+c*c+f*f+p*p);l*=_,c*=_,f*=_,p*=_}}t[n]=l,t[n+1]=c,t[n+2]=f,t[n+3]=p}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],f=i[s+3],p=a[r],u=a[r+1],d=a[r+2],g=a[r+3];return t[n]=o*g+f*p+l*d-c*u,t[n+1]=l*g+f*u+c*p-o*d,t[n+2]=c*g+f*d+o*u-l*p,t[n+3]=f*g-o*p-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),f=o(s/2),p=o(a/2),u=l(i/2),d=l(s/2),g=l(a/2);switch(r){case"XYZ":this._x=u*f*p+c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p-u*d*g;break;case"YXZ":this._x=u*f*p+c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p+u*d*g;break;case"ZXY":this._x=u*f*p-c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p-u*d*g;break;case"ZYX":this._x=u*f*p-c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p+u*d*g;break;case"YZX":this._x=u*f*p+c*d*g,this._y=c*d*p+u*f*g,this._z=c*f*g-u*d*p,this._w=c*f*p-u*d*g;break;case"XZY":this._x=u*f*p-c*d*g,this._y=c*d*p-u*f*g,this._z=c*f*g+u*d*p,this._w=c*f*p+u*d*g;break;default:wt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],f=n[6],p=n[10],u=i+o+p;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-c)*d,this._z=(r-s)*d}else if(i>o&&i>p){let d=2*Math.sqrt(1+i-o-p);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+c)/d}else if(o>p){let d=2*Math.sqrt(1+o-i-p);this._w=(a-c)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+p-i-o);this._w=(r-s)/d,this._x=(a+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(kt(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,f=n._w;return this._x=i*f+r*o+s*c-a*l,this._y=s*f+r*l+a*o-i*c,this._z=a*f+r*c+i*l-s*o,this._w=r*f-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,n=Math.sin(n*c)/f,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class e{static{e.prototype.isVector3=!0}constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(eM.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(eM.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),f=2*(o*n-a*s),p=2*(a*i-r*n);return this.x=n+l*c+r*p-o*f,this.y=i+l*f+o*c-a*p,this.z=s+l*p+a*f-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=kt(this.x,t.x,n.x),this.y=kt(this.y,t.y,n.y),this.z=kt(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=kt(this.x,t,n),this.y=kt(this.y,t,n),this.z=kt(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return bg.copy(this).projectOnVector(t),this.sub(bg)}reflect(t){return this.sub(bg.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},bg=new U,eM=new si,Ot=class e{static{e.prototype.isMatrix3=!0}constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let f=this.elements;return f[0]=t,f[1]=s,f[2]=o,f[3]=n,f[4]=a,f[5]=l,f[6]=i,f[7]=r,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],f=i[4],p=i[7],u=i[2],d=i[5],g=i[8],M=s[0],m=s[3],h=s[6],_=s[1],S=s[4],y=s[7],E=s[2],A=s[5],w=s[8];return a[0]=r*M+o*_+l*E,a[3]=r*m+o*S+l*A,a[6]=r*h+o*y+l*w,a[1]=c*M+f*_+p*E,a[4]=c*m+f*S+p*A,a[7]=c*h+f*y+p*w,a[2]=u*M+d*_+g*E,a[5]=u*m+d*S+g*A,a[8]=u*h+d*y+g*w,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8];return n*r*f-n*o*c-i*a*f+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=f*r-o*c,u=o*l-f*a,d=c*a-r*l,g=n*p+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let M=1/g;return t[0]=p*M,t[1]=(s*c-f*i)*M,t[2]=(o*i-s*r)*M,t[3]=u*M,t[4]=(f*n-s*l)*M,t[5]=(s*a-o*n)*M,t[6]=d*M,t[7]=(i*l-c*n)*M,t[8]=(r*n-i*a)*M,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return sr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Eg.makeScale(t,n)),this}rotate(t){return sr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Eg.makeRotation(-t)),this}translate(t,n){return sr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Eg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Eg=new Ot,nM=new Ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),iM=new Ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function RA(){let e={enabled:!0,workingColorSpace:ac,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===ie&&(s.r=Ds(s.r),s.g=Ds(s.g),s.b=Ds(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===ie&&(s.r=Ao(s.r),s.g=Ao(s.g),s.b=Ao(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Is?rc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return sr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return sr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[ac]:{primaries:t,whitePoint:i,transfer:rc,toXYZ:nM,fromXYZ:iM,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:En},outputColorSpaceConfig:{drawingBufferColorSpace:En}},[En]:{primaries:t,whitePoint:i,transfer:ie,toXYZ:nM,fromXYZ:iM,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:En}}}),e}var Zt=RA();function Ds(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function Ao(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var co,hf=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{co===void 0&&(co=oc("canvas")),co.width=t.width,co.height=t.height;let s=co.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=co}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let n=oc("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Ds(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Ds(n[i]/255)*255):n[i]=Ds(n[i]);return{data:n,width:t.width,height:t.height}}else return wt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},DA=0,Do=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:DA++}),this.uuid=Rs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(Tg(s[r].image)):a.push(Tg(s[r]))}else a=Tg(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function Tg(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?hf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(wt("Texture: Unable to serialize Texture."),{})}var NA=0,Ag=new U,Nn=class e extends Ni{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=Zi,s=Zi,a=yn,r=Ca,o=Mi,l=Gn,c=e.DEFAULT_ANISOTROPY,f=Is){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:NA++}),this.uuid=Rs(),this.name="",this.source=new Do(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new bt(0,0),this.repeat=new bt(1,1),this.center=new bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ag).x}get height(){return this.source.getSize(Ag).y}get depth(){return this.source.getSize(Ag).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){wt(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){wt(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==p0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case of:t.x=t.x-Math.floor(t.x);break;case Zi:t.x=t.x<0?0:1;break;case lf:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case of:t.y=t.y-Math.floor(t.y);break;case Zi:t.y=t.y<0?0:1;break;case lf:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=p0;Nn.DEFAULT_ANISOTROPY=1;var Ue=class e{static{e.prototype.isVector4=!0}constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],f=l[4],p=l[8],u=l[1],d=l[5],g=l[9],M=l[2],m=l[6],h=l[10];if(Math.abs(f-u)<.01&&Math.abs(p-M)<.01&&Math.abs(g-m)<.01){if(Math.abs(f+u)<.1&&Math.abs(p+M)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let S=(c+1)/2,y=(d+1)/2,E=(h+1)/2,A=(f+u)/4,w=(p+M)/4,v=(g+m)/4;return S>y&&S>E?S<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(S),s=A/i,a=w/i):y>E?y<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),i=A/s,a=v/s):E<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(E),i=w/a,s=v/a),this.set(i,s,a,n),this}let _=Math.sqrt((m-g)*(m-g)+(p-M)*(p-M)+(u-f)*(u-f));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(p-M)/_,this.z=(u-f)/_,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=kt(this.x,t.x,n.x),this.y=kt(this.y,t.y,n.y),this.z=kt(this.z,t.z,n.z),this.w=kt(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=kt(this.x,t,n),this.y=kt(this.y,t,n),this.z=kt(this.z,t,n),this.w=kt(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(kt(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ff=class extends Ni{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:yn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new Ue(0,0,t,n),this.scissorTest=!1,this.viewport=new Ue(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Nn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:yn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new Do(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ai=class extends ff{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},cc=class extends Nn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var df=class extends Nn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Se=class e{static{e.prototype.isMatrix4=!0}constructor(t,n,i,s,a,r,o,l,c,f,p,u,d,g,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,f,p,u,d,g,M,m)}set(t,n,i,s,a,r,o,l,c,f,p,u,d,g,M,m){let h=this.elements;return h[0]=t,h[4]=n,h[8]=i,h[12]=s,h[1]=a,h[5]=r,h[9]=o,h[13]=l,h[2]=c,h[6]=f,h[10]=p,h[14]=u,h[3]=d,h[7]=g,h[11]=M,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/uo.setFromMatrixColumn(t,0).length(),a=1/uo.setFromMatrixColumn(t,1).length(),r=1/uo.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),f=Math.cos(a),p=Math.sin(a);if(t.order==="XYZ"){let u=r*f,d=r*p,g=o*f,M=o*p;n[0]=l*f,n[4]=-l*p,n[8]=c,n[1]=d+g*c,n[5]=u-M*c,n[9]=-o*l,n[2]=M-u*c,n[6]=g+d*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*f,d=l*p,g=c*f,M=c*p;n[0]=u+M*o,n[4]=g*o-d,n[8]=r*c,n[1]=r*p,n[5]=r*f,n[9]=-o,n[2]=d*o-g,n[6]=M+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*f,d=l*p,g=c*f,M=c*p;n[0]=u-M*o,n[4]=-r*p,n[8]=g+d*o,n[1]=d+g*o,n[5]=r*f,n[9]=M-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*f,d=r*p,g=o*f,M=o*p;n[0]=l*f,n[4]=g*c-d,n[8]=u*c+M,n[1]=l*p,n[5]=M*c+u,n[9]=d*c-g,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,d=r*c,g=o*l,M=o*c;n[0]=l*f,n[4]=M-u*p,n[8]=g*p+d,n[1]=p,n[5]=r*f,n[9]=-o*f,n[2]=-c*f,n[6]=d*p+g,n[10]=u-M*p}else if(t.order==="XZY"){let u=r*l,d=r*c,g=o*l,M=o*c;n[0]=l*f,n[4]=-p,n[8]=c*f,n[1]=u*p+M,n[5]=r*f,n[9]=d*p-g,n[2]=g*p-d,n[6]=o*f,n[10]=M*p+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(UA,t,LA)}lookAt(t,n,i){let s=this.elements;return ni.subVectors(t,n),ni.lengthSq()===0&&(ni.z=1),ni.normalize(),da.crossVectors(i,ni),da.lengthSq()===0&&(Math.abs(i.z)===1?ni.x+=1e-4:ni.z+=1e-4,ni.normalize(),da.crossVectors(i,ni)),da.normalize(),Eh.crossVectors(ni,da),s[0]=da.x,s[4]=Eh.x,s[8]=ni.x,s[1]=da.y,s[5]=Eh.y,s[9]=ni.y,s[2]=da.z,s[6]=Eh.z,s[10]=ni.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],f=i[1],p=i[5],u=i[9],d=i[13],g=i[2],M=i[6],m=i[10],h=i[14],_=i[3],S=i[7],y=i[11],E=i[15],A=s[0],w=s[4],v=s[8],T=s[12],D=s[1],N=s[5],R=s[9],P=s[13],G=s[2],z=s[6],k=s[10],q=s[14],K=s[3],nt=s[7],ut=s[11],ht=s[15];return a[0]=r*A+o*D+l*G+c*K,a[4]=r*w+o*N+l*z+c*nt,a[8]=r*v+o*R+l*k+c*ut,a[12]=r*T+o*P+l*q+c*ht,a[1]=f*A+p*D+u*G+d*K,a[5]=f*w+p*N+u*z+d*nt,a[9]=f*v+p*R+u*k+d*ut,a[13]=f*T+p*P+u*q+d*ht,a[2]=g*A+M*D+m*G+h*K,a[6]=g*w+M*N+m*z+h*nt,a[10]=g*v+M*R+m*k+h*ut,a[14]=g*T+M*P+m*q+h*ht,a[3]=_*A+S*D+y*G+E*K,a[7]=_*w+S*N+y*z+E*nt,a[11]=_*v+S*R+y*k+E*ut,a[15]=_*T+S*P+y*q+E*ht,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],f=t[2],p=t[6],u=t[10],d=t[14],g=t[3],M=t[7],m=t[11],h=t[15],_=l*d-c*u,S=o*d-c*p,y=o*u-l*p,E=r*d-c*f,A=r*u-l*f,w=r*p-o*f;return n*(M*_-m*S+h*y)-i*(g*_-m*E+h*A)+s*(g*S-M*E+h*w)-a*(g*y-M*A+m*w)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],f=t[10];return n*(r*f-o*c)-i*(a*f-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],f=t[8],p=t[9],u=t[10],d=t[11],g=t[12],M=t[13],m=t[14],h=t[15],_=n*o-i*r,S=n*l-s*r,y=n*c-a*r,E=i*l-s*o,A=i*c-a*o,w=s*c-a*l,v=f*M-p*g,T=f*m-u*g,D=f*h-d*g,N=p*m-u*M,R=p*h-d*M,P=u*h-d*m,G=_*P-S*R+y*N+E*D-A*T+w*v;if(G===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/G;return t[0]=(o*P-l*R+c*N)*z,t[1]=(s*R-i*P-a*N)*z,t[2]=(M*w-m*A+h*E)*z,t[3]=(u*A-p*w-d*E)*z,t[4]=(l*D-r*P-c*T)*z,t[5]=(n*P-s*D+a*T)*z,t[6]=(m*y-g*w-h*S)*z,t[7]=(f*w-u*y+d*S)*z,t[8]=(r*R-o*D+c*v)*z,t[9]=(i*D-n*R-a*v)*z,t[10]=(g*A-M*y+h*_)*z,t[11]=(p*y-f*A-d*_)*z,t[12]=(o*T-r*N-l*v)*z,t[13]=(n*N-i*T+s*v)*z,t[14]=(M*S-g*E-m*_)*z,t[15]=(f*E-p*S+u*_)*z,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,f=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+i,f*l-s*r,0,c*l-s*o,f*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,f=r+r,p=o+o,u=a*c,d=a*f,g=a*p,M=r*f,m=r*p,h=o*p,_=l*c,S=l*f,y=l*p,E=i.x,A=i.y,w=i.z;return s[0]=(1-(M+h))*E,s[1]=(d+y)*E,s[2]=(g-S)*E,s[3]=0,s[4]=(d-y)*A,s[5]=(1-(u+h))*A,s[6]=(m+_)*A,s[7]=0,s[8]=(g+S)*w,s[9]=(m-_)*w,s[10]=(1-(u+M))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=uo.set(s[0],s[1],s[2]).length(),o=uo.set(s[4],s[5],s[6]).length(),l=uo.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Ai.copy(this);let c=1/r,f=1/o,p=1/l;return Ai.elements[0]*=c,Ai.elements[1]*=c,Ai.elements[2]*=c,Ai.elements[4]*=f,Ai.elements[5]*=f,Ai.elements[6]*=f,Ai.elements[8]*=p,Ai.elements[9]*=p,Ai.elements[10]*=p,n.setFromRotationMatrix(Ai),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Di,l=!1){let c=this.elements,f=2*a/(n-t),p=2*a/(i-s),u=(n+t)/(n-t),d=(i+s)/(i-s),g,M;if(l)g=a/(r-a),M=r*a/(r-a);else if(o===Di)g=-(r+a)/(r-a),M=-2*r*a/(r-a);else if(o===wo)g=-r/(r-a),M=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Di,l=!1){let c=this.elements,f=2/(n-t),p=2/(i-s),u=-(n+t)/(n-t),d=-(i+s)/(i-s),g,M;if(l)g=1/(r-a),M=r/(r-a);else if(o===Di)g=-2/(r-a),M=-(r+a)/(r-a);else if(o===wo)g=-1/(r-a),M=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}},uo=new U,Ai=new Se,UA=new U(0,0,0),LA=new U(1,1,1),da=new U,Eh=new U,ni=new U,sM=new Se,aM=new si,Us=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],f=s[9],p=s[2],u=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-kt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(kt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-kt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(kt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-kt(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:wt("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return sM.makeRotationFromQuaternion(t),this.setFromRotationMatrix(sM,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return aM.setFromEuler(this),this.setFromQuaternion(aM,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Us.DEFAULT_ORDER="XYZ";var No=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},OA=0,rM=new U,ho=new si,bs=new Se,Th=new U,Zl=new U,IA=new U,PA=new si,oM=new U(1,0,0),lM=new U(0,1,0),cM=new U(0,0,1),uM={type:"added"},BA={type:"removed"},fo={type:"childadded",child:null},wg={type:"childremoved",child:null},un=class e extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:OA++}),this.uuid=Rs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new U,n=new Us,i=new si,s=new U(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Se},normalMatrix:{value:new Ot}}),this.matrix=new Se,this.matrixWorld=new Se,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new No,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return ho.setFromAxisAngle(t,n),this.quaternion.multiply(ho),this}rotateOnWorldAxis(t,n){return ho.setFromAxisAngle(t,n),this.quaternion.premultiply(ho),this}rotateX(t){return this.rotateOnAxis(oM,t)}rotateY(t){return this.rotateOnAxis(lM,t)}rotateZ(t){return this.rotateOnAxis(cM,t)}translateOnAxis(t,n){return rM.copy(t).applyQuaternion(this.quaternion),this.position.add(rM.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(oM,t)}translateY(t){return this.translateOnAxis(lM,t)}translateZ(t){return this.translateOnAxis(cM,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(bs.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Th.copy(t):Th.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Zl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?bs.lookAt(Zl,Th,this.up):bs.lookAt(Th,Zl,this.up),this.quaternion.setFromRotationMatrix(bs),s&&(bs.extractRotation(s.matrixWorld),ho.setFromRotationMatrix(bs),this.quaternion.premultiply(ho.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(Rt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(uM),fo.child=t,this.dispatchEvent(fo),fo.child=null):Rt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(BA),wg.child=t,this.dispatchEvent(wg),wg.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),bs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),bs.multiply(t.parent.matrixWorld)),t.applyMatrix4(bs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(uM),fo.child=t,this.dispatchEvent(fo),fo.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zl,t,IA),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zl,PA,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let p=l[c];a(t.shapes,p)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),f=r(t.images),p=r(t.shapes),u=r(t.skeletons),d=r(t.animations),g=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),p.length>0&&(i.shapes=p),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function r(o){let l=[];for(let c in o){let f=o[c];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}};un.DEFAULT_UP=new U(0,1,0);un.DEFAULT_MATRIX_AUTO_UPDATE=!0;un.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ki=class extends un{constructor(){super(),this.isGroup=!0,this.type="Group"}},zA={type:"move"},Uo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ki,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ki,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ki,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let M of t.hand.values()){let m=n.getJointPose(M,i),h=this._getHandJoint(c,M);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}let f=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=f.position.distanceTo(p.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(zA)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new Ki;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},cb={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},pa={h:0,s:0,l:0},Ah={h:0,s:0,l:0};function Cg(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var It=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=En){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Zt.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=Zt.workingColorSpace){return this.r=t,this.g=n,this.b=i,Zt.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=Zt.workingColorSpace){if(t=b0(t,1),n=kt(n,0,1),i=kt(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=Cg(r,a,t+1/3),this.g=Cg(r,a,t),this.b=Cg(r,a,t-1/3)}return Zt.colorSpaceToWorking(this,s),this}setStyle(t,n=En){function i(a){a!==void 0&&parseFloat(a)<1&&wt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:wt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);wt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=En){let i=cb[t.toLowerCase()];return i!==void 0?this.setHex(i,n):wt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ds(t.r),this.g=Ds(t.g),this.b=Ds(t.b),this}copyLinearToSRGB(t){return this.r=Ao(t.r),this.g=Ao(t.g),this.b=Ao(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=En){return Zt.workingToColorSpace(bn.copy(this),t),Math.round(kt(bn.r*255,0,255))*65536+Math.round(kt(bn.g*255,0,255))*256+Math.round(kt(bn.b*255,0,255))}getHexString(t=En){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=Zt.workingColorSpace){Zt.workingToColorSpace(bn.copy(this),n);let i=bn.r,s=bn.g,a=bn.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,f=(o+r)/2;if(o===r)l=0,c=0;else{let p=r-o;switch(c=f<=.5?p/(r+o):p/(2-r-o),r){case i:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-i)/p+2;break;case a:l=(i-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=f,t}getRGB(t,n=Zt.workingColorSpace){return Zt.workingToColorSpace(bn.copy(this),n),t.r=bn.r,t.g=bn.g,t.b=bn.b,t}getStyle(t=En){Zt.workingToColorSpace(bn.copy(this),t);let n=bn.r,i=bn.g,s=bn.b;return t!==En?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(pa),this.setHSL(pa.h+t,pa.s+n,pa.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(pa),t.getHSL(Ah);let i=ic(pa.h,Ah.h,n),s=ic(pa.s,Ah.s,n),a=ic(pa.l,Ah.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},bn=new It;It.NAMES=cb;var uc=class e{constructor(t,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new It(t),this.density=n}clone(){return new e(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var hc=class extends un{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Us,this.environmentIntensity=1,this.environmentRotation=new Us,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}},wi=new U,Es=new U,Rg=new U,Ts=new U,po=new U,mo=new U,hM=new U,Dg=new U,Ng=new U,Ug=new U,Lg=new Ue,Og=new Ue,Ig=new Ue,Cs=class e{constructor(t=new U,n=new U,i=new U){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),wi.subVectors(t,n),s.cross(wi);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){wi.subVectors(s,n),Es.subVectors(i,n),Rg.subVectors(t,n);let r=wi.dot(wi),o=wi.dot(Es),l=wi.dot(Rg),c=Es.dot(Es),f=Es.dot(Rg),p=r*c-o*o;if(p===0)return a.set(0,0,0),null;let u=1/p,d=(c*l-o*f)*u,g=(r*f-o*l)*u;return a.set(1-d-g,g,d)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Ts)===null?!1:Ts.x>=0&&Ts.y>=0&&Ts.x+Ts.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Ts)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Ts.x),l.addScaledVector(r,Ts.y),l.addScaledVector(o,Ts.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return Lg.setScalar(0),Og.setScalar(0),Ig.setScalar(0),Lg.fromBufferAttribute(t,n),Og.fromBufferAttribute(t,i),Ig.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Lg,a.x),r.addScaledVector(Og,a.y),r.addScaledVector(Ig,a.z),r}static isFrontFacing(t,n,i,s){return wi.subVectors(i,n),Es.subVectors(t,n),wi.cross(Es).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return wi.subVectors(this.c,this.b),Es.subVectors(this.a,this.b),wi.cross(Es).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;po.subVectors(s,i),mo.subVectors(a,i),Dg.subVectors(t,i);let l=po.dot(Dg),c=mo.dot(Dg);if(l<=0&&c<=0)return n.copy(i);Ng.subVectors(t,s);let f=po.dot(Ng),p=mo.dot(Ng);if(f>=0&&p<=f)return n.copy(s);let u=l*p-f*c;if(u<=0&&l>=0&&f<=0)return r=l/(l-f),n.copy(i).addScaledVector(po,r);Ug.subVectors(t,a);let d=po.dot(Ug),g=mo.dot(Ug);if(g>=0&&d<=g)return n.copy(a);let M=d*c-l*g;if(M<=0&&c>=0&&g<=0)return o=c/(c-g),n.copy(i).addScaledVector(mo,o);let m=f*g-d*p;if(m<=0&&p-f>=0&&d-g>=0)return hM.subVectors(a,s),o=(p-f)/(p-f+(d-g)),n.copy(s).addScaledVector(hM,o);let h=1/(m+M+u);return r=M*h,o=u*h,n.copy(i).addScaledVector(po,r).addScaledVector(mo,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ls=class{constructor(t=new U(1/0,1/0,1/0),n=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Ci.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Ci.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=Ci.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Ci):Ci.fromBufferAttribute(a,r),Ci.applyMatrix4(t.matrixWorld),this.expandByPoint(Ci);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),wh.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),wh.copy(i.boundingBox)),wh.applyMatrix4(t.matrixWorld),this.union(wh)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ci),Ci.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Kl),Ch.subVectors(this.max,Kl),go.subVectors(t.a,Kl),_o.subVectors(t.b,Kl),vo.subVectors(t.c,Kl),ma.subVectors(_o,go),ga.subVectors(vo,_o),$a.subVectors(go,vo);let n=[0,-ma.z,ma.y,0,-ga.z,ga.y,0,-$a.z,$a.y,ma.z,0,-ma.x,ga.z,0,-ga.x,$a.z,0,-$a.x,-ma.y,ma.x,0,-ga.y,ga.x,0,-$a.y,$a.x,0];return!Pg(n,go,_o,vo,Ch)||(n=[1,0,0,0,1,0,0,0,1],!Pg(n,go,_o,vo,Ch))?!1:(Rh.crossVectors(ma,ga),n=[Rh.x,Rh.y,Rh.z],Pg(n,go,_o,vo,Ch))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ci).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ci).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(As[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),As[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),As[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),As[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),As[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),As[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),As[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),As[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(As),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},As=[new U,new U,new U,new U,new U,new U,new U,new U],Ci=new U,wh=new Ls,go=new U,_o=new U,vo=new U,ma=new U,ga=new U,$a=new U,Kl=new U,Ch=new U,Rh=new U,tr=new U;function Pg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){tr.fromArray(e,a);let o=s.x*Math.abs(tr.x)+s.y*Math.abs(tr.y)+s.z*Math.abs(tr.z),l=t.dot(tr),c=n.dot(tr),f=i.dot(tr);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}var Ke=new U,Dh=new bt,FA=0,Tn=class extends Ni{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:FA++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=uf,this.updateRanges=[],this.gpuType=Oi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Dh.fromBufferAttribute(this,n),Dh.applyMatrix3(t),this.setXY(n,Dh.x,Dh.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Ke.fromBufferAttribute(this,n),Ke.applyMatrix3(t),this.setXYZ(n,Ke.x,Ke.y,Ke.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)Ke.fromBufferAttribute(this,n),Ke.applyMatrix4(t),this.setXYZ(n,Ke.x,Ke.y,Ke.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)Ke.fromBufferAttribute(this,n),Ke.applyNormalMatrix(t),this.setXYZ(n,Ke.x,Ke.y,Ke.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)Ke.fromBufferAttribute(this,n),Ke.transformDirection(t),this.setXYZ(n,Ke.x,Ke.y,Ke.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=Ri(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=oe(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=Ri(n,this.array)),n}setX(t,n){return this.normalized&&(n=oe(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=Ri(n,this.array)),n}setY(t,n){return this.normalized&&(n=oe(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=Ri(n,this.array)),n}setZ(t,n){return this.normalized&&(n=oe(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=Ri(n,this.array)),n}setW(t,n){return this.normalized&&(n=oe(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array),s=oe(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array),s=oe(s,this.array),a=oe(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==uf&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var fc=class extends Tn{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var dc=class extends Tn{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var he=class extends Tn{constructor(t,n,i){super(new Float32Array(t),n,i)}},VA=new Ls,Jl=new U,Bg=new U,or=class{constructor(t=new U,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):VA.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Jl.subVectors(t,this.center);let n=Jl.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(Jl,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Bg.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Jl.copy(t.center).add(Bg)),this.expandByPoint(Jl.copy(t.center).sub(Bg))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},HA=0,xi=new Se,zg=new un,yo=new U,ii=new Ls,jl=new Ls,ln=new U,hn=class e extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:HA++}),this.uuid=Rs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(hA(t)?dc:fc)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Ot().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return xi.makeRotationFromQuaternion(t),this.applyMatrix4(xi),this}rotateX(t){return xi.makeRotationX(t),this.applyMatrix4(xi),this}rotateY(t){return xi.makeRotationY(t),this.applyMatrix4(xi),this}rotateZ(t){return xi.makeRotationZ(t),this.applyMatrix4(xi),this}translate(t,n,i){return xi.makeTranslation(t,n,i),this.applyMatrix4(xi),this}scale(t,n,i){return xi.makeScale(t,n,i),this.applyMatrix4(xi),this}lookAt(t){return zg.lookAt(t),zg.updateMatrix(),this.applyMatrix4(zg.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(yo).negate(),this.translate(yo.x,yo.y,yo.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new he(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&wt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ls);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Rt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];ii.setFromBufferAttribute(a),this.morphTargetsRelative?(ln.addVectors(this.boundingBox.min,ii.min),this.boundingBox.expandByPoint(ln),ln.addVectors(this.boundingBox.max,ii.max),this.boundingBox.expandByPoint(ln)):(this.boundingBox.expandByPoint(ii.min),this.boundingBox.expandByPoint(ii.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Rt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new or);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Rt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){let i=this.boundingSphere.center;if(ii.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];jl.setFromBufferAttribute(o),this.morphTargetsRelative?(ln.addVectors(ii.min,jl.min),ii.expandByPoint(ln),ln.addVectors(ii.max,jl.max),ii.expandByPoint(ln)):(ii.expandByPoint(jl.min),ii.expandByPoint(jl.max))}ii.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)ln.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(ln));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)ln.fromBufferAttribute(o,c),l&&(yo.fromBufferAttribute(t,c),ln.add(yo)),s=Math.max(s,i.distanceToSquared(ln))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Rt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){Rt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new Tn(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let v=0;v<i.count;v++)o[v]=new U,l[v]=new U;let c=new U,f=new U,p=new U,u=new bt,d=new bt,g=new bt,M=new U,m=new U;function h(v,T,D){c.fromBufferAttribute(i,v),f.fromBufferAttribute(i,T),p.fromBufferAttribute(i,D),u.fromBufferAttribute(a,v),d.fromBufferAttribute(a,T),g.fromBufferAttribute(a,D),f.sub(c),p.sub(c),d.sub(u),g.sub(u);let N=1/(d.x*g.y-g.x*d.y);isFinite(N)&&(M.copy(f).multiplyScalar(g.y).addScaledVector(p,-d.y).multiplyScalar(N),m.copy(p).multiplyScalar(d.x).addScaledVector(f,-g.x).multiplyScalar(N),o[v].add(M),o[T].add(M),o[D].add(M),l[v].add(m),l[T].add(m),l[D].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let v=0,T=_.length;v<T;++v){let D=_[v],N=D.start,R=D.count;for(let P=N,G=N+R;P<G;P+=3)h(t.getX(P+0),t.getX(P+1),t.getX(P+2))}let S=new U,y=new U,E=new U,A=new U;function w(v){E.fromBufferAttribute(s,v),A.copy(E);let T=o[v];S.copy(T),S.sub(E.multiplyScalar(E.dot(T))).normalize(),y.crossVectors(A,T);let N=y.dot(l[v])<0?-1:1;r.setXYZW(v,S.x,S.y,S.z,N)}for(let v=0,T=_.length;v<T;++v){let D=_[v],N=D.start,R=D.count;for(let P=N,G=N+R;P<G;P+=3)w(t.getX(P+0)),w(t.getX(P+1)),w(t.getX(P+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new Tn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new U,a=new U,r=new U,o=new U,l=new U,c=new U,f=new U,p=new U;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),M=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(n,g),a.fromBufferAttribute(n,M),r.fromBufferAttribute(n,m),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,M),c.fromBufferAttribute(i,m),o.add(f),l.add(f),c.add(f),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(M,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=n.count;u<d;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),f.subVectors(r,a),p.subVectors(s,a),f.cross(p),i.setXYZ(u+0,f.x,f.y,f.z),i.setXYZ(u+1,f.x,f.y,f.z),i.setXYZ(u+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)ln.fromBufferAttribute(t,n),ln.normalize(),t.setXYZ(n,ln.x,ln.y,ln.z)}toNonIndexed(){function t(o,l){let c=o.array,f=o.itemSize,p=o.normalized,u=new c.constructor(l.length*f),d=0,g=0;for(let M=0,m=l.length;M<m;M++){o.isInterleavedBufferAttribute?d=l[M]*o.data.stride+o.offset:d=l[M]*f;for(let h=0;h<f;h++)u[g++]=c[d++]}return new Tn(u,f,p)}if(this.index===null)return wt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let f=0,p=c.length;f<p;f++){let u=c[f],d=t(u,i);l.push(d)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let p=0,u=c.length;p<u;p++){let d=c[p];f.push(d.toJSON(t.data))}f.length>0&&(s[l]=f,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(n))}let a=t.morphAttributes;for(let c in a){let f=[],p=a[c];for(let u=0,d=p.length;u<d;u++)f.push(p[u].clone(n));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,f=r.length;c<f;c++){let p=r[c];this.addGroup(p.start,p.count,p.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},pf=class{constructor(t,n){this.isInterleavedBuffer=!0,this.array=t,this.stride=n,this.count=t!==void 0?t.length/n:0,this.usage=uf,this.updateRanges=[],this.version=0,this.uuid=Rs()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,n,i){t*=this.stride,i*=n.stride;for(let s=0,a=this.stride;s<a;s++)this.array[t+s]=n.array[i+s];return this}set(t,n=0){return this.array.set(t,n),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let n=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Dn=new U,pc=class e{constructor(t,n,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=n,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let n=0,i=this.data.count;n<i;n++)Dn.fromBufferAttribute(this,n),Dn.applyMatrix4(t),this.setXYZ(n,Dn.x,Dn.y,Dn.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)Dn.fromBufferAttribute(this,n),Dn.applyNormalMatrix(t),this.setXYZ(n,Dn.x,Dn.y,Dn.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)Dn.fromBufferAttribute(this,n),Dn.transformDirection(t),this.setXYZ(n,Dn.x,Dn.y,Dn.z);return this}getComponent(t,n){let i=this.array[t*this.data.stride+this.offset+n];return this.normalized&&(i=Ri(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=oe(i,this.array)),this.data.array[t*this.data.stride+this.offset+n]=i,this}setX(t,n){return this.normalized&&(n=oe(n,this.array)),this.data.array[t*this.data.stride+this.offset]=n,this}setY(t,n){return this.normalized&&(n=oe(n,this.array)),this.data.array[t*this.data.stride+this.offset+1]=n,this}setZ(t,n){return this.normalized&&(n=oe(n,this.array)),this.data.array[t*this.data.stride+this.offset+2]=n,this}setW(t,n){return this.normalized&&(n=oe(n,this.array)),this.data.array[t*this.data.stride+this.offset+3]=n,this}getX(t){let n=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(n=Ri(n,this.array)),n}getY(t){let n=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(n=Ri(n,this.array)),n}getZ(t){let n=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(n=Ri(n,this.array)),n}getW(t){let n=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(n=Ri(n,this.array)),n}setXY(t,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=i,this}setXYZ(t,n,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array),s=oe(s,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t=t*this.data.stride+this.offset,this.normalized&&(n=oe(n,this.array),i=oe(i,this.array),s=oe(s,this.array),a=oe(a,this.array)),this.data.array[t+0]=n,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=a,this}clone(t){if(t===void 0){lc("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)n.push(this.data.array[s+a])}return new Tn(new this.array.constructor(n),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){lc("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)n.push(this.data.array[s+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},GA=0,ji=class extends Ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:GA++}),this.uuid=Rs(),this.name="",this.type="Material",this.blending=ar,this.side=Ns,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jh,this.blendDst=Qh,this.blendEquation=ya,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new It(0,0,0),this.blendAlpha=0,this.depthFunc=rr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jg,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ir,this.stencilZFail=ir,this.stencilZPass=ir,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){wt(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){wt(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ar&&(i.blending=this.blending),this.side!==Ns&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==jh&&(i.blendSrc=this.blendSrc),this.blendDst!==Qh&&(i.blendDst=this.blendDst),this.blendEquation!==ya&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==rr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jg&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ir&&(i.stencilFail=this.stencilFail),this.stencilZFail!==ir&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==ir&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new It().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new bt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new bt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Lo=class extends ji{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new It(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},xo,Ql=new U,So=new U,Mo=new U,bo=new bt,$l=new bt,ub=new Se,Nh=new U,tc=new U,Uh=new U,fM=new bt,Fg=new bt,dM=new bt,lr=class extends un{constructor(t=new Lo){if(super(),this.isSprite=!0,this.type="Sprite",xo===void 0){xo=new hn;let n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new pf(n,5);xo.setIndex([0,1,2,0,2,3]),xo.setAttribute("position",new pc(i,3,0,!1)),xo.setAttribute("uv",new pc(i,2,3,!1))}this.geometry=xo,this.material=t,this.center=new bt(.5,.5),this.count=1}raycast(t,n){t.camera===null&&Rt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),So.setFromMatrixScale(this.matrixWorld),ub.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Mo.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&So.multiplyScalar(-Mo.z);let i=this.material.rotation,s,a;i!==0&&(a=Math.cos(i),s=Math.sin(i));let r=this.center;Lh(Nh.set(-.5,-.5,0),Mo,r,So,s,a),Lh(tc.set(.5,-.5,0),Mo,r,So,s,a),Lh(Uh.set(.5,.5,0),Mo,r,So,s,a),fM.set(0,0),Fg.set(1,0),dM.set(1,1);let o=t.ray.intersectTriangle(Nh,tc,Uh,!1,Ql);if(o===null&&(Lh(tc.set(-.5,.5,0),Mo,r,So,s,a),Fg.set(0,1),o=t.ray.intersectTriangle(Nh,Uh,tc,!1,Ql),o===null))return;let l=t.ray.origin.distanceTo(Ql);l<t.near||l>t.far||n.push({distance:l,point:Ql.clone(),uv:Cs.getInterpolation(Ql,Nh,tc,Uh,fM,Fg,dM,new bt),face:null,object:this})}copy(t,n){return super.copy(t,n),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Lh(e,t,n,i,s,a){bo.subVectors(e,n).addScalar(.5).multiply(i),s!==void 0?($l.x=a*bo.x-s*bo.y,$l.y=s*bo.x+a*bo.y):$l.copy(bo),e.copy(t),e.x+=$l.x,e.y+=$l.y,e.applyMatrix4(ub)}var ws=new U,Vg=new U,Oh=new U,_a=new U,Hg=new U,Ih=new U,Gg=new U,xa=class{constructor(t=new U,n=new U(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ws)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=ws.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(ws.copy(this.origin).addScaledVector(this.direction,n),ws.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){Vg.copy(t).add(n).multiplyScalar(.5),Oh.copy(n).sub(t).normalize(),_a.copy(this.origin).sub(Vg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(Oh),o=_a.dot(this.direction),l=-_a.dot(Oh),c=_a.lengthSq(),f=Math.abs(1-r*r),p,u,d,g;if(f>0)if(p=r*l-o,u=r*o-l,g=a*f,p>=0)if(u>=-g)if(u<=g){let M=1/f;p*=M,u*=M,d=p*(p+r*u+2*o)+u*(r*p+u+2*l)+c}else u=a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;else u<=-g?(p=Math.max(0,-(-r*a+o)),u=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c):u<=g?(p=0,u=Math.min(Math.max(-a,-l),a),d=u*(u+2*l)+c):(p=Math.max(0,-(r*a+o)),u=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+u*(u+2*l)+c);else u=r>0?-a:a,p=Math.max(0,-(r*u+o)),d=-p*p+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Vg).addScaledVector(Oh,u),d}intersectSphere(t,n){ws.subVectors(t.center,this.origin);let i=ws.dot(this.direction),s=ws.dot(ws)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),f>=0?(a=(t.min.y-u.y)*f,r=(t.max.y-u.y)*f):(a=(t.max.y-u.y)*f,r=(t.min.y-u.y)*f),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),p>=0?(o=(t.min.z-u.z)*p,l=(t.max.z-u.z)*p):(o=(t.max.z-u.z)*p,l=(t.min.z-u.z)*p),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,ws)!==null}intersectTriangle(t,n,i,s,a){Hg.subVectors(n,t),Ih.subVectors(i,t),Gg.crossVectors(Hg,Ih);let r=this.direction.dot(Gg),o;if(r>0){if(s)return null;o=1}else if(r<0)o=-1,r=-r;else return null;_a.subVectors(this.origin,t);let l=o*this.direction.dot(Ih.crossVectors(_a,Ih));if(l<0)return null;let c=o*this.direction.dot(Hg.cross(_a));if(c<0||l+c>r)return null;let f=-o*_a.dot(Gg);return f<0?null:this.at(f/r,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},cr=class extends ji{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new It(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Us,this.combine=o0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},pM=new Se,er=new xa,Ph=new or,mM=new U,Bh=new U,zh=new U,Fh=new U,kg=new U,Vh=new U,gM=new U,Hh=new U,Je=class extends un{constructor(t=new hn,n=new cr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){Vh.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let f=o[l],p=a[l];f!==0&&(kg.fromBufferAttribute(p,t),r?Vh.addScaledVector(kg,f):Vh.addScaledVector(kg.sub(n),f))}n.add(Vh)}return n}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ph.copy(i.boundingSphere),Ph.applyMatrix4(a),er.copy(t.ray).recast(t.near),!(Ph.containsPoint(er.origin)===!1&&(er.intersectSphere(Ph,mM)===null||er.origin.distanceToSquared(mM)>(t.far-t.near)**2))&&(pM.copy(a).invert(),er.copy(t.ray).applyMatrix4(pM),!(i.boundingBox!==null&&er.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,er)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,f=a.attributes.uv1,p=a.attributes.normal,u=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,M=u.length;g<M;g++){let m=u[g],h=r[m.materialIndex],_=Math.max(m.start,d.start),S=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=_,E=S;y<E;y+=3){let A=o.getX(y),w=o.getX(y+1),v=o.getX(y+2);s=Gh(this,h,t,i,c,f,p,A,w,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),M=Math.min(o.count,d.start+d.count);for(let m=g,h=M;m<h;m+=3){let _=o.getX(m),S=o.getX(m+1),y=o.getX(m+2);s=Gh(this,r,t,i,c,f,p,_,S,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,M=u.length;g<M;g++){let m=u[g],h=r[m.materialIndex],_=Math.max(m.start,d.start),S=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=_,E=S;y<E;y+=3){let A=y,w=y+1,v=y+2;s=Gh(this,h,t,i,c,f,p,A,w,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let g=Math.max(0,d.start),M=Math.min(l.count,d.start+d.count);for(let m=g,h=M;m<h;m+=3){let _=m,S=m+1,y=m+2;s=Gh(this,r,t,i,c,f,p,_,S,y),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function kA(e,t,n,i,s,a,r,o){let l;if(t.side===Un?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===Ns,o),l===null)return null;Hh.copy(o),Hh.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(Hh);return c<n.near||c>n.far?null:{distance:c,point:Hh.clone(),object:e}}function Gh(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,Bh),e.getVertexPosition(l,zh),e.getVertexPosition(c,Fh);let f=kA(e,t,n,i,Bh,zh,Fh,gM);if(f){let p=new U;Cs.getBarycoord(gM,Bh,zh,Fh,p),s&&(f.uv=Cs.getInterpolatedAttribute(s,o,l,c,p,new bt)),a&&(f.uv1=Cs.getInterpolatedAttribute(a,o,l,c,p,new bt)),r&&(f.normal=Cs.getInterpolatedAttribute(r,o,l,c,p,new U),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new U,materialIndex:0};Cs.getNormal(Bh,zh,Fh,u.normal),f.face=u,f.barycoord=p}return f}var mf=class extends Nn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=cn,f=cn,p,u){super(null,r,o,l,c,f,s,a,p,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Xg=new U,XA=new U,WA=new Ot,Si=class{constructor(t=new U(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=Xg.subVectors(i,n).cross(XA.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(Xg),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||WA.getNormalMatrix(t),s=this.coplanarPoint(Xg).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},nr=new or,qA=new bt(.5,.5),kh=new U,Oo=class{constructor(t=new Si,n=new Si,i=new Si,s=new Si,a=new Si,r=new Si){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Di,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],f=a[4],p=a[5],u=a[6],d=a[7],g=a[8],M=a[9],m=a[10],h=a[11],_=a[12],S=a[13],y=a[14],E=a[15];if(s[0].setComponents(c-r,d-f,h-g,E-_).normalize(),s[1].setComponents(c+r,d+f,h+g,E+_).normalize(),s[2].setComponents(c+o,d+p,h+M,E+S).normalize(),s[3].setComponents(c-o,d-p,h-M,E-S).normalize(),i)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,d-u,h-m,E-y).normalize();else if(s[4].setComponents(c-l,d-u,h-m,E-y).normalize(),n===Di)s[5].setComponents(c+l,d+u,h+m,E+y).normalize();else if(n===wo)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),nr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),nr.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(nr)}intersectsSprite(t){nr.center.set(0,0,0);let n=qA.distanceTo(t.center);return nr.radius=.7071067811865476+n,nr.applyMatrix4(t.matrixWorld),this.intersectsSphere(nr)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(kh.x=s.normal.x>0?t.max.x:t.min.x,kh.y=s.normal.y>0?t.max.y:t.min.y,kh.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(kh)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Io=class extends ji{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new It(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},gf=new U,_f=new U,_M=new Se,ec=new xa,Xh=new or,Wg=new U,vM=new U,vf=class extends un{constructor(t=new hn,n=new Io){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[0];for(let s=1,a=n.count;s<a;s++)gf.fromBufferAttribute(n,s-1),_f.fromBufferAttribute(n,s),i[s]=i[s-1],i[s]+=gf.distanceTo(_f);t.setAttribute("lineDistance",new he(i,1))}else wt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,n){let i=this.geometry,s=this.matrixWorld,a=t.params.Line.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Xh.copy(i.boundingSphere),Xh.applyMatrix4(s),Xh.radius+=a,t.ray.intersectsSphere(Xh)===!1)return;_M.copy(s).invert(),ec.copy(t.ray).applyMatrix4(_M);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,f=i.index,u=i.attributes.position;if(f!==null){let d=Math.max(0,r.start),g=Math.min(f.count,r.start+r.count);for(let M=d,m=g-1;M<m;M+=c){let h=f.getX(M),_=f.getX(M+1),S=Wh(this,t,ec,l,h,_,M);S&&n.push(S)}if(this.isLineLoop){let M=f.getX(g-1),m=f.getX(d),h=Wh(this,t,ec,l,M,m,g-1);h&&n.push(h)}}else{let d=Math.max(0,r.start),g=Math.min(u.count,r.start+r.count);for(let M=d,m=g-1;M<m;M+=c){let h=Wh(this,t,ec,l,M,M+1,M);h&&n.push(h)}if(this.isLineLoop){let M=Wh(this,t,ec,l,g-1,d,g-1);M&&n.push(M)}}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}};function Wh(e,t,n,i,s,a,r){let o=e.geometry.attributes.position;if(gf.fromBufferAttribute(o,s),_f.fromBufferAttribute(o,a),n.distanceSqToSegment(gf,_f,Wg,vM)>i)return;Wg.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Wg);if(!(c<t.near||c>t.far))return{distance:c,point:vM.clone().applyMatrix4(e.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:e}}var yM=new U,xM=new U,mc=class extends vf{constructor(t,n){super(t,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[];for(let s=0,a=n.count;s<a;s+=2)yM.fromBufferAttribute(n,s),xM.fromBufferAttribute(n,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+yM.distanceTo(xM);t.setAttribute("lineDistance",new he(i,1))}else wt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var gc=class extends Nn{constructor(t=[],n=wa,i,s,a,r,o,l,c,f){super(t,n,i,s,a,r,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},_c=class extends Nn{constructor(t,n,i,s,a,r,o,l,c){super(t,n,i,s,a,r,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Os=class extends Nn{constructor(t,n,i=Li,s,a,r,o=cn,l=cn,c,f=Ji,p=1){if(f!==Ji&&f!==Ra)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:p};super(u,s,a,r,o,l,f,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Do(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}},yf=class extends Os{constructor(t,n=Li,i=wa,s,a,r=cn,o=cn,l,c=Ji){let f={width:t,height:t,depth:1},p=[f,f,f,f,f,f];super(t,t,n,i,s,a,r,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},vc=class extends Nn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Sa=class e extends hn{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],f=[],p=[],u=0,d=0;g("z","y","x",-1,-1,i,n,t,r,a,0),g("z","y","x",1,-1,i,n,-t,r,a,1),g("x","z","y",1,1,t,i,n,s,r,2),g("x","z","y",1,-1,t,i,-n,s,r,3),g("x","y","z",1,-1,t,n,i,s,a,4),g("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(f,3)),this.setAttribute("uv",new he(p,2));function g(M,m,h,_,S,y,E,A,w,v,T){let D=y/w,N=E/v,R=y/2,P=E/2,G=A/2,z=w+1,k=v+1,q=0,K=0,nt=new U;for(let ut=0;ut<k;ut++){let ht=ut*N-P;for(let yt=0;yt<z;yt++){let jt=yt*D-R;nt[M]=jt*_,nt[m]=ht*S,nt[h]=G,c.push(nt.x,nt.y,nt.z),nt[M]=0,nt[m]=0,nt[h]=A>0?1:-1,f.push(nt.x,nt.y,nt.z),p.push(yt/w),p.push(1-ut/v),q+=1}}for(let ut=0;ut<v;ut++)for(let ht=0;ht<w;ht++){let yt=u+ht+z*ut,jt=u+ht+z*(ut+1),Re=u+(ht+1)+z*(ut+1),Jt=u+(ht+1)+z*ut;l.push(yt,jt,Jt),l.push(jt,Re,Jt),K+=6}o.addGroup(d,K,T),d+=K,u+=q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},yc=class e extends hn{constructor(t=1,n=1,i=4,s=8,a=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:n,capSegments:i,radialSegments:s,heightSegments:a},n=Math.max(0,n),i=Math.max(1,Math.floor(i)),s=Math.max(3,Math.floor(s)),a=Math.max(1,Math.floor(a));let r=[],o=[],l=[],c=[],f=n/2,p=Math.PI/2*t,u=n,d=2*p+u,g=i*2+a,M=s+1,m=new U,h=new U;for(let _=0;_<=g;_++){let S=0,y=0,E=0,A=0;if(_<=i){let T=_/i,D=T*Math.PI/2;y=-f-t*Math.cos(D),E=t*Math.sin(D),A=-t*Math.cos(D),S=T*p}else if(_<=i+a){let T=(_-i)/a;y=-f+T*n,E=t,A=0,S=p+T*u}else{let T=(_-i-a)/i,D=T*Math.PI/2;y=f+t*Math.sin(D),E=t*Math.cos(D),A=t*Math.sin(D),S=p+u+T*p}let w=Math.max(0,Math.min(1,S/d)),v=0;_===0?v=.5/s:_===g&&(v=-.5/s);for(let T=0;T<=s;T++){let D=T/s,N=D*Math.PI*2,R=Math.sin(N),P=Math.cos(N);h.x=-E*P,h.y=y,h.z=E*R,o.push(h.x,h.y,h.z),m.set(-E*P,A,E*R),m.normalize(),l.push(m.x,m.y,m.z),c.push(D+v,w)}if(_>0){let T=(_-1)*M;for(let D=0;D<s;D++){let N=T+D,R=T+D+1,P=_*M+D,G=_*M+D+1;r.push(N,R,P),r.push(R,G,P)}}}this.setIndex(r),this.setAttribute("position",new he(o,3)),this.setAttribute("normal",new he(l,3)),this.setAttribute("uv",new he(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},xc=class e extends hn{constructor(t=1,n=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:n,thetaStart:i,thetaLength:s},n=Math.max(3,n);let a=[],r=[],o=[],l=[],c=new U,f=new bt;r.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let p=0,u=3;p<=n;p++,u+=3){let d=i+p/n*s;c.x=t*Math.cos(d),c.y=t*Math.sin(d),r.push(c.x,c.y,c.z),o.push(0,0,1),f.x=(r[u]/t+1)/2,f.y=(r[u+1]/t+1)/2,l.push(f.x,f.y)}for(let p=1;p<=n;p++)a.push(p,p+1,0);this.setIndex(a),this.setAttribute("position",new he(r,3)),this.setAttribute("normal",new he(o,3)),this.setAttribute("uv",new he(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Sc=class e extends hn{constructor(t=1,n=1,i=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:n,height:i,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let f=[],p=[],u=[],d=[],g=0,M=[],m=i/2,h=0;_(),r===!1&&(t>0&&S(!0),n>0&&S(!1)),this.setIndex(f),this.setAttribute("position",new he(p,3)),this.setAttribute("normal",new he(u,3)),this.setAttribute("uv",new he(d,2));function _(){let y=new U,E=new U,A=0,w=(n-t)/i;for(let v=0;v<=a;v++){let T=[],D=v/a,N=D*(n-t)+t;for(let R=0;R<=s;R++){let P=R/s,G=P*l+o,z=Math.sin(G),k=Math.cos(G);E.x=N*z,E.y=-D*i+m,E.z=N*k,p.push(E.x,E.y,E.z),y.set(z,w,k).normalize(),u.push(y.x,y.y,y.z),d.push(P,1-D),T.push(g++)}M.push(T)}for(let v=0;v<s;v++)for(let T=0;T<a;T++){let D=M[T][v],N=M[T+1][v],R=M[T+1][v+1],P=M[T][v+1];(t>0||T!==0)&&(f.push(D,N,P),A+=3),(n>0||T!==a-1)&&(f.push(N,R,P),A+=3)}c.addGroup(h,A,0),h+=A}function S(y){let E=g,A=new bt,w=new U,v=0,T=y===!0?t:n,D=y===!0?1:-1;for(let R=1;R<=s;R++)p.push(0,m*D,0),u.push(0,D,0),d.push(.5,.5),g++;let N=g;for(let R=0;R<=s;R++){let G=R/s*l+o,z=Math.cos(G),k=Math.sin(G);w.x=T*k,w.y=m*D,w.z=T*z,p.push(w.x,w.y,w.z),u.push(0,D,0),A.x=z*.5+.5,A.y=k*.5*D+.5,d.push(A.x,A.y),g++}for(let R=0;R<s;R++){let P=E+R,G=N+R;y===!0?f.push(G,G+1,P):f.push(G+1,G,P),v+=3}c.addGroup(h,v,y===!0?1:2),h+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Mc=class e extends hn{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,f=l+1,p=t/o,u=n/l,d=[],g=[],M=[],m=[];for(let h=0;h<f;h++){let _=h*u-r;for(let S=0;S<c;S++){let y=S*p-a;g.push(y,-_,0),M.push(0,0,1),m.push(S/o),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let _=0;_<o;_++){let S=_+c*h,y=_+c*(h+1),E=_+1+c*(h+1),A=_+1+c*h;d.push(S,y,A),d.push(y,E,A)}this.setIndex(d),this.setAttribute("position",new he(g,3)),this.setAttribute("normal",new he(M,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var bc=class e extends hn{constructor(t=1,n=.4,i=12,s=48,a=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:n,radialSegments:i,tubularSegments:s,arc:a,thetaStart:r,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],f=[],p=[],u=new U,d=new U,g=new U;for(let M=0;M<=i;M++){let m=r+M/i*o;for(let h=0;h<=s;h++){let _=h/s*a;d.x=(t+n*Math.cos(m))*Math.cos(_),d.y=(t+n*Math.cos(m))*Math.sin(_),d.z=n*Math.sin(m),c.push(d.x,d.y,d.z),u.x=t*Math.cos(_),u.y=t*Math.sin(_),g.subVectors(d,u).normalize(),f.push(g.x,g.y,g.z),p.push(h/s),p.push(M/i)}}for(let M=1;M<=i;M++)for(let m=1;m<=s;m++){let h=(s+1)*M+m-1,_=(s+1)*(M-1)+m-1,S=(s+1)*(M-1)+m,y=(s+1)*M+m;l.push(h,_,y),l.push(_,S,y)}this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(f,3)),this.setAttribute("uv",new he(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function hr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(SM(s))s.isRenderTargetTexture?(wt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(SM(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function An(e){let t={};for(let n=0;n<e.length;n++){let i=hr(e[n]);for(let s in i)t[s]=i[s]}return t}function SM(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function YA(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function T0(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Zt.workingColorSpace}var hb={clone:hr,merge:An},ZA=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,KA=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ri=class extends ji{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ZA,this.fragmentShader=KA,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=hr(t.uniforms),this.uniformsGroups=YA(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new It().setHex(s.value);break;case"v2":this.uniforms[i].value=new bt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new U().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Ue().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ot().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Se().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},xf=class extends ri{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Po=class extends ji{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new It(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new It(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Md,this.normalScale=new bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Us,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Sf=class extends ji{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=jM,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Mf=class extends ji{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function qh(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}var Ma=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},bf=class extends Ma{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Zg,endingEnd:Zg}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Kg:a=t,o=2*n-i;break;case Jg:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Kg:r=t,l=2*i-n;break;case Jg:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,f=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*f,this._offsetNext=r*f}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(i-n)/(s-n),M=g*g,m=M*g,h=-u*m+2*u*M-u*g,_=(1+u)*m+(-1.5-2*u)*M+(-.5+u)*g+1,S=(-1-d)*m+(1.5+d)*M+.5*g,y=d*m-d*M;for(let E=0;E!==o;++E)a[E]=h*r[f+E]+_*r[c+E]+S*r[l+E]+y*r[p+E];return a}},Ef=class extends Ma{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=(i-n)/(s-n),p=1-f;for(let u=0;u!==o;++u)a[u]=r[c+u]*p+r[l+u]*f;return a}},Tf=class extends Ma{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Af=class extends Ma{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,f=this.inTangents,p=this.outTangents;if(!f||!p){let g=(i-n)/(s-n),M=1-g;for(let m=0;m!==o;++m)a[m]=r[c+m]*M+r[l+m]*g;return a}let u=o*2,d=t-1;for(let g=0;g!==o;++g){let M=r[c+g],m=r[l+g],h=d*u+g*2,_=p[h],S=p[h+1],y=t*u+g*2,E=f[y],A=f[y+1],w=(i-n)/(s-n),v,T,D,N,R;for(let P=0;P<8;P++){v=w*w,T=v*w,D=1-w,N=D*D,R=N*D;let z=R*n+3*N*w*_+3*D*v*E+T*s-i;if(Math.abs(z)<1e-10)break;let k=3*N*(_-n)+6*D*w*(E-_)+3*v*(s-E);if(Math.abs(k)<1e-10)break;w=w-z/k,w=Math.max(0,Math.min(1,w))}a[g]=R*M+3*N*w*S+3*D*v*A+T*m}return a}},oi=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=qh(n,this.TimeBufferType),this.values=qh(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:qh(t.times,Array),values:qh(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Tf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ef(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new bf(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new Af(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case sc:n=this.InterpolantFactoryMethodDiscrete;break;case cf:n=this.InterpolantFactoryMethodLinear;break;case Jh:n=this.InterpolantFactoryMethodSmooth;break;case Yg:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return wt("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return sc;case this.InterpolantFactoryMethodLinear:return cf;case this.InterpolantFactoryMethodSmooth:return Jh;case this.InterpolantFactoryMethodBezier:return Yg}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(Rt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Rt("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Rt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Rt("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&fA(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Rt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Jh,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],f=t[o+1];if(c!==f&&(o!==1||c!==t[0]))if(s)l=!0;else{let p=o*i,u=p-i,d=p+i;for(let g=0;g!==i;++g){let M=n[p+g];if(M!==n[u+g]||M!==n[d+g]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let p=o*i,u=r*i;for(let d=0;d!==i;++d)n[u+d]=n[p+d]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,s}};oi.prototype.ValueTypeName="";oi.prototype.TimeBufferType=Float32Array;oi.prototype.ValueBufferType=Float32Array;oi.prototype.DefaultInterpolation=cf;var ba=class extends oi{constructor(t,n,i){super(t,n,i)}};ba.prototype.ValueTypeName="bool";ba.prototype.ValueBufferType=Array;ba.prototype.DefaultInterpolation=sc;ba.prototype.InterpolantFactoryMethodLinear=void 0;ba.prototype.InterpolantFactoryMethodSmooth=void 0;var wf=class extends oi{constructor(t,n,i,s){super(t,n,i,s)}};wf.prototype.ValueTypeName="color";var Cf=class extends oi{constructor(t,n,i,s){super(t,n,i,s)}};Cf.prototype.ValueTypeName="number";var Rf=class extends Ma{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let f=c+o;c!==f;c+=4)si.slerpFlat(a,0,r,c-o,r,c,l);return a}},Ec=class extends oi{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new Rf(this.times,this.values,this.getValueSize(),t)}};Ec.prototype.ValueTypeName="quaternion";Ec.prototype.InterpolantFactoryMethodSmooth=void 0;var Ea=class extends oi{constructor(t,n,i){super(t,n,i)}};Ea.prototype.ValueTypeName="string";Ea.prototype.ValueBufferType=Array;Ea.prototype.DefaultInterpolation=sc;Ea.prototype.InterpolantFactoryMethodLinear=void 0;Ea.prototype.InterpolantFactoryMethodSmooth=void 0;var Df=class extends oi{constructor(t,n,i,s){super(t,n,i,s)}};Df.prototype.ValueTypeName="vector";var Nf=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(f){o++,a===!1&&s.onStart!==void 0&&s.onStart(f,r,o),a=!0},this.itemEnd=function(f){r++,s.onProgress!==void 0&&s.onProgress(f,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,p){return c.push(f,p),this},this.removeHandler=function(f){let p=c.indexOf(f);return p!==-1&&c.splice(p,2),this},this.getHandler=function(f){for(let p=0,u=c.length;p<u;p+=2){let d=c[p],g=c[p+1];if(d.global&&(d.lastIndex=0),d.test(f))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},fb=new Nf,Uf=class{constructor(t){this.manager=t!==void 0?t:fb,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Uf.DEFAULT_MATERIAL_NAME="__DEFAULT";var Bo=class extends un{constructor(t,n=1){super(),this.isLight=!0,this.type="Light",this.color=new It(t),this.intensity=n}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,n){return super.copy(t,n),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let n=super.toJSON(t);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}},Tc=class extends Bo{constructor(t,n,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(un.DEFAULT_UP),this.updateMatrix(),this.groundColor=new It(n)}copy(t,n){return super.copy(t,n),this.groundColor.copy(t.groundColor),this}toJSON(t){let n=super.toJSON(t);return n.object.groundColor=this.groundColor.getHex(),n}},qg=new Se,MM=new U,bM=new U,Lf=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new bt(512,512),this.mapType=Gn,this.map=null,this.mapPass=null,this.matrix=new Se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oo,this._frameExtents=new bt(1,1),this._viewportCount=1,this._viewports=[new Ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let n=this.camera,i=this.matrix;MM.setFromMatrixPosition(t.matrixWorld),n.position.copy(MM),bM.setFromMatrixPosition(t.target.matrixWorld),n.lookAt(bM),n.updateMatrixWorld(),qg.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(qg,n.coordinateSystem,n.reversedDepth),n.coordinateSystem===wo||n.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(qg)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Yh=new U,Zh=new si,Yi=new U,Ac=class extends un{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Se,this.projectionMatrix=new Se,this.projectionMatrixInverse=new Se,this.coordinateSystem=Di,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Yh,Zh,Yi),Yi.x===1&&Yi.y===1&&Yi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Yh,Zh,Yi.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(Yh,Zh,Yi),Yi.x===1&&Yi.y===1&&Yi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Yh,Zh,Yi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},va=new U,EM=new bt,TM=new bt,vn=class extends Ac{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=Ro*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(nc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ro*2*Math.atan(Math.tan(nc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){va.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(va.x,va.y).multiplyScalar(-t/va.z),va.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(va.x,va.y).multiplyScalar(-t/va.z)}getViewSize(t,n){return this.getViewBounds(t,EM,TM),n.subVectors(TM,EM)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(nc*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var Qg=class extends Lf{constructor(){super(new vn(90,1,.5,500)),this.isPointLightShadow=!0}},wc=class extends Bo{constructor(t,n,i=0,s=2){super(t,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Qg}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,n){return super.copy(t,n),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.distance=this.distance,n.object.decay=this.decay,n.object.shadow=this.shadow.toJSON(),n}},zo=class extends Ac{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},$g=class extends Lf{constructor(){super(new zo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Fo=class extends Bo{constructor(t,n){super(t,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(un.DEFAULT_UP),this.updateMatrix(),this.target=new un,this.shadow=new $g}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}};var Eo=-90,To=1,Of=class extends un{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new vn(Eo,To,t,n);s.layers=this.layers,this.add(s);let a=new vn(Eo,To,t,n);a.layers=this.layers,this.add(a);let r=new vn(Eo,To,t,n);r.layers=this.layers,this.add(r);let o=new vn(Eo,To,t,n);o.layers=this.layers,this.add(o);let l=new vn(Eo,To,t,n);l.layers=this.layers,this.add(l);let c=new vn(Eo,To,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Di)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===wo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,f]=this.children,p=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let M=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=M,t.setRenderTarget(i,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(n,f),t.setRenderTarget(p,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},If=class extends vn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var A0="\\[\\]\\.:\\/",JA=new RegExp("["+A0+"]","g"),w0="[^"+A0+"]",jA="[^"+A0.replace("\\.","")+"]",QA=/((?:WC+[\/:])*)/.source.replace("WC",w0),$A=/(WCOD+)?/.source.replace("WCOD",jA),tw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",w0),ew=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",w0),nw=new RegExp("^"+QA+$A+tw+ew+"$"),iw=["material","materials","bones","map"],t0=class{constructor(t,n,i){let s=i||Ae.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},Ae=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(JA,"")}static parseTrackName(t){let n=nw.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);iw.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){wt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){Rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Rt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Rt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Rt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Rt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Rt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;Rt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ae.Composite=t0;Ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ae.prototype.GetterByBindingType=[Ae.prototype._getValue_direct,Ae.prototype._getValue_array,Ae.prototype._getValue_arrayElement,Ae.prototype._getValue_toArray];Ae.prototype.SetterByBindingTypeAndVersioning=[[Ae.prototype._setValue_direct,Ae.prototype._setValue_direct_setNeedsUpdate,Ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_array,Ae.prototype._setValue_array_setNeedsUpdate,Ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_arrayElement,Ae.prototype._setValue_arrayElement_setNeedsUpdate,Ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_fromArray,Ae.prototype._setValue_fromArray_setNeedsUpdate,Ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var bD=new Float32Array(1);var AM=new Se,Cc=class{constructor(t,n,i=0,s=1/0){this.ray=new xa(t,n),this.near=i,this.far=s,this.camera=null,this.layers=new No,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,n){this.ray.set(t,n)}setFromCamera(t,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,n.projectionMatrix.elements[14]).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):Rt("Raycaster: Unsupported camera type: "+n.type)}setFromXRController(t){return AM.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(AM),this}intersectObject(t,n=!0,i=[]){return e0(t,this,i,n),i.sort(wM),i}intersectObjects(t,n=!0,i=[]){for(let s=0,a=t.length;s<a;s++)e0(t[s],this,i,n);return i.sort(wM),i}};function wM(e,t){return e.distance-t.distance}function e0(e,t,n,i){let s=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(s=!1),s===!0&&i===!0){let a=e.children;for(let r=0,o=a.length;r<o;r++)e0(a[r],t,n,!0)}}var Rc=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,wt("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let n=performance.now();t=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=t}return t}},Vo=class{constructor(t=1,n=0,i=0){this.radius=t,this.phi=n,this.theta=i}set(t,n,i){return this.radius=t,this.phi=n,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=kt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,n,i){return this.radius=Math.sqrt(t*t+n*n+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(kt(n/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var n0=class e{static{e.prototype.isMatrix2=!0}constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};var Dc=class extends mc{constructor(t=10,n=10,i=4473924,s=8947848){i=new It(i),s=new It(s);let a=n/2,r=t/n,o=t/2,l=[],c=[];for(let u=0,d=0,g=-o;u<=n;u++,g+=r){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);let M=u===a?i:s;M.toArray(c,d),d+=3,M.toArray(c,d),d+=3,M.toArray(c,d),d+=3,M.toArray(c,d),d+=3}let f=new hn;f.setAttribute("position",new he(l,3)),f.setAttribute("color",new he(c,3));let p=new Io({vertexColors:!0,toneMapped:!1});super(f,p),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};var Kh=new Ls,Nc=class extends mc{constructor(t,n=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),a=new hn;a.setIndex(new Tn(i,1)),a.setAttribute("position",new Tn(s,3)),super(a,new Io({color:n,toneMapped:!1})),this.object=t,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&Kh.setFromObject(this.object),Kh.isEmpty())return;let t=Kh.min,n=Kh.max,i=this.geometry.attributes.position,s=i.array;s[0]=n.x,s[1]=n.y,s[2]=n.z,s[3]=t.x,s[4]=n.y,s[5]=n.z,s[6]=t.x,s[7]=t.y,s[8]=n.z,s[9]=n.x,s[10]=t.y,s[11]=n.z,s[12]=n.x,s[13]=n.y,s[14]=t.z,s[15]=t.x,s[16]=n.y,s[17]=t.z,s[18]=t.x,s[19]=t.y,s[20]=t.z,s[21]=n.x,s[22]=t.y,s[23]=t.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(t){return this.object=t,this.update(),this}copy(t,n){return super.copy(t,n),this.object=t.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}};var Uc=class extends Ni{constructor(t,n=null){super(),this.object=t,this.domElement=n,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){wt("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function C0(e,t,n,i){let s=sw(i);switch(n){case y0:return e*t;case S0:return e*t/s.components*s.byteLength;case kf:return e*t/s.components*s.byteLength;case Da:return e*t*2/s.components*s.byteLength;case Xf:return e*t*2/s.components*s.byteLength;case x0:return e*t*3/s.components*s.byteLength;case Mi:return e*t*4/s.components*s.byteLength;case Wf:return e*t*4/s.components*s.byteLength;case Bc:case zc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Fc:case Vc:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Yf:case Kf:return Math.max(e,16)*Math.max(t,8)/4;case qf:case Zf:return Math.max(e,8)*Math.max(t,8)/2;case Jf:case jf:case $f:case td:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Qf:case Hc:case ed:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case nd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case id:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case sd:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ad:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case rd:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case od:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ld:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case cd:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ud:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case hd:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case fd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case dd:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case pd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case md:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case gd:case _d:case vd:return Math.ceil(e/4)*Math.ceil(t/4)*16;case yd:case xd:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Gc:case Sd:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function sw(e){switch(e){case Gn:case m0:return{byteLength:1,components:1};case Go:case g0:case ts:return{byteLength:2,components:1};case Hf:case Gf:return{byteLength:2,components:4};case Li:case Vf:case Oi:return{byteLength:4,components:1};case _0:case v0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?wt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function Ib(){let e=null,t=!1,n=null,i=null;function s(a,r){n(a,r),i=e.requestAnimationFrame(s)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function rw(e){let t=new WeakMap;function n(o,l){let c=o.array,f=o.usage,p=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=e.HALF_FLOAT:d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){let f=l.array,p=l.updateRanges;if(e.bindBuffer(c,o),p.length===0)e.bufferSubData(c,0,f);else{p.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<p.length;d++){let g=p[u],M=p[d];M.start<=g.start+g.count+1?g.count=Math.max(g.count,M.start+M.count-g.start):(++u,p[u]=M)}p.length=u+1;for(let d=0,g=p.length;d<g;d++){let M=p[d];e.bufferSubData(c,M.start*f.BYTES_PER_ELEMENT,f,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var ow=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,lw=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,cw=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,uw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hw=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,fw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dw=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,pw=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,mw=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,gw=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,_w=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,vw=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yw=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,xw=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sw=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Mw=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,bw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ew=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Aw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ww=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Cw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Rw=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Dw=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Nw=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Uw=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Lw=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ow=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Iw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Pw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bw="gl_FragColor = linearToOutputTexel( gl_FragColor );",zw=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Fw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Vw=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Hw=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Gw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Xw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ww=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Yw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zw=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Kw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jw=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jw=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qw=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,$w=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,tC=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,eC=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,nC=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,iC=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,sC=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,aC=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,rC=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,oC=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lC=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,cC=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,uC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,fC=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dC=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,pC=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,mC=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,gC=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,_C=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vC=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yC=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xC=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,SC=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,MC=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bC=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,EC=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,TC=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,AC=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,wC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,CC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,RC=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,DC=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,NC=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,UC=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,LC=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,OC=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,IC=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,PC=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,BC=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zC=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,FC=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,VC=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,HC=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,GC=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,kC=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,XC=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,WC=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qC=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,YC=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ZC=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,KC=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,JC=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jC=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,QC=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$C=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tR=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,eR=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,nR=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,iR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,aR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,rR=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,oR=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lR=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uR=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fR=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dR=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,pR=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,mR=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,gR=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,_R=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vR=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yR=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,xR=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,SR=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,MR=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bR=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ER=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TR=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,AR=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wR=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,CR=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,RR=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,DR=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NR=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,UR=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,LR=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,OR=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,IR=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,PR=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,BR=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zR=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,FR=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,VR=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ht={alphahash_fragment:ow,alphahash_pars_fragment:lw,alphamap_fragment:cw,alphamap_pars_fragment:uw,alphatest_fragment:hw,alphatest_pars_fragment:fw,aomap_fragment:dw,aomap_pars_fragment:pw,batching_pars_vertex:mw,batching_vertex:gw,begin_vertex:_w,beginnormal_vertex:vw,bsdfs:yw,iridescence_fragment:xw,bumpmap_pars_fragment:Sw,clipping_planes_fragment:Mw,clipping_planes_pars_fragment:bw,clipping_planes_pars_vertex:Ew,clipping_planes_vertex:Tw,color_fragment:Aw,color_pars_fragment:ww,color_pars_vertex:Cw,color_vertex:Rw,common:Dw,cube_uv_reflection_fragment:Nw,defaultnormal_vertex:Uw,displacementmap_pars_vertex:Lw,displacementmap_vertex:Ow,emissivemap_fragment:Iw,emissivemap_pars_fragment:Pw,colorspace_fragment:Bw,colorspace_pars_fragment:zw,envmap_fragment:Fw,envmap_common_pars_fragment:Vw,envmap_pars_fragment:Hw,envmap_pars_vertex:Gw,envmap_physical_pars_fragment:$w,envmap_vertex:kw,fog_vertex:Xw,fog_pars_vertex:Ww,fog_fragment:qw,fog_pars_fragment:Yw,gradientmap_pars_fragment:Zw,lightmap_pars_fragment:Kw,lights_lambert_fragment:Jw,lights_lambert_pars_fragment:jw,lights_pars_begin:Qw,lights_toon_fragment:tC,lights_toon_pars_fragment:eC,lights_phong_fragment:nC,lights_phong_pars_fragment:iC,lights_physical_fragment:sC,lights_physical_pars_fragment:aC,lights_fragment_begin:rC,lights_fragment_maps:oC,lights_fragment_end:lC,lightprobes_pars_fragment:cC,logdepthbuf_fragment:uC,logdepthbuf_pars_fragment:hC,logdepthbuf_pars_vertex:fC,logdepthbuf_vertex:dC,map_fragment:pC,map_pars_fragment:mC,map_particle_fragment:gC,map_particle_pars_fragment:_C,metalnessmap_fragment:vC,metalnessmap_pars_fragment:yC,morphinstance_vertex:xC,morphcolor_vertex:SC,morphnormal_vertex:MC,morphtarget_pars_vertex:bC,morphtarget_vertex:EC,normal_fragment_begin:TC,normal_fragment_maps:AC,normal_pars_fragment:wC,normal_pars_vertex:CC,normal_vertex:RC,normalmap_pars_fragment:DC,clearcoat_normal_fragment_begin:NC,clearcoat_normal_fragment_maps:UC,clearcoat_pars_fragment:LC,iridescence_pars_fragment:OC,opaque_fragment:IC,packing:PC,premultiplied_alpha_fragment:BC,project_vertex:zC,dithering_fragment:FC,dithering_pars_fragment:VC,roughnessmap_fragment:HC,roughnessmap_pars_fragment:GC,shadowmap_pars_fragment:kC,shadowmap_pars_vertex:XC,shadowmap_vertex:WC,shadowmask_pars_fragment:qC,skinbase_vertex:YC,skinning_pars_vertex:ZC,skinning_vertex:KC,skinnormal_vertex:JC,specularmap_fragment:jC,specularmap_pars_fragment:QC,tonemapping_fragment:$C,tonemapping_pars_fragment:tR,transmission_fragment:eR,transmission_pars_fragment:nR,uv_pars_fragment:iR,uv_pars_vertex:sR,uv_vertex:aR,worldpos_vertex:rR,background_vert:oR,background_frag:lR,backgroundCube_vert:cR,backgroundCube_frag:uR,cube_vert:hR,cube_frag:fR,depth_vert:dR,depth_frag:pR,distance_vert:mR,distance_frag:gR,equirect_vert:_R,equirect_frag:vR,linedashed_vert:yR,linedashed_frag:xR,meshbasic_vert:SR,meshbasic_frag:MR,meshlambert_vert:bR,meshlambert_frag:ER,meshmatcap_vert:TR,meshmatcap_frag:AR,meshnormal_vert:wR,meshnormal_frag:CR,meshphong_vert:RR,meshphong_frag:DR,meshphysical_vert:NR,meshphysical_frag:UR,meshtoon_vert:LR,meshtoon_frag:OR,points_vert:IR,points_frag:PR,shadow_vert:BR,shadow_frag:zR,sprite_vert:FR,sprite_frag:VR},dt={common:{diffuse:{value:new It(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ot}},envmap:{envMap:{value:null},envMapRotation:{value:new Ot},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ot},normalScale:{value:new bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new It(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new It(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0},uvTransform:{value:new Ot}},sprite:{diffuse:{value:new It(16777215)},opacity:{value:1},center:{value:new bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}}},ns={basic:{uniforms:An([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.fog]),vertexShader:Ht.meshbasic_vert,fragmentShader:Ht.meshbasic_frag},lambert:{uniforms:An([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new It(0)},envMapIntensity:{value:1}}]),vertexShader:Ht.meshlambert_vert,fragmentShader:Ht.meshlambert_frag},phong:{uniforms:An([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new It(0)},specular:{value:new It(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphong_vert,fragmentShader:Ht.meshphong_frag},standard:{uniforms:An([dt.common,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.roughnessmap,dt.metalnessmap,dt.fog,dt.lights,{emissive:{value:new It(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag},toon:{uniforms:An([dt.common,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.gradientmap,dt.fog,dt.lights,{emissive:{value:new It(0)}}]),vertexShader:Ht.meshtoon_vert,fragmentShader:Ht.meshtoon_frag},matcap:{uniforms:An([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,{matcap:{value:null}}]),vertexShader:Ht.meshmatcap_vert,fragmentShader:Ht.meshmatcap_frag},points:{uniforms:An([dt.points,dt.fog]),vertexShader:Ht.points_vert,fragmentShader:Ht.points_frag},dashed:{uniforms:An([dt.common,dt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ht.linedashed_vert,fragmentShader:Ht.linedashed_frag},depth:{uniforms:An([dt.common,dt.displacementmap]),vertexShader:Ht.depth_vert,fragmentShader:Ht.depth_frag},normal:{uniforms:An([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,{opacity:{value:1}}]),vertexShader:Ht.meshnormal_vert,fragmentShader:Ht.meshnormal_frag},sprite:{uniforms:An([dt.sprite,dt.fog]),vertexShader:Ht.sprite_vert,fragmentShader:Ht.sprite_frag},background:{uniforms:{uvTransform:{value:new Ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ht.background_vert,fragmentShader:Ht.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ot}},vertexShader:Ht.backgroundCube_vert,fragmentShader:Ht.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ht.cube_vert,fragmentShader:Ht.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ht.equirect_vert,fragmentShader:Ht.equirect_frag},distance:{uniforms:An([dt.common,dt.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ht.distance_vert,fragmentShader:Ht.distance_frag},shadow:{uniforms:An([dt.lights,dt.fog,{color:{value:new It(0)},opacity:{value:1}}]),vertexShader:Ht.shadow_vert,fragmentShader:Ht.shadow_frag}};ns.physical={uniforms:An([ns.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ot},clearcoatNormalScale:{value:new bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ot},sheen:{value:0},sheenColor:{value:new It(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ot},transmissionSamplerSize:{value:new bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ot},attenuationDistance:{value:0},attenuationColor:{value:new It(0)},specularColor:{value:new It(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ot},anisotropyVector:{value:new bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ot}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag};var Td={r:0,b:0,g:0},HR=new Se,Pb=new Ot;Pb.set(-1,0,0,0,1,0,0,0,1);function GR(e,t,n,i,s,a){let r=new It(0),o=s===!0?0:1,l,c,f=null,p=0,u=null;function d(_){let S=_.isScene===!0?_.background:null;if(S&&S.isTexture){let y=_.backgroundBlurriness>0;S=t.get(S,y)}return S}function g(_){let S=!1,y=d(_);y===null?m(r,o):y&&y.isColor&&(m(y,1),S=!0);let E=e.xr.getEnvironmentBlendMode();E==="additive"?n.buffers.color.setClear(0,0,0,1,a):E==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function M(_,S){let y=d(S);y&&(y.isCubeTexture||y.mapping===Ic)?(c===void 0&&(c=new Je(new Sa(1,1,1),new ri({name:"BackgroundCubeMaterial",uniforms:hr(ns.backgroundCube.uniforms),vertexShader:ns.backgroundCube.vertexShader,fragmentShader:ns.backgroundCube.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(HR.makeRotationFromEuler(S.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Pb),c.material.toneMapped=Zt.getTransfer(y.colorSpace)!==ie,(f!==y||p!==y.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Je(new Mc(2,2),new ri({name:"BackgroundMaterial",uniforms:hr(ns.background.uniforms),vertexShader:ns.background.vertexShader,fragmentShader:ns.background.fragmentShader,side:Ns,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=Zt.getTransfer(y.colorSpace)!==ie,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||p!==y.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,f=y,p=y.version,u=e.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function m(_,S){_.getRGB(Td,T0(e)),n.buffers.color.setClear(Td.r,Td.g,Td.b,S,a)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(_,S=1){r.set(_),o=S,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(_){o=_,m(r,o)},render:g,addToRenderList:M,dispose:h}}function kR(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(N,R,P,G,z){let k=!1,q=p(N,G,P,R);a!==q&&(a=q,c(a.object)),k=d(N,G,P,z),k&&g(N,G,P,z),z!==null&&t.update(z,e.ELEMENT_ARRAY_BUFFER),(k||r)&&(r=!1,y(N,R,P,G),z!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return e.createVertexArray()}function c(N){return e.bindVertexArray(N)}function f(N){return e.deleteVertexArray(N)}function p(N,R,P,G){let z=G.wireframe===!0,k=i[R.id];k===void 0&&(k={},i[R.id]=k);let q=N.isInstancedMesh===!0?N.id:0,K=k[q];K===void 0&&(K={},k[q]=K);let nt=K[P.id];nt===void 0&&(nt={},K[P.id]=nt);let ut=nt[z];return ut===void 0&&(ut=u(l()),nt[z]=ut),ut}function u(N){let R=[],P=[],G=[];for(let z=0;z<n;z++)R[z]=0,P[z]=0,G[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:P,attributeDivisors:G,object:N,attributes:{},index:null}}function d(N,R,P,G){let z=a.attributes,k=R.attributes,q=0,K=P.getAttributes();for(let nt in K)if(K[nt].location>=0){let ht=z[nt],yt=k[nt];if(yt===void 0&&(nt==="instanceMatrix"&&N.instanceMatrix&&(yt=N.instanceMatrix),nt==="instanceColor"&&N.instanceColor&&(yt=N.instanceColor)),ht===void 0||ht.attribute!==yt||yt&&ht.data!==yt.data)return!0;q++}return a.attributesNum!==q||a.index!==G}function g(N,R,P,G){let z={},k=R.attributes,q=0,K=P.getAttributes();for(let nt in K)if(K[nt].location>=0){let ht=k[nt];ht===void 0&&(nt==="instanceMatrix"&&N.instanceMatrix&&(ht=N.instanceMatrix),nt==="instanceColor"&&N.instanceColor&&(ht=N.instanceColor));let yt={};yt.attribute=ht,ht&&ht.data&&(yt.data=ht.data),z[nt]=yt,q++}a.attributes=z,a.attributesNum=q,a.index=G}function M(){let N=a.newAttributes;for(let R=0,P=N.length;R<P;R++)N[R]=0}function m(N){h(N,0)}function h(N,R){let P=a.newAttributes,G=a.enabledAttributes,z=a.attributeDivisors;P[N]=1,G[N]===0&&(e.enableVertexAttribArray(N),G[N]=1),z[N]!==R&&(e.vertexAttribDivisor(N,R),z[N]=R)}function _(){let N=a.newAttributes,R=a.enabledAttributes;for(let P=0,G=R.length;P<G;P++)R[P]!==N[P]&&(e.disableVertexAttribArray(P),R[P]=0)}function S(N,R,P,G,z,k,q){q===!0?e.vertexAttribIPointer(N,R,P,z,k):e.vertexAttribPointer(N,R,P,G,z,k)}function y(N,R,P,G){M();let z=G.attributes,k=P.getAttributes(),q=R.defaultAttributeValues;for(let K in k){let nt=k[K];if(nt.location>=0){let ut=z[K];if(ut===void 0&&(K==="instanceMatrix"&&N.instanceMatrix&&(ut=N.instanceMatrix),K==="instanceColor"&&N.instanceColor&&(ut=N.instanceColor)),ut!==void 0){let ht=ut.normalized,yt=ut.itemSize,jt=t.get(ut);if(jt===void 0)continue;let Re=jt.buffer,Jt=jt.type,J=jt.bytesPerElement,it=Jt===e.INT||Jt===e.UNSIGNED_INT||ut.gpuType===Vf;if(ut.isInterleavedBufferAttribute){let et=ut.data,Lt=et.stride,Bt=ut.offset;if(et.isInstancedInterleavedBuffer){for(let Dt=0;Dt<nt.locationSize;Dt++)h(nt.location+Dt,et.meshPerAttribute);N.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let Dt=0;Dt<nt.locationSize;Dt++)m(nt.location+Dt);e.bindBuffer(e.ARRAY_BUFFER,Re);for(let Dt=0;Dt<nt.locationSize;Dt++)S(nt.location+Dt,yt/nt.locationSize,Jt,ht,Lt*J,(Bt+yt/nt.locationSize*Dt)*J,it)}else{if(ut.isInstancedBufferAttribute){for(let et=0;et<nt.locationSize;et++)h(nt.location+et,ut.meshPerAttribute);N.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=ut.meshPerAttribute*ut.count)}else for(let et=0;et<nt.locationSize;et++)m(nt.location+et);e.bindBuffer(e.ARRAY_BUFFER,Re);for(let et=0;et<nt.locationSize;et++)S(nt.location+et,yt/nt.locationSize,Jt,ht,yt*J,yt/nt.locationSize*et*J,it)}}else if(q!==void 0){let ht=q[K];if(ht!==void 0)switch(ht.length){case 2:e.vertexAttrib2fv(nt.location,ht);break;case 3:e.vertexAttrib3fv(nt.location,ht);break;case 4:e.vertexAttrib4fv(nt.location,ht);break;default:e.vertexAttrib1fv(nt.location,ht)}}}}_()}function E(){T();for(let N in i){let R=i[N];for(let P in R){let G=R[P];for(let z in G){let k=G[z];for(let q in k)f(k[q].object),delete k[q];delete G[z]}}delete i[N]}}function A(N){if(i[N.id]===void 0)return;let R=i[N.id];for(let P in R){let G=R[P];for(let z in G){let k=G[z];for(let q in k)f(k[q].object),delete k[q];delete G[z]}}delete i[N.id]}function w(N){for(let R in i){let P=i[R];for(let G in P){let z=P[G];if(z[N.id]===void 0)continue;let k=z[N.id];for(let q in k)f(k[q].object),delete k[q];delete z[N.id]}}}function v(N){for(let R in i){let P=i[R],G=N.isInstancedMesh===!0?N.id:0,z=P[G];if(z!==void 0){for(let k in z){let q=z[k];for(let K in q)f(q[K].object),delete q[K];delete z[k]}delete P[G],Object.keys(P).length===0&&delete i[R]}}}function T(){D(),r=!0,a!==s&&(a=s,c(a.object))}function D(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:D,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfObject:v,releaseStatesOfProgram:w,initAttributes:M,enableAttribute:m,disableUnusedAttributes:_}}function XR(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,f){f!==0&&(e.drawArraysInstanced(i,l,c,f),n.update(c,i,f))}function o(l,c,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,f);let u=0;for(let d=0;d<f;d++)u+=c[d];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function WR(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(w){return!(w!==Mi&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let v=w===ts&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==Gn&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Oi&&!v)}function l(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",f=l(c);f!==c&&(wt("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let p=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&wt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),h=e.getParameter(e.MAX_VERTEX_ATTRIBS),_=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),S=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),E=e.getParameter(e.MAX_SAMPLES),A=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:M,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:_,maxVaryings:S,maxFragmentUniforms:y,maxSamples:E,samples:A}}function qR(e){let t=this,n=null,i=0,s=!1,a=!1,r=new Si,o=new Ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let d=p.length!==0||u||i!==0||s;return s=u,i=p.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){n=f(p,u,0)},this.setState=function(p,u,d){let g=p.clippingPlanes,M=p.clipIntersection,m=p.clipShadows,h=e.get(p);if(!s||g===null||g.length===0||a&&!m)a?f(null):c();else{let _=a?0:i,S=_*4,y=h.clippingState||null;l.value=y,y=f(g,u,S,d);for(let E=0;E!==S;++E)y[E]=n[E];h.clippingState=y,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function f(p,u,d,g){let M=p!==null?p.length:0,m=null;if(M!==0){if(m=l.value,g!==!0||m===null){let h=d+M*4,_=u.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<h)&&(m=new Float32Array(h));for(let S=0,y=d;S!==M;++S,y+=4)r.copy(p[S]).applyMatrix4(_,o),r.normal.toArray(m,y),m[y+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=M,t.numIntersection=0,m}}var Na=4,db=[.125,.215,.35,.446,.526,.582],fr=20,YR=256,kc=new zo,pb=new It,R0=null,D0=0,N0=0,U0=!1,ZR=new U,wd=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=ZR}=a;R0=this._renderer.getRenderTarget(),D0=this._renderer.getActiveCubeFace(),N0=this._renderer.getActiveMipmapLevel(),U0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_b(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gb(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(R0,D0,N0),this._renderer.xr.enabled=U0,t.scissorTest=!1,Xo(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===wa||t.mapping===ur?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),R0=this._renderer.getRenderTarget(),D0=this._renderer.getActiveCubeFace(),N0=this._renderer.getActiveMipmapLevel(),U0=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:yn,minFilter:yn,generateMipmaps:!1,type:ts,format:Mi,colorSpace:ac,depthBuffer:!1},s=mb(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mb(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=KR(a)),this._blurMaterial=jR(a,t,n),this._ggxMaterial=JR(a,t,n)}return s}_compileMaterial(t){let n=new Je(new hn,t);this._renderer.compile(n,kc)}_sceneToCubeUV(t,n,i,s,a){let l=new vn(90,1,n,i),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,d=p.toneMapping;p.getClearColor(pb),p.toneMapping=Ui,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Je(new Sa,new cr({name:"PMREM.Background",side:Un,depthWrite:!1,depthTest:!1})));let M=this._backgroundBox,m=M.material,h=!1,_=t.background;_?_.isColor&&(m.color.copy(_),t.background=null,h=!0):(m.color.copy(pb),h=!0);for(let S=0;S<6;S++){let y=S%3;y===0?(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[S],a.y,a.z)):y===1?(l.up.set(0,0,c[S]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[S],a.z)):(l.up.set(0,c[S],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[S]));let E=this._cubeSize;Xo(s,y*E,S>2?E:0,E,E),p.setRenderTarget(s),h&&p.render(M,l),p.render(t,l)}p.toneMapping=d,p.autoClear=u,t.background=_}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===wa||t.mapping===ur;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=_b()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gb());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;Xo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,kc)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),f=n/(this._lodMeshes.length-1),p=Math.sqrt(c*c-f*f),u=0+c*1.25,d=p*u,{_lodMax:g}=this,M=this._sizeLods[i],m=3*M*(i>g-Na?i-g+Na:0),h=4*(this._cubeSize-M);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=g-n,Xo(a,m,h,3*M,2*M),s.setRenderTarget(a),s.render(o,kc),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=g-i,Xo(t,m,h,3*M,2*M),s.setRenderTarget(t),s.render(o,kc)}_blur(t,n,i,s,a){let r=this._pingPongRenderTarget;this._halfBlur(t,r,n,i,s,"latitudinal",a),this._halfBlur(r,t,i,i,s,"longitudinal",a)}_halfBlur(t,n,i,s,a,r,o){let l=this._renderer,c=this._blurMaterial;r!=="latitudinal"&&r!=="longitudinal"&&Rt("blur direction must be either latitudinal or longitudinal!");let f=3,p=this._lodMeshes[s];p.material=c;let u=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(a)?Math.PI/(2*d):2*Math.PI/(2*fr-1),M=a/g,m=isFinite(a)?1+Math.floor(f*M):fr;m>fr&&wt(`sigmaRadians, ${a}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${fr}`);let h=[],_=0;for(let w=0;w<fr;++w){let v=w/M,T=Math.exp(-v*v/2);h.push(T),w===0?_+=T:w<m&&(_+=2*T)}for(let w=0;w<h.length;w++)h[w]=h[w]/_;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=r==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:S}=this;u.dTheta.value=g,u.mipInt.value=S-i;let y=this._sizeLods[s],E=3*y*(s>S-Na?s-S+Na:0),A=4*(this._cubeSize-y);Xo(n,E,A,3*y,2*y),l.setRenderTarget(n),l.render(p,kc)}};function KR(e){let t=[],n=[],i=[],s=e,a=e-Na+1+db.length;for(let r=0;r<a;r++){let o=Math.pow(2,s);t.push(o);let l=1/o;r>e-Na?l=db[r-e+Na-1]:r===0&&(l=0),n.push(l);let c=1/(o-2),f=-c,p=1+c,u=[f,f,p,f,p,p,f,f,p,p,f,p],d=6,g=6,M=3,m=2,h=1,_=new Float32Array(M*g*d),S=new Float32Array(m*g*d),y=new Float32Array(h*g*d);for(let A=0;A<d;A++){let w=A%3*2/3-1,v=A>2?0:-1,T=[w,v,0,w+2/3,v,0,w+2/3,v+1,0,w,v,0,w+2/3,v+1,0,w,v+1,0];_.set(T,M*g*A),S.set(u,m*g*A);let D=[A,A,A,A,A,A];y.set(D,h*g*A)}let E=new hn;E.setAttribute("position",new Tn(_,M)),E.setAttribute("uv",new Tn(S,m)),E.setAttribute("faceIndex",new Tn(y,h)),i.push(new Je(E,null)),s>Na&&s--}return{lodMeshes:i,sizeLods:t,sigmas:n}}function mb(e,t,n){let i=new ai(e,t,n);return i.texture.mapping=Ic,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xo(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function JR(e,t,n){return new ri({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:YR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Dd(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function jR(e,t,n){let i=new Float32Array(fr),s=new U(0,1,0);return new ri({name:"SphericalGaussianBlur",defines:{n:fr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function gb(){return new ri({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function _b(){return new ri({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function Dd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Cd=class extends ai{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new gc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Sa(5,5,5),a=new ri({name:"CubemapFromEquirect",uniforms:hr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Un,blending:$i});a.uniforms.tEquirect.value=n;let r=new Je(s,a),o=n.minFilter;return n.minFilter===Ca&&(n.minFilter=yn),new Of(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function QR(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?r(u):a(u)}function a(u){if(u&&u.isTexture){let d=u.mapping;if(d===Bf||d===zf)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let M=new Cd(g.height);return M.fromEquirectangularTexture(e,u),t.set(u,M),u.addEventListener("dispose",c),o(M.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let d=u.mapping,g=d===Bf||d===zf,M=d===wa||d===ur;if(g||M){let m=n.get(u),h=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new wd(e)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),m.texture;if(m!==void 0)return m.texture;{let _=u.image;return g&&_&&_.height>0||M&&_&&l(_)?(i===null&&(i=new wd(e)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,n.set(u,m),u.addEventListener("dispose",f),m.texture):null}}}return u}function o(u,d){return d===Bf?u.mapping=wa:d===zf&&(u.mapping=ur),u}function l(u){let d=0,g=6;for(let M=0;M<g;M++)u[M]!==void 0&&d++;return d===g}function c(u){let d=u.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function f(u){let d=u.target;d.removeEventListener("dispose",f);let g=n.get(d);g!==void 0&&(n.delete(d),g.dispose())}function p(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:p}}function $R(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&sr("WebGLRenderer: "+i+" extension not supported."),s}}}function t2(e,t,n,i){let s={},a=new WeakMap;function r(p){let u=p.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",r),delete s[u.id];let d=a.get(u);d&&(t.remove(d),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(p){let u=p.attributes;for(let d in u)t.update(u[d],e.ARRAY_BUFFER)}function c(p){let u=[],d=p.index,g=p.attributes.position,M=0;if(g===void 0)return;if(d!==null){let _=d.array;M=d.version;for(let S=0,y=_.length;S<y;S+=3){let E=_[S+0],A=_[S+1],w=_[S+2];u.push(E,A,A,w,w,E)}}else{let _=g.array;M=g.version;for(let S=0,y=_.length/3-1;S<y;S+=3){let E=S+0,A=S+1,w=S+2;u.push(E,A,A,w,w,E)}}let m=new(g.count>=65535?dc:fc)(u,1);m.version=M;let h=a.get(p);h&&t.remove(h),a.set(p,m)}function f(p){let u=a.get(p);if(u){let d=p.index;d!==null&&u.version<d.version&&c(p)}else c(p);return a.get(p)}return{get:o,update:l,getWireframeAttribute:f}}function e2(e,t,n){let i;function s(p){i=p}let a,r;function o(p){a=p.type,r=p.bytesPerElement}function l(p,u){e.drawElements(i,u,a,p*r),n.update(u,i,1)}function c(p,u,d){d!==0&&(e.drawElementsInstanced(i,u,a,p*r,d),n.update(u,i,d))}function f(p,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,p,0,d);let M=0;for(let m=0;m<d;m++)M+=u[m];n.update(M,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function n2(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:Rt("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function i2(e,t,n){let i=new WeakMap,s=new Ue;function a(r,o,l){let c=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0,u=i.get(o);if(u===void 0||u.count!==p){let T=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],h=o.morphAttributes.normal||[],_=o.morphAttributes.color||[],S=0;d===!0&&(S=1),g===!0&&(S=2),M===!0&&(S=3);let y=o.attributes.position.count*S,E=1;y>t.maxTextureSize&&(E=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let A=new Float32Array(y*E*4*p),w=new cc(A,y,E,p);w.type=Oi,w.needsUpdate=!0;let v=S*4;for(let D=0;D<p;D++){let N=m[D],R=h[D],P=_[D],G=y*E*4*D;for(let z=0;z<N.count;z++){let k=z*v;d===!0&&(s.fromBufferAttribute(N,z),A[G+k+0]=s.x,A[G+k+1]=s.y,A[G+k+2]=s.z,A[G+k+3]=0),g===!0&&(s.fromBufferAttribute(R,z),A[G+k+4]=s.x,A[G+k+5]=s.y,A[G+k+6]=s.z,A[G+k+7]=0),M===!0&&(s.fromBufferAttribute(P,z),A[G+k+8]=s.x,A[G+k+9]=s.y,A[G+k+10]=s.z,A[G+k+11]=P.itemSize===4?s.w:1)}}u={count:p,texture:w,size:new bt(y,E)},i.set(o,u),o.addEventListener("dispose",T)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let d=0;for(let M=0;M<c.length;M++)d+=c[M];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",g),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function s2(e,t,n,i,s){let a=new WeakMap;function r(c){let f=s.render.frame,p=c.geometry,u=t.get(c,p);if(a.get(u)!==f&&(t.update(u),a.set(u,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==f&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,f))),c.isSkinnedMesh){let d=c.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return u}function o(){a=new WeakMap}function l(c){let f=c.target;f.removeEventListener("dispose",l),i.releaseStatesOfObject(f),n.remove(f.instanceMatrix),f.instanceColor!==null&&n.remove(f.instanceColor)}return{update:r,dispose:o}}var a2={[l0]:"LINEAR_TONE_MAPPING",[c0]:"REINHARD_TONE_MAPPING",[u0]:"CINEON_TONE_MAPPING",[Oc]:"ACES_FILMIC_TONE_MAPPING",[f0]:"AGX_TONE_MAPPING",[d0]:"NEUTRAL_TONE_MAPPING",[h0]:"CUSTOM_TONE_MAPPING"};function r2(e,t,n,i,s,a){let r=new ai(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,depthTexture:s?new Os(t,n):void 0}),o=new ai(t,n,{type:ts,depthBuffer:!1,stencilBuffer:!1}),l=new hn;l.setAttribute("position",new he([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new he([0,2,0,0,2,0],2));let c=new xf({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Je(l,c),p=new zo(-1,1,1,-1,0,1),u=null,d=null,g=!1,M,m=null,h=[],_=!1;this.setSize=function(S,y){r.setSize(S,y),o.setSize(S,y);for(let E=0;E<h.length;E++){let A=h[E];A.setSize&&A.setSize(S,y)}},this.setEffects=function(S){h=S,_=h.length>0&&h[0].isRenderPass===!0;let y=r.width,E=r.height;for(let A=0;A<h.length;A++){let w=h[A];w.setSize&&w.setSize(y,E)}},this.begin=function(S,y){if(g||S.toneMapping===Ui&&h.length===0)return!1;if(m=y,y!==null){let E=y.width,A=y.height;(r.width!==E||r.height!==A)&&this.setSize(E,A)}return _===!1&&S.setRenderTarget(r),M=S.toneMapping,S.toneMapping=Ui,!0},this.hasRenderPass=function(){return _},this.end=function(S,y){S.toneMapping=M,g=!0;let E=r,A=o;for(let w=0;w<h.length;w++){let v=h[w];if(v.enabled!==!1&&(v.render(S,A,E,y),v.needsSwap!==!1)){let T=E;E=A,A=T}}if(u!==S.outputColorSpace||d!==S.toneMapping){u=S.outputColorSpace,d=S.toneMapping,c.defines={},Zt.getTransfer(u)===ie&&(c.defines.SRGB_TRANSFER="");let w=a2[d];w&&(c.defines[w]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=E.texture,S.setRenderTarget(m),S.render(f,p),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),o.dispose(),l.dispose(),c.dispose()}}var Bb=new Nn,I0=new Os(1,1),zb=new cc,Fb=new df,Vb=new gc,vb=[],yb=[],xb=new Float32Array(16),Sb=new Float32Array(9),Mb=new Float32Array(4);function qo(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=vb[s];if(a===void 0&&(a=new Float32Array(s),vb[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function tn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function en(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function Nd(e,t){let n=yb[t];n===void 0&&(n=new Int32Array(t),yb[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function o2(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function l2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2fv(this.addr,t),en(n,t)}}function c2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(tn(n,t))return;e.uniform3fv(this.addr,t),en(n,t)}}function u2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4fv(this.addr,t),en(n,t)}}function h2(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(tn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),en(n,t)}else{if(tn(n,i))return;Mb.set(i),e.uniformMatrix2fv(this.addr,!1,Mb),en(n,i)}}function f2(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(tn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),en(n,t)}else{if(tn(n,i))return;Sb.set(i),e.uniformMatrix3fv(this.addr,!1,Sb),en(n,i)}}function d2(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(tn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),en(n,t)}else{if(tn(n,i))return;xb.set(i),e.uniformMatrix4fv(this.addr,!1,xb),en(n,i)}}function p2(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function m2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2iv(this.addr,t),en(n,t)}}function g2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(tn(n,t))return;e.uniform3iv(this.addr,t),en(n,t)}}function _2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4iv(this.addr,t),en(n,t)}}function v2(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function y2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2uiv(this.addr,t),en(n,t)}}function x2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(tn(n,t))return;e.uniform3uiv(this.addr,t),en(n,t)}}function S2(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4uiv(this.addr,t),en(n,t)}}function M2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(I0.compareFunction=n.isReversedDepthBuffer()?Ed:bd,a=I0):a=Bb,n.setTexture2D(t||a,s)}function b2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||Fb,s)}function E2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||Vb,s)}function T2(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||zb,s)}function A2(e){switch(e){case 5126:return o2;case 35664:return l2;case 35665:return c2;case 35666:return u2;case 35674:return h2;case 35675:return f2;case 35676:return d2;case 5124:case 35670:return p2;case 35667:case 35671:return m2;case 35668:case 35672:return g2;case 35669:case 35673:return _2;case 5125:return v2;case 36294:return y2;case 36295:return x2;case 36296:return S2;case 35678:case 36198:case 36298:case 36306:case 35682:return M2;case 35679:case 36299:case 36307:return b2;case 35680:case 36300:case 36308:case 36293:return E2;case 36289:case 36303:case 36311:case 36292:return T2}}function w2(e,t){e.uniform1fv(this.addr,t)}function C2(e,t){let n=qo(t,this.size,2);e.uniform2fv(this.addr,n)}function R2(e,t){let n=qo(t,this.size,3);e.uniform3fv(this.addr,n)}function D2(e,t){let n=qo(t,this.size,4);e.uniform4fv(this.addr,n)}function N2(e,t){let n=qo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function U2(e,t){let n=qo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function L2(e,t){let n=qo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function O2(e,t){e.uniform1iv(this.addr,t)}function I2(e,t){e.uniform2iv(this.addr,t)}function P2(e,t){e.uniform3iv(this.addr,t)}function B2(e,t){e.uniform4iv(this.addr,t)}function z2(e,t){e.uniform1uiv(this.addr,t)}function F2(e,t){e.uniform2uiv(this.addr,t)}function V2(e,t){e.uniform3uiv(this.addr,t)}function H2(e,t){e.uniform4uiv(this.addr,t)}function G2(e,t,n){let i=this.cache,s=t.length,a=Nd(n,s);tn(i,a)||(e.uniform1iv(this.addr,a),en(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=I0:r=Bb;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function k2(e,t,n){let i=this.cache,s=t.length,a=Nd(n,s);tn(i,a)||(e.uniform1iv(this.addr,a),en(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||Fb,a[r])}function X2(e,t,n){let i=this.cache,s=t.length,a=Nd(n,s);tn(i,a)||(e.uniform1iv(this.addr,a),en(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||Vb,a[r])}function W2(e,t,n){let i=this.cache,s=t.length,a=Nd(n,s);tn(i,a)||(e.uniform1iv(this.addr,a),en(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||zb,a[r])}function q2(e){switch(e){case 5126:return w2;case 35664:return C2;case 35665:return R2;case 35666:return D2;case 35674:return N2;case 35675:return U2;case 35676:return L2;case 5124:case 35670:return O2;case 35667:case 35671:return I2;case 35668:case 35672:return P2;case 35669:case 35673:return B2;case 5125:return z2;case 36294:return F2;case 36295:return V2;case 36296:return H2;case 35678:case 36198:case 36298:case 36306:case 35682:return G2;case 35679:case 36299:case 36307:return k2;case 35680:case 36300:case 36308:case 36293:return X2;case 36289:case 36303:case 36311:case 36292:return W2}}var P0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=A2(n.type)}},B0=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=q2(n.type)}},z0=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},L0=/(\w+)(\])?(\[|\.)?/g;function bb(e,t){e.seq.push(t),e.map[t.id]=t}function Y2(e,t,n){let i=e.name,s=i.length;for(L0.lastIndex=0;;){let a=L0.exec(i),r=L0.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){bb(n,c===void 0?new P0(o,e,t):new B0(o,e,t));break}else{let p=n.map[o];p===void 0&&(p=new z0(o),bb(n,p)),n=p}}}var Wo=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);Y2(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function Eb(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var Z2=37297,K2=0;function J2(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var Tb=new Ot;function j2(e){Zt._getMatrix(Tb,Zt.workingColorSpace,e);let t=`mat3( ${Tb.elements.map(n=>n.toFixed(4))} )`;switch(Zt.getTransfer(e)){case rc:return[t,"LinearTransferOETF"];case ie:return[t,"sRGBTransferOETF"];default:return wt("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Ab(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+J2(e.getShaderSource(t),o)}else return a}function Q2(e,t){let n=j2(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var $2={[l0]:"Linear",[c0]:"Reinhard",[u0]:"Cineon",[Oc]:"ACESFilmic",[f0]:"AgX",[d0]:"Neutral",[h0]:"Custom"};function t3(e,t){let n=$2[t];return n===void 0?(wt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Ad=new U;function e3(){Zt.getLuminanceCoefficients(Ad);let e=Ad.x.toFixed(4),t=Ad.y.toFixed(4),n=Ad.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function n3(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wc).join(`
`)}function i3(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function s3(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function Wc(e){return e!==""}function wb(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Cb(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var a3=/^[ \t]*#include +<([\w\d./]+)>/gm;function F0(e){return e.replace(a3,o3)}var r3=new Map;function o3(e,t){let n=Ht[t];if(n===void 0){let i=r3.get(t);if(i!==void 0)n=Ht[i],wt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return F0(n)}var l3=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rb(e){return e.replace(l3,c3)}function c3(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function Db(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var u3={[Lc]:"SHADOWMAP_TYPE_PCF",[Ho]:"SHADOWMAP_TYPE_VSM"};function h3(e){return u3[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var f3={[wa]:"ENVMAP_TYPE_CUBE",[ur]:"ENVMAP_TYPE_CUBE",[Ic]:"ENVMAP_TYPE_CUBE_UV"};function d3(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":f3[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var p3={[ur]:"ENVMAP_MODE_REFRACTION"};function m3(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":p3[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var g3={[o0]:"ENVMAP_BLENDING_MULTIPLY",[ZM]:"ENVMAP_BLENDING_MIX",[KM]:"ENVMAP_BLENDING_ADD"};function _3(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":g3[e.combine]||"ENVMAP_BLENDING_NONE"}function v3(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function y3(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=h3(n),c=d3(n),f=m3(n),p=_3(n),u=v3(n),d=n3(n),g=i3(a),M=s.createProgram(),m,h,_=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Wc).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Wc).join(`
`),h.length>0&&(h+=`
`)):(m=[Db(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wc).join(`
`),h=[Db(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",n.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ui?"#define TONE_MAPPING":"",n.toneMapping!==Ui?Ht.tonemapping_pars_fragment:"",n.toneMapping!==Ui?t3("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ht.colorspace_pars_fragment,Q2("linearToOutputTexel",n.outputColorSpace),e3(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Wc).join(`
`)),r=F0(r),r=wb(r,n),r=Cb(r,n),o=F0(o),o=wb(o,n),o=Cb(o,n),r=Rb(r),o=Rb(o),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",n.glslVersion===M0?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===M0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);let S=_+m+r,y=_+h+o,E=Eb(s,s.VERTEX_SHADER,S),A=Eb(s,s.FRAGMENT_SHADER,y);s.attachShader(M,E),s.attachShader(M,A),n.index0AttributeName!==void 0?s.bindAttribLocation(M,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function w(N){if(e.debug.checkShaderErrors){let R=s.getProgramInfoLog(M)||"",P=s.getShaderInfoLog(E)||"",G=s.getShaderInfoLog(A)||"",z=R.trim(),k=P.trim(),q=G.trim(),K=!0,nt=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if(K=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,M,E,A);else{let ut=Ab(s,E,"vertex"),ht=Ab(s,A,"fragment");Rt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+z+`
`+ut+`
`+ht)}else z!==""?wt("WebGLProgram: Program Info Log:",z):(k===""||q==="")&&(nt=!1);nt&&(N.diagnostics={runnable:K,programLog:z,vertexShader:{log:k,prefix:m},fragmentShader:{log:q,prefix:h}})}s.deleteShader(E),s.deleteShader(A),v=new Wo(s,M),T=s3(s,M)}let v;this.getUniforms=function(){return v===void 0&&w(this),v};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let D=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(M,Z2)),D},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=K2++,this.cacheKey=t,this.usedTimes=1,this.program=M,this.vertexShader=E,this.fragmentShader=A,this}var x3=0,V0=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new H0(t),n.set(t,i)),i}},H0=class{constructor(t){this.id=x3++,this.code=t,this.usedTimes=0}};function S3(e){return e===Da||e===Hc||e===Gc}function M3(e,t,n,i,s,a){let r=new No,o=new V0,l=new Set,c=[],f=new Map,p=i.logarithmicDepthBuffer,u=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function M(v,T,D,N,R,P){let G=N.fog,z=R.geometry,k=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?N.environment:null,q=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,K=t.get(v.envMap||k,q),nt=K&&K.mapping===Ic?K.image.height:null,ut=d[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&wt("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let ht=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,yt=ht!==void 0?ht.length:0,jt=0;z.morphAttributes.position!==void 0&&(jt=1),z.morphAttributes.normal!==void 0&&(jt=2),z.morphAttributes.color!==void 0&&(jt=3);let Re,Jt,J,it;if(ut){let xt=ns[ut];Re=xt.vertexShader,Jt=xt.fragmentShader}else{Re=v.vertexShader,Jt=v.fragmentShader;let xt=o.getVertexShaderStage(v),Oe=o.getFragmentShaderStage(v);o.update(v,xt,Oe),J=xt.id,it=Oe.id}let et=e.getRenderTarget(),Lt=e.state.buffers.depth.getReversed(),Bt=R.isInstancedMesh===!0,Dt=R.isBatchedMesh===!0,ze=!!v.map,qt=!!v.matcap,de=!!K,te=!!v.aoMap,Qt=!!v.lightMap,ke=!!v.bumpMap&&v.wireframe===!1,je=!!v.normalMap,sn=!!v.displacementMap,fn=!!v.emissiveMap,Le=!!v.metalnessMap,Xe=!!v.roughnessMap,O=v.anisotropy>0,On=v.clearcoat>0,se=v.dispersion>0,C=v.iridescence>0,x=v.sheen>0,B=v.transmission>0,H=O&&!!v.anisotropyMap,Y=On&&!!v.clearcoatMap,st=On&&!!v.clearcoatNormalMap,rt=On&&!!v.clearcoatRoughnessMap,Z=C&&!!v.iridescenceMap,Q=C&&!!v.iridescenceThicknessMap,ot=x&&!!v.sheenColorMap,Et=x&&!!v.sheenRoughnessMap,ft=!!v.specularMap,lt=!!v.specularColorMap,Ct=!!v.specularIntensityMap,Nt=B&&!!v.transmissionMap,zt=B&&!!v.thicknessMap,L=!!v.gradientMap,at=!!v.alphaMap,j=v.alphaTest>0,ct=!!v.alphaHash,gt=!!v.extensions,tt=Ui;v.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(tt=e.toneMapping);let Mt={shaderID:ut,shaderType:v.type,shaderName:v.name,vertexShader:Re,fragmentShader:Jt,defines:v.defines,customVertexShaderID:J,customFragmentShaderID:it,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:Dt,batchingColor:Dt&&R._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&R.instanceColor!==null,instancingMorph:Bt&&R.morphTexture!==null,outputColorSpace:et===null?e.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:Zt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:ze,matcap:qt,envMap:de,envMapMode:de&&K.mapping,envMapCubeUVHeight:nt,aoMap:te,lightMap:Qt,bumpMap:ke,normalMap:je,displacementMap:sn,emissiveMap:fn,normalMapObjectSpace:je&&v.normalMapType===QM,normalMapTangentSpace:je&&v.normalMapType===Md,packedNormalMap:je&&v.normalMapType===Md&&S3(v.normalMap.format),metalnessMap:Le,roughnessMap:Xe,anisotropy:O,anisotropyMap:H,clearcoat:On,clearcoatMap:Y,clearcoatNormalMap:st,clearcoatRoughnessMap:rt,dispersion:se,iridescence:C,iridescenceMap:Z,iridescenceThicknessMap:Q,sheen:x,sheenColorMap:ot,sheenRoughnessMap:Et,specularMap:ft,specularColorMap:lt,specularIntensityMap:Ct,transmission:B,transmissionMap:Nt,thicknessMap:zt,gradientMap:L,opaque:v.transparent===!1&&v.blending===ar&&v.alphaToCoverage===!1,alphaMap:at,alphaTest:j,alphaHash:ct,combine:v.combine,mapUv:ze&&g(v.map.channel),aoMapUv:te&&g(v.aoMap.channel),lightMapUv:Qt&&g(v.lightMap.channel),bumpMapUv:ke&&g(v.bumpMap.channel),normalMapUv:je&&g(v.normalMap.channel),displacementMapUv:sn&&g(v.displacementMap.channel),emissiveMapUv:fn&&g(v.emissiveMap.channel),metalnessMapUv:Le&&g(v.metalnessMap.channel),roughnessMapUv:Xe&&g(v.roughnessMap.channel),anisotropyMapUv:H&&g(v.anisotropyMap.channel),clearcoatMapUv:Y&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:st&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:rt&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:ot&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:Et&&g(v.sheenRoughnessMap.channel),specularMapUv:ft&&g(v.specularMap.channel),specularColorMapUv:lt&&g(v.specularColorMap.channel),specularIntensityMapUv:Ct&&g(v.specularIntensityMap.channel),transmissionMapUv:Nt&&g(v.transmissionMap.channel),thicknessMapUv:zt&&g(v.thicknessMap.channel),alphaMapUv:at&&g(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(je||O),vertexNormals:!!z.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!z.attributes.uv&&(ze||at),fog:!!G,useFog:v.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||z.attributes.normal===void 0&&je===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:Lt,skinning:R.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:yt,morphTextureStride:jt,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:P.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:e.shadowMap.enabled&&D.length>0,shadowMapType:e.shadowMap.type,toneMapping:tt,decodeVideoTexture:ze&&v.map.isVideoTexture===!0&&Zt.getTransfer(v.map.colorSpace)===ie,decodeVideoTextureEmissive:fn&&v.emissiveMap.isVideoTexture===!0&&Zt.getTransfer(v.emissiveMap.colorSpace)===ie,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Qi,flipSided:v.side===Un,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:gt&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(gt&&v.extensions.multiDraw===!0||Dt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Mt.vertexUv1s=l.has(1),Mt.vertexUv2s=l.has(2),Mt.vertexUv3s=l.has(3),l.clear(),Mt}function m(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let D in v.defines)T.push(D),T.push(v.defines[D]);return v.isRawShaderMaterial===!1&&(h(T,v),_(T,v),T.push(e.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function h(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function _(v,T){r.disableAll(),T.instancing&&r.enable(0),T.instancingColor&&r.enable(1),T.instancingMorph&&r.enable(2),T.matcap&&r.enable(3),T.envMap&&r.enable(4),T.normalMapObjectSpace&&r.enable(5),T.normalMapTangentSpace&&r.enable(6),T.clearcoat&&r.enable(7),T.iridescence&&r.enable(8),T.alphaTest&&r.enable(9),T.vertexColors&&r.enable(10),T.vertexAlphas&&r.enable(11),T.vertexUv1s&&r.enable(12),T.vertexUv2s&&r.enable(13),T.vertexUv3s&&r.enable(14),T.vertexTangents&&r.enable(15),T.anisotropy&&r.enable(16),T.alphaHash&&r.enable(17),T.batching&&r.enable(18),T.dispersion&&r.enable(19),T.batchingColor&&r.enable(20),T.gradientMap&&r.enable(21),T.packedNormalMap&&r.enable(22),T.vertexNormals&&r.enable(23),v.push(r.mask),r.disableAll(),T.fog&&r.enable(0),T.useFog&&r.enable(1),T.flatShading&&r.enable(2),T.logarithmicDepthBuffer&&r.enable(3),T.reversedDepthBuffer&&r.enable(4),T.skinning&&r.enable(5),T.morphTargets&&r.enable(6),T.morphNormals&&r.enable(7),T.morphColors&&r.enable(8),T.premultipliedAlpha&&r.enable(9),T.shadowMapEnabled&&r.enable(10),T.doubleSided&&r.enable(11),T.flipSided&&r.enable(12),T.useDepthPacking&&r.enable(13),T.dithering&&r.enable(14),T.transmission&&r.enable(15),T.sheen&&r.enable(16),T.opaque&&r.enable(17),T.pointsUvs&&r.enable(18),T.decodeVideoTexture&&r.enable(19),T.decodeVideoTextureEmissive&&r.enable(20),T.alphaToCoverage&&r.enable(21),T.numLightProbeGrids>0&&r.enable(22),T.hasPositionAttribute&&r.enable(23),v.push(r.mask)}function S(v){let T=d[v.type],D;if(T){let N=ns[T];D=hb.clone(N.uniforms)}else D=v.uniforms;return D}function y(v,T){let D=f.get(T);return D!==void 0?++D.usedTimes:(D=new y3(e,T,v,s),c.push(D),f.set(T,D)),D}function E(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),f.delete(v.cacheKey),v.destroy()}}function A(v){o.remove(v)}function w(){o.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:S,acquireProgram:y,releaseProgram:E,releaseShaderCache:A,programs:c,dispose:w}}function b3(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function E3(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function Nb(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Ub(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,g,M,m,h){let _=e[t];return _===void 0?(_={id:u.id,object:u,geometry:d,material:g,materialVariant:r(u),groupOrder:M,renderOrder:u.renderOrder,z:m,group:h},e[t]=_):(_.id=u.id,_.object=u,_.geometry=d,_.material=g,_.materialVariant=r(u),_.groupOrder=M,_.renderOrder=u.renderOrder,_.z=m,_.group=h),t++,_}function l(u,d,g,M,m,h){let _=o(u,d,g,M,m,h);g.transmission>0?i.push(_):g.transparent===!0?s.push(_):n.push(_)}function c(u,d,g,M,m,h){let _=o(u,d,g,M,m,h);g.transmission>0?i.unshift(_):g.transparent===!0?s.unshift(_):n.unshift(_)}function f(u,d,g){n.length>1&&n.sort(u||E3),i.length>1&&i.sort(d||Nb),s.length>1&&s.sort(d||Nb),g&&(n.reverse(),i.reverse(),s.reverse())}function p(){for(let u=t,d=e.length;u<d;u++){let g=e[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:p,sort:f}}function T3(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new Ub,e.set(i,[r])):s>=a.length?(r=new Ub,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function A3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new U,color:new It};break;case"SpotLight":n={position:new U,direction:new U,color:new It,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new U,color:new It,distance:0,decay:0};break;case"HemisphereLight":n={direction:new U,skyColor:new It,groundColor:new It};break;case"RectAreaLight":n={color:new It,position:new U,halfWidth:new U,halfHeight:new U};break}return e[t.id]=n,n}}}function w3(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new bt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new bt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var C3=0;function R3(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function D3(e){let t=new A3,n=w3(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new U);let s=new U,a=new Se,r=new Se;function o(c){let f=0,p=0,u=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let d=0,g=0,M=0,m=0,h=0,_=0,S=0,y=0,E=0,A=0,w=0;c.sort(R3);for(let T=0,D=c.length;T<D;T++){let N=c[T],R=N.color,P=N.intensity,G=N.distance,z=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===Da?z=N.shadow.map.texture:z=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)f+=R.r*P,p+=R.g*P,u+=R.b*P;else if(N.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(N.sh.coefficients[k],P);w++}else if(N.isDirectionalLight){let k=t.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let q=N.shadow,K=n.get(N);K.shadowIntensity=q.intensity,K.shadowBias=q.bias,K.shadowNormalBias=q.normalBias,K.shadowRadius=q.radius,K.shadowMapSize=q.mapSize,i.directionalShadow[d]=K,i.directionalShadowMap[d]=z,i.directionalShadowMatrix[d]=N.shadow.matrix,_++}i.directional[d]=k,d++}else if(N.isSpotLight){let k=t.get(N);k.position.setFromMatrixPosition(N.matrixWorld),k.color.copy(R).multiplyScalar(P),k.distance=G,k.coneCos=Math.cos(N.angle),k.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),k.decay=N.decay,i.spot[M]=k;let q=N.shadow;if(N.map&&(i.spotLightMap[E]=N.map,E++,q.updateMatrices(N),N.castShadow&&A++),i.spotLightMatrix[M]=q.matrix,N.castShadow){let K=n.get(N);K.shadowIntensity=q.intensity,K.shadowBias=q.bias,K.shadowNormalBias=q.normalBias,K.shadowRadius=q.radius,K.shadowMapSize=q.mapSize,i.spotShadow[M]=K,i.spotShadowMap[M]=z,y++}M++}else if(N.isRectAreaLight){let k=t.get(N);k.color.copy(R).multiplyScalar(P),k.halfWidth.set(N.width*.5,0,0),k.halfHeight.set(0,N.height*.5,0),i.rectArea[m]=k,m++}else if(N.isPointLight){let k=t.get(N);if(k.color.copy(N.color).multiplyScalar(N.intensity),k.distance=N.distance,k.decay=N.decay,N.castShadow){let q=N.shadow,K=n.get(N);K.shadowIntensity=q.intensity,K.shadowBias=q.bias,K.shadowNormalBias=q.normalBias,K.shadowRadius=q.radius,K.shadowMapSize=q.mapSize,K.shadowCameraNear=q.camera.near,K.shadowCameraFar=q.camera.far,i.pointShadow[g]=K,i.pointShadowMap[g]=z,i.pointShadowMatrix[g]=N.shadow.matrix,S++}i.point[g]=k,g++}else if(N.isHemisphereLight){let k=t.get(N);k.skyColor.copy(N.color).multiplyScalar(P),k.groundColor.copy(N.groundColor).multiplyScalar(P),i.hemi[h]=k,h++}}m>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=dt.LTC_FLOAT_1,i.rectAreaLTC2=dt.LTC_FLOAT_2):(i.rectAreaLTC1=dt.LTC_HALF_1,i.rectAreaLTC2=dt.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=p,i.ambient[2]=u;let v=i.hash;(v.directionalLength!==d||v.pointLength!==g||v.spotLength!==M||v.rectAreaLength!==m||v.hemiLength!==h||v.numDirectionalShadows!==_||v.numPointShadows!==S||v.numSpotShadows!==y||v.numSpotMaps!==E||v.numLightProbes!==w)&&(i.directional.length=d,i.spot.length=M,i.rectArea.length=m,i.point.length=g,i.hemi.length=h,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=S,i.pointShadowMap.length=S,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=S,i.spotLightMatrix.length=y+E-A,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=w,v.directionalLength=d,v.pointLength=g,v.spotLength=M,v.rectAreaLength=m,v.hemiLength=h,v.numDirectionalShadows=_,v.numPointShadows=S,v.numSpotShadows=y,v.numSpotMaps=E,v.numLightProbes=w,i.version=C3++)}function l(c,f){let p=0,u=0,d=0,g=0,M=0,m=f.matrixWorldInverse;for(let h=0,_=c.length;h<_;h++){let S=c[h];if(S.isDirectionalLight){let y=i.directional[p];y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),p++}else if(S.isSpotLight){let y=i.spot[d];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(S.isRectAreaLight){let y=i.rectArea[g];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),r.identity(),a.copy(S.matrixWorld),a.premultiply(m),r.extractRotation(a),y.halfWidth.set(S.width*.5,0,0),y.halfHeight.set(0,S.height*.5,0),y.halfWidth.applyMatrix4(r),y.halfHeight.applyMatrix4(r),g++}else if(S.isPointLight){let y=i.point[u];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),u++}else if(S.isHemisphereLight){let y=i.hemi[M];y.direction.setFromMatrixPosition(S.matrixWorld),y.direction.transformDirection(m),M++}}}return{setup:o,setupView:l,state:i}}function Lb(e){let t=new D3(e),n=[],i=[],s=[];function a(u){p.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function f(u){t.setupView(n,u)}let p={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:p,setupLights:c,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function N3(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new Lb(e),t.set(s,[o])):a>=r.length?(o=new Lb(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var U3=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,L3=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,O3=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],I3=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Ob=new Se,Xc=new U,O0=new U;function P3(e,t,n){let i=new Oo,s=new bt,a=new bt,r=new Ue,o=new Sf,l=new Mf,c={},f=n.maxTextureSize,p={[Ns]:Un,[Un]:Ns,[Qi]:Qi},u=new ri({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new bt},radius:{value:4}},vertexShader:U3,fragmentShader:L3}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new hn;g.setAttribute("position",new Tn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let M=new Je(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Lc;let h=this.type;this.render=function(A,w,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;this.type===Pf&&(wt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Lc);let T=e.getRenderTarget(),D=e.getActiveCubeFace(),N=e.getActiveMipmapLevel(),R=e.state;R.setBlending($i),R.buffers.depth.getReversed()===!0?R.buffers.color.setClear(0,0,0,0):R.buffers.color.setClear(1,1,1,1),R.buffers.depth.setTest(!0),R.setScissorTest(!1);let P=h!==this.type;P&&w.traverse(function(G){G.material&&(Array.isArray(G.material)?G.material.forEach(z=>z.needsUpdate=!0):G.material.needsUpdate=!0)});for(let G=0,z=A.length;G<z;G++){let k=A[G],q=k.shadow;if(q===void 0){wt("WebGLShadowMap:",k,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;s.copy(q.mapSize);let K=q.getFrameExtents();s.multiply(K),a.copy(q.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/K.x),s.x=a.x*K.x,q.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/K.y),s.y=a.y*K.y,q.mapSize.y=a.y));let nt=e.state.buffers.depth.getReversed();if(q.camera._reversedDepth=nt,q.map===null||P===!0){if(q.map!==null&&(q.map.depthTexture!==null&&(q.map.depthTexture.dispose(),q.map.depthTexture=null),q.map.dispose()),this.type===Ho){if(k.isPointLight){wt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}q.map=new ai(s.x,s.y,{format:Da,type:ts,minFilter:yn,magFilter:yn,generateMipmaps:!1}),q.map.texture.name=k.name+".shadowMap",q.map.depthTexture=new Os(s.x,s.y,Oi),q.map.depthTexture.name=k.name+".shadowMapDepth",q.map.depthTexture.format=Ji,q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=cn,q.map.depthTexture.magFilter=cn}else k.isPointLight?(q.map=new Cd(s.x),q.map.depthTexture=new yf(s.x,Li)):(q.map=new ai(s.x,s.y),q.map.depthTexture=new Os(s.x,s.y,Li)),q.map.depthTexture.name=k.name+".shadowMap",q.map.depthTexture.format=Ji,this.type===Lc?(q.map.depthTexture.compareFunction=nt?Ed:bd,q.map.depthTexture.minFilter=yn,q.map.depthTexture.magFilter=yn):(q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=cn,q.map.depthTexture.magFilter=cn);q.camera.updateProjectionMatrix()}let ut=q.map.isWebGLCubeRenderTarget?6:1;for(let ht=0;ht<ut;ht++){if(q.map.isWebGLCubeRenderTarget)e.setRenderTarget(q.map,ht),e.clear();else{ht===0&&(e.setRenderTarget(q.map),e.clear());let yt=q.getViewport(ht);r.set(a.x*yt.x,a.y*yt.y,a.x*yt.z,a.y*yt.w),R.viewport(r)}if(k.isPointLight){let yt=q.camera,jt=q.matrix,Re=k.distance||yt.far;Re!==yt.far&&(yt.far=Re,yt.updateProjectionMatrix()),Xc.setFromMatrixPosition(k.matrixWorld),yt.position.copy(Xc),O0.copy(yt.position),O0.add(O3[ht]),yt.up.copy(I3[ht]),yt.lookAt(O0),yt.updateMatrixWorld(),jt.makeTranslation(-Xc.x,-Xc.y,-Xc.z),Ob.multiplyMatrices(yt.projectionMatrix,yt.matrixWorldInverse),q._frustum.setFromProjectionMatrix(Ob,yt.coordinateSystem,yt.reversedDepth)}else q.updateMatrices(k);i=q.getFrustum(),y(w,v,q.camera,k,this.type)}q.isPointLightShadow!==!0&&this.type===Ho&&_(q,v),q.needsUpdate=!1}h=this.type,m.needsUpdate=!1,e.setRenderTarget(T,D,N)};function _(A,w){let v=t.update(M);u.defines.VSM_SAMPLES!==A.blurSamples&&(u.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ai(s.x,s.y,{format:Da,type:ts})),u.uniforms.shadow_pass.value=A.map.depthTexture,u.uniforms.resolution.value=A.mapSize,u.uniforms.radius.value=A.radius,e.setRenderTarget(A.mapPass),e.clear(),e.renderBufferDirect(w,null,v,u,M,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,e.setRenderTarget(A.map),e.clear(),e.renderBufferDirect(w,null,v,d,M,null)}function S(A,w,v,T){let D=null,N=v.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(N!==void 0)D=N;else if(D=v.isPointLight===!0?l:o,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let R=D.uuid,P=w.uuid,G=c[R];G===void 0&&(G={},c[R]=G);let z=G[P];z===void 0&&(z=D.clone(),G[P]=z,w.addEventListener("dispose",E)),D=z}if(D.visible=w.visible,D.wireframe=w.wireframe,T===Ho?D.side=w.shadowSide!==null?w.shadowSide:w.side:D.side=w.shadowSide!==null?w.shadowSide:p[w.side],D.alphaMap=w.alphaMap,D.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,D.map=w.map,D.clipShadows=w.clipShadows,D.clippingPlanes=w.clippingPlanes,D.clipIntersection=w.clipIntersection,D.displacementMap=w.displacementMap,D.displacementScale=w.displacementScale,D.displacementBias=w.displacementBias,D.wireframeLinewidth=w.wireframeLinewidth,D.linewidth=w.linewidth,v.isPointLight===!0&&D.isMeshDistanceMaterial===!0){let R=e.properties.get(D);R.light=v}return D}function y(A,w,v,T,D){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&D===Ho)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,A.matrixWorld);let P=t.update(A),G=A.material;if(Array.isArray(G)){let z=P.groups;for(let k=0,q=z.length;k<q;k++){let K=z[k],nt=G[K.materialIndex];if(nt&&nt.visible){let ut=S(A,nt,T,D);A.onBeforeShadow(e,A,w,v,P,ut,K),e.renderBufferDirect(v,null,P,ut,A,K),A.onAfterShadow(e,A,w,v,P,ut,K)}}}else if(G.visible){let z=S(A,G,T,D);A.onBeforeShadow(e,A,w,v,P,z,null),e.renderBufferDirect(v,null,P,z,A,null),A.onAfterShadow(e,A,w,v,P,z,null)}}let R=A.children;for(let P=0,G=R.length;P<G;P++)y(R[P],w,v,T,D)}function E(A){A.target.removeEventListener("dispose",E);for(let v in c){let T=c[v],D=A.target.uuid;D in T&&(T[D].dispose(),delete T[D])}}}function B3(e,t){function n(){let L=!1,at=new Ue,j=null,ct=new Ue(0,0,0,0);return{setMask:function(gt){j!==gt&&!L&&(e.colorMask(gt,gt,gt,gt),j=gt)},setLocked:function(gt){L=gt},setClear:function(gt,tt,Mt,xt,Oe){Oe===!0&&(gt*=xt,tt*=xt,Mt*=xt),at.set(gt,tt,Mt,xt),ct.equals(at)===!1&&(e.clearColor(gt,tt,Mt,xt),ct.copy(at))},reset:function(){L=!1,j=null,ct.set(-1,0,0,0)}}}function i(){let L=!1,at=!1,j=null,ct=null,gt=null;return{setReversed:function(tt){if(at!==tt){let Mt=t.get("EXT_clip_control");tt?Mt.clipControlEXT(Mt.LOWER_LEFT_EXT,Mt.ZERO_TO_ONE_EXT):Mt.clipControlEXT(Mt.LOWER_LEFT_EXT,Mt.NEGATIVE_ONE_TO_ONE_EXT),at=tt;let xt=gt;gt=null,this.setClear(xt)}},getReversed:function(){return at},setTest:function(tt){tt?et(e.DEPTH_TEST):Lt(e.DEPTH_TEST)},setMask:function(tt){j!==tt&&!L&&(e.depthMask(tt),j=tt)},setFunc:function(tt){if(at&&(tt=lb[tt]),ct!==tt){switch(tt){case $h:e.depthFunc(e.NEVER);break;case tf:e.depthFunc(e.ALWAYS);break;case ef:e.depthFunc(e.LESS);break;case rr:e.depthFunc(e.LEQUAL);break;case nf:e.depthFunc(e.EQUAL);break;case sf:e.depthFunc(e.GEQUAL);break;case af:e.depthFunc(e.GREATER);break;case rf:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ct=tt}},setLocked:function(tt){L=tt},setClear:function(tt){gt!==tt&&(gt=tt,at&&(tt=1-tt),e.clearDepth(tt))},reset:function(){L=!1,j=null,ct=null,gt=null,at=!1}}}function s(){let L=!1,at=null,j=null,ct=null,gt=null,tt=null,Mt=null,xt=null,Oe=null;return{setTest:function(ve){L||(ve?et(e.STENCIL_TEST):Lt(e.STENCIL_TEST))},setMask:function(ve){at!==ve&&!L&&(e.stencilMask(ve),at=ve)},setFunc:function(ve,Ii,Pi){(j!==ve||ct!==Ii||gt!==Pi)&&(e.stencilFunc(ve,Ii,Pi),j=ve,ct=Ii,gt=Pi)},setOp:function(ve,Ii,Pi){(tt!==ve||Mt!==Ii||xt!==Pi)&&(e.stencilOp(ve,Ii,Pi),tt=ve,Mt=Ii,xt=Pi)},setLocked:function(ve){L=ve},setClear:function(ve){Oe!==ve&&(e.clearStencil(ve),Oe=ve)},reset:function(){L=!1,at=null,j=null,ct=null,gt=null,tt=null,Mt=null,xt=null,Oe=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,f={},p={},u={},d=new WeakMap,g=[],M=null,m=!1,h=null,_=null,S=null,y=null,E=null,A=null,w=null,v=new It(0,0,0),T=0,D=!1,N=null,R=null,P=null,G=null,z=null,k=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,K=0,nt=e.getParameter(e.VERSION);nt.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(nt)[1]),q=K>=1):nt.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(nt)[1]),q=K>=2);let ut=null,ht={},yt=e.getParameter(e.SCISSOR_BOX),jt=e.getParameter(e.VIEWPORT),Re=new Ue().fromArray(yt),Jt=new Ue().fromArray(jt);function J(L,at,j,ct){let gt=new Uint8Array(4),tt=e.createTexture();e.bindTexture(L,tt),e.texParameteri(L,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(L,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Mt=0;Mt<j;Mt++)L===e.TEXTURE_3D||L===e.TEXTURE_2D_ARRAY?e.texImage3D(at,0,e.RGBA,1,1,ct,0,e.RGBA,e.UNSIGNED_BYTE,gt):e.texImage2D(at+Mt,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,gt);return tt}let it={};it[e.TEXTURE_2D]=J(e.TEXTURE_2D,e.TEXTURE_2D,1),it[e.TEXTURE_CUBE_MAP]=J(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),it[e.TEXTURE_2D_ARRAY]=J(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),it[e.TEXTURE_3D]=J(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),et(e.DEPTH_TEST),r.setFunc(rr),ke(!1),je(i0),et(e.CULL_FACE),te($i);function et(L){f[L]!==!0&&(e.enable(L),f[L]=!0)}function Lt(L){f[L]!==!1&&(e.disable(L),f[L]=!1)}function Bt(L,at){return u[L]!==at?(e.bindFramebuffer(L,at),u[L]=at,L===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=at),L===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=at),!0):!1}function Dt(L,at){let j=g,ct=!1;if(L){j=d.get(at),j===void 0&&(j=[],d.set(at,j));let gt=L.textures;if(j.length!==gt.length||j[0]!==e.COLOR_ATTACHMENT0){for(let tt=0,Mt=gt.length;tt<Mt;tt++)j[tt]=e.COLOR_ATTACHMENT0+tt;j.length=gt.length,ct=!0}}else j[0]!==e.BACK&&(j[0]=e.BACK,ct=!0);ct&&e.drawBuffers(j)}function ze(L){return M!==L?(e.useProgram(L),M=L,!0):!1}let qt={[ya]:e.FUNC_ADD,[NM]:e.FUNC_SUBTRACT,[UM]:e.FUNC_REVERSE_SUBTRACT};qt[LM]=e.MIN,qt[OM]=e.MAX;let de={[IM]:e.ZERO,[PM]:e.ONE,[BM]:e.SRC_COLOR,[jh]:e.SRC_ALPHA,[kM]:e.SRC_ALPHA_SATURATE,[HM]:e.DST_COLOR,[FM]:e.DST_ALPHA,[zM]:e.ONE_MINUS_SRC_COLOR,[Qh]:e.ONE_MINUS_SRC_ALPHA,[GM]:e.ONE_MINUS_DST_COLOR,[VM]:e.ONE_MINUS_DST_ALPHA,[XM]:e.CONSTANT_COLOR,[WM]:e.ONE_MINUS_CONSTANT_COLOR,[qM]:e.CONSTANT_ALPHA,[YM]:e.ONE_MINUS_CONSTANT_ALPHA};function te(L,at,j,ct,gt,tt,Mt,xt,Oe,ve){if(L===$i){m===!0&&(Lt(e.BLEND),m=!1);return}if(m===!1&&(et(e.BLEND),m=!0),L!==DM){if(L!==h||ve!==D){if((_!==ya||E!==ya)&&(e.blendEquation(e.FUNC_ADD),_=ya,E=ya),ve)switch(L){case ar:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case s0:e.blendFunc(e.ONE,e.ONE);break;case a0:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case r0:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Rt("WebGLState: Invalid blending: ",L);break}else switch(L){case ar:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case s0:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case a0:Rt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case r0:Rt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Rt("WebGLState: Invalid blending: ",L);break}S=null,y=null,A=null,w=null,v.set(0,0,0),T=0,h=L,D=ve}return}gt=gt||at,tt=tt||j,Mt=Mt||ct,(at!==_||gt!==E)&&(e.blendEquationSeparate(qt[at],qt[gt]),_=at,E=gt),(j!==S||ct!==y||tt!==A||Mt!==w)&&(e.blendFuncSeparate(de[j],de[ct],de[tt],de[Mt]),S=j,y=ct,A=tt,w=Mt),(xt.equals(v)===!1||Oe!==T)&&(e.blendColor(xt.r,xt.g,xt.b,Oe),v.copy(xt),T=Oe),h=L,D=!1}function Qt(L,at){L.side===Qi?Lt(e.CULL_FACE):et(e.CULL_FACE);let j=L.side===Un;at&&(j=!j),ke(j),L.blending===ar&&L.transparent===!1?te($i):te(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),r.setFunc(L.depthFunc),r.setTest(L.depthTest),r.setMask(L.depthWrite),a.setMask(L.colorWrite);let ct=L.stencilWrite;o.setTest(ct),ct&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),fn(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?et(e.SAMPLE_ALPHA_TO_COVERAGE):Lt(e.SAMPLE_ALPHA_TO_COVERAGE)}function ke(L){N!==L&&(L?e.frontFace(e.CW):e.frontFace(e.CCW),N=L)}function je(L){L!==CM?(et(e.CULL_FACE),L!==R&&(L===i0?e.cullFace(e.BACK):L===RM?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Lt(e.CULL_FACE),R=L}function sn(L){L!==P&&(q&&e.lineWidth(L),P=L)}function fn(L,at,j){L?(et(e.POLYGON_OFFSET_FILL),(G!==at||z!==j)&&(G=at,z=j,r.getReversed()&&(at=-at),e.polygonOffset(at,j))):Lt(e.POLYGON_OFFSET_FILL)}function Le(L){L?et(e.SCISSOR_TEST):Lt(e.SCISSOR_TEST)}function Xe(L){L===void 0&&(L=e.TEXTURE0+k-1),ut!==L&&(e.activeTexture(L),ut=L)}function O(L,at,j){j===void 0&&(ut===null?j=e.TEXTURE0+k-1:j=ut);let ct=ht[j];ct===void 0&&(ct={type:void 0,texture:void 0},ht[j]=ct),(ct.type!==L||ct.texture!==at)&&(ut!==j&&(e.activeTexture(j),ut=j),e.bindTexture(L,at||it[L]),ct.type=L,ct.texture=at)}function On(){let L=ht[ut];L!==void 0&&L.type!==void 0&&(e.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function se(){try{e.compressedTexImage2D(...arguments)}catch(L){Rt("WebGLState:",L)}}function C(){try{e.compressedTexImage3D(...arguments)}catch(L){Rt("WebGLState:",L)}}function x(){try{e.texSubImage2D(...arguments)}catch(L){Rt("WebGLState:",L)}}function B(){try{e.texSubImage3D(...arguments)}catch(L){Rt("WebGLState:",L)}}function H(){try{e.compressedTexSubImage2D(...arguments)}catch(L){Rt("WebGLState:",L)}}function Y(){try{e.compressedTexSubImage3D(...arguments)}catch(L){Rt("WebGLState:",L)}}function st(){try{e.texStorage2D(...arguments)}catch(L){Rt("WebGLState:",L)}}function rt(){try{e.texStorage3D(...arguments)}catch(L){Rt("WebGLState:",L)}}function Z(){try{e.texImage2D(...arguments)}catch(L){Rt("WebGLState:",L)}}function Q(){try{e.texImage3D(...arguments)}catch(L){Rt("WebGLState:",L)}}function ot(L){return p[L]!==void 0?p[L]:e.getParameter(L)}function Et(L,at){p[L]!==at&&(e.pixelStorei(L,at),p[L]=at)}function ft(L){Re.equals(L)===!1&&(e.scissor(L.x,L.y,L.z,L.w),Re.copy(L))}function lt(L){Jt.equals(L)===!1&&(e.viewport(L.x,L.y,L.z,L.w),Jt.copy(L))}function Ct(L,at){let j=c.get(at);j===void 0&&(j=new WeakMap,c.set(at,j));let ct=j.get(L);ct===void 0&&(ct=e.getUniformBlockIndex(at,L.name),j.set(L,ct))}function Nt(L,at){let ct=c.get(at).get(L);l.get(at)!==ct&&(e.uniformBlockBinding(at,ct,L.__bindingPointIndex),l.set(at,ct))}function zt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),f={},p={},ut=null,ht={},u={},d=new WeakMap,g=[],M=null,m=!1,h=null,_=null,S=null,y=null,E=null,A=null,w=null,v=new It(0,0,0),T=0,D=!1,N=null,R=null,P=null,G=null,z=null,Re.set(0,0,e.canvas.width,e.canvas.height),Jt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:et,disable:Lt,bindFramebuffer:Bt,drawBuffers:Dt,useProgram:ze,setBlending:te,setMaterial:Qt,setFlipSided:ke,setCullFace:je,setLineWidth:sn,setPolygonOffset:fn,setScissorTest:Le,activeTexture:Xe,bindTexture:O,unbindTexture:On,compressedTexImage2D:se,compressedTexImage3D:C,texImage2D:Z,texImage3D:Q,pixelStorei:Et,getParameter:ot,updateUBOMapping:Ct,uniformBlockBinding:Nt,texStorage2D:st,texStorage3D:rt,texSubImage2D:x,texSubImage3D:B,compressedTexSubImage2D:H,compressedTexSubImage3D:Y,scissor:ft,viewport:lt,reset:zt}}function z3(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new bt,f=new WeakMap,p=new Set,u,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(C,x){return g?new OffscreenCanvas(C,x):oc("canvas")}function m(C,x,B){let H=1,Y=se(C);if((Y.width>B||Y.height>B)&&(H=B/Math.max(Y.width,Y.height)),H<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let st=Math.floor(H*Y.width),rt=Math.floor(H*Y.height);u===void 0&&(u=M(st,rt));let Z=x?M(st,rt):u;return Z.width=st,Z.height=rt,Z.getContext("2d").drawImage(C,0,0,st,rt),wt("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+st+"x"+rt+")."),Z}else return"data"in C&&wt("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),C;return C}function h(C){return C.generateMipmaps}function _(C){e.generateMipmap(C)}function S(C){return C.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?e.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(C,x,B,H,Y,st=!1){if(C!==null){if(e[C]!==void 0)return e[C];wt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let rt;H&&(rt=t.get("EXT_texture_norm16"),rt||wt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=x;if(x===e.RED&&(B===e.FLOAT&&(Z=e.R32F),B===e.HALF_FLOAT&&(Z=e.R16F),B===e.UNSIGNED_BYTE&&(Z=e.R8),B===e.UNSIGNED_SHORT&&rt&&(Z=rt.R16_EXT),B===e.SHORT&&rt&&(Z=rt.R16_SNORM_EXT)),x===e.RED_INTEGER&&(B===e.UNSIGNED_BYTE&&(Z=e.R8UI),B===e.UNSIGNED_SHORT&&(Z=e.R16UI),B===e.UNSIGNED_INT&&(Z=e.R32UI),B===e.BYTE&&(Z=e.R8I),B===e.SHORT&&(Z=e.R16I),B===e.INT&&(Z=e.R32I)),x===e.RG&&(B===e.FLOAT&&(Z=e.RG32F),B===e.HALF_FLOAT&&(Z=e.RG16F),B===e.UNSIGNED_BYTE&&(Z=e.RG8),B===e.UNSIGNED_SHORT&&rt&&(Z=rt.RG16_EXT),B===e.SHORT&&rt&&(Z=rt.RG16_SNORM_EXT)),x===e.RG_INTEGER&&(B===e.UNSIGNED_BYTE&&(Z=e.RG8UI),B===e.UNSIGNED_SHORT&&(Z=e.RG16UI),B===e.UNSIGNED_INT&&(Z=e.RG32UI),B===e.BYTE&&(Z=e.RG8I),B===e.SHORT&&(Z=e.RG16I),B===e.INT&&(Z=e.RG32I)),x===e.RGB_INTEGER&&(B===e.UNSIGNED_BYTE&&(Z=e.RGB8UI),B===e.UNSIGNED_SHORT&&(Z=e.RGB16UI),B===e.UNSIGNED_INT&&(Z=e.RGB32UI),B===e.BYTE&&(Z=e.RGB8I),B===e.SHORT&&(Z=e.RGB16I),B===e.INT&&(Z=e.RGB32I)),x===e.RGBA_INTEGER&&(B===e.UNSIGNED_BYTE&&(Z=e.RGBA8UI),B===e.UNSIGNED_SHORT&&(Z=e.RGBA16UI),B===e.UNSIGNED_INT&&(Z=e.RGBA32UI),B===e.BYTE&&(Z=e.RGBA8I),B===e.SHORT&&(Z=e.RGBA16I),B===e.INT&&(Z=e.RGBA32I)),x===e.RGB&&(B===e.UNSIGNED_SHORT&&rt&&(Z=rt.RGB16_EXT),B===e.SHORT&&rt&&(Z=rt.RGB16_SNORM_EXT),B===e.UNSIGNED_INT_5_9_9_9_REV&&(Z=e.RGB9_E5),B===e.UNSIGNED_INT_10F_11F_11F_REV&&(Z=e.R11F_G11F_B10F)),x===e.RGBA){let Q=st?rc:Zt.getTransfer(Y);B===e.FLOAT&&(Z=e.RGBA32F),B===e.HALF_FLOAT&&(Z=e.RGBA16F),B===e.UNSIGNED_BYTE&&(Z=Q===ie?e.SRGB8_ALPHA8:e.RGBA8),B===e.UNSIGNED_SHORT&&rt&&(Z=rt.RGBA16_EXT),B===e.SHORT&&rt&&(Z=rt.RGBA16_SNORM_EXT),B===e.UNSIGNED_SHORT_4_4_4_4&&(Z=e.RGBA4),B===e.UNSIGNED_SHORT_5_5_5_1&&(Z=e.RGB5_A1)}return(Z===e.R16F||Z===e.R32F||Z===e.RG16F||Z===e.RG32F||Z===e.RGBA16F||Z===e.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function E(C,x){let B;return C?x===null||x===Li||x===ko?B=e.DEPTH24_STENCIL8:x===Oi?B=e.DEPTH32F_STENCIL8:x===Go&&(B=e.DEPTH24_STENCIL8,wt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Li||x===ko?B=e.DEPTH_COMPONENT24:x===Oi?B=e.DEPTH_COMPONENT32F:x===Go&&(B=e.DEPTH_COMPONENT16),B}function A(C,x){return h(C)===!0||C.isFramebufferTexture&&C.minFilter!==cn&&C.minFilter!==yn?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function w(C){let x=C.target;x.removeEventListener("dispose",w),T(x),x.isVideoTexture&&f.delete(x),x.isHTMLTexture&&p.delete(x)}function v(C){let x=C.target;x.removeEventListener("dispose",v),N(x)}function T(C){let x=i.get(C);if(x.__webglInit===void 0)return;let B=C.source,H=d.get(B);if(H){let Y=H[x.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&D(C),Object.keys(H).length===0&&d.delete(B)}i.remove(C)}function D(C){let x=i.get(C);e.deleteTexture(x.__webglTexture);let B=C.source,H=d.get(B);delete H[x.__cacheKey],r.memory.textures--}function N(C){let x=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(x.__webglFramebuffer[H]))for(let Y=0;Y<x.__webglFramebuffer[H].length;Y++)e.deleteFramebuffer(x.__webglFramebuffer[H][Y]);else e.deleteFramebuffer(x.__webglFramebuffer[H]);x.__webglDepthbuffer&&e.deleteRenderbuffer(x.__webglDepthbuffer[H])}else{if(Array.isArray(x.__webglFramebuffer))for(let H=0;H<x.__webglFramebuffer.length;H++)e.deleteFramebuffer(x.__webglFramebuffer[H]);else e.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&e.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&e.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let H=0;H<x.__webglColorRenderbuffer.length;H++)x.__webglColorRenderbuffer[H]&&e.deleteRenderbuffer(x.__webglColorRenderbuffer[H]);x.__webglDepthRenderbuffer&&e.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let B=C.textures;for(let H=0,Y=B.length;H<Y;H++){let st=i.get(B[H]);st.__webglTexture&&(e.deleteTexture(st.__webglTexture),r.memory.textures--),i.remove(B[H])}i.remove(C)}let R=0;function P(){R=0}function G(){return R}function z(C){R=C}function k(){let C=R;return C>=s.maxTextures&&wt("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),R+=1,C}function q(C){let x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function K(C,x){let B=i.get(C);if(C.isVideoTexture&&O(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let H=C.image;if(H===null)wt("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)wt("WebGLRenderer: Texture marked for update but image is incomplete");else{Lt(B,C,x);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,B.__webglTexture,e.TEXTURE0+x)}function nt(C,x){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Lt(B,C,x);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,B.__webglTexture,e.TEXTURE0+x)}function ut(C,x){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Lt(B,C,x);return}n.bindTexture(e.TEXTURE_3D,B.__webglTexture,e.TEXTURE0+x)}function ht(C,x){let B=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Bt(B,C,x);return}n.bindTexture(e.TEXTURE_CUBE_MAP,B.__webglTexture,e.TEXTURE0+x)}let yt={[of]:e.REPEAT,[Zi]:e.CLAMP_TO_EDGE,[lf]:e.MIRRORED_REPEAT},jt={[cn]:e.NEAREST,[JM]:e.NEAREST_MIPMAP_NEAREST,[Pc]:e.NEAREST_MIPMAP_LINEAR,[yn]:e.LINEAR,[Ff]:e.LINEAR_MIPMAP_NEAREST,[Ca]:e.LINEAR_MIPMAP_LINEAR},Re={[$M]:e.NEVER,[sb]:e.ALWAYS,[tb]:e.LESS,[bd]:e.LEQUAL,[eb]:e.EQUAL,[Ed]:e.GEQUAL,[nb]:e.GREATER,[ib]:e.NOTEQUAL};function Jt(C,x){if(x.type===Oi&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===yn||x.magFilter===Ff||x.magFilter===Pc||x.magFilter===Ca||x.minFilter===yn||x.minFilter===Ff||x.minFilter===Pc||x.minFilter===Ca)&&wt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(C,e.TEXTURE_WRAP_S,yt[x.wrapS]),e.texParameteri(C,e.TEXTURE_WRAP_T,yt[x.wrapT]),(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)&&e.texParameteri(C,e.TEXTURE_WRAP_R,yt[x.wrapR]),e.texParameteri(C,e.TEXTURE_MAG_FILTER,jt[x.magFilter]),e.texParameteri(C,e.TEXTURE_MIN_FILTER,jt[x.minFilter]),x.compareFunction&&(e.texParameteri(C,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(C,e.TEXTURE_COMPARE_FUNC,Re[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===cn||x.minFilter!==Pc&&x.minFilter!==Ca||x.type===Oi&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");e.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function J(C,x){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",w));let H=x.source,Y=d.get(H);Y===void 0&&(Y={},d.set(H,Y));let st=q(x);if(st!==C.__cacheKey){Y[st]===void 0&&(Y[st]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,B=!0),Y[st].usedTimes++;let rt=Y[C.__cacheKey];rt!==void 0&&(Y[C.__cacheKey].usedTimes--,rt.usedTimes===0&&D(x)),C.__cacheKey=st,C.__webglTexture=Y[st].texture}return B}function it(C,x,B){return Math.floor(Math.floor(C/B)/x)}function et(C,x,B,H){let st=C.updateRanges;if(st.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,x.width,x.height,B,H,x.data);else{st.sort((Et,ft)=>Et.start-ft.start);let rt=0;for(let Et=1;Et<st.length;Et++){let ft=st[rt],lt=st[Et],Ct=ft.start+ft.count,Nt=it(lt.start,x.width,4),zt=it(ft.start,x.width,4);lt.start<=Ct+1&&Nt===zt&&it(lt.start+lt.count-1,x.width,4)===Nt?ft.count=Math.max(ft.count,lt.start+lt.count-ft.start):(++rt,st[rt]=lt)}st.length=rt+1;let Z=n.getParameter(e.UNPACK_ROW_LENGTH),Q=n.getParameter(e.UNPACK_SKIP_PIXELS),ot=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,x.width);for(let Et=0,ft=st.length;Et<ft;Et++){let lt=st[Et],Ct=Math.floor(lt.start/4),Nt=Math.ceil(lt.count/4),zt=Ct%x.width,L=Math.floor(Ct/x.width),at=Nt,j=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,zt),n.pixelStorei(e.UNPACK_SKIP_ROWS,L),n.texSubImage2D(e.TEXTURE_2D,0,zt,L,at,j,B,H,x.data)}C.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,Z),n.pixelStorei(e.UNPACK_SKIP_PIXELS,Q),n.pixelStorei(e.UNPACK_SKIP_ROWS,ot)}}function Lt(C,x,B){let H=e.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(H=e.TEXTURE_2D_ARRAY),x.isData3DTexture&&(H=e.TEXTURE_3D);let Y=J(C,x),st=x.source;n.bindTexture(H,C.__webglTexture,e.TEXTURE0+B);let rt=i.get(st);if(st.version!==rt.__version||Y===!0){if(n.activeTexture(e.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let j=Zt.getPrimaries(Zt.workingColorSpace),ct=x.colorSpace===Is?null:Zt.getPrimaries(x.colorSpace),gt=x.colorSpace===Is||j===ct?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt)}n.pixelStorei(e.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=m(x.image,!1,s.maxTextureSize);Q=On(x,Q);let ot=a.convert(x.format,x.colorSpace),Et=a.convert(x.type),ft=y(x.internalFormat,ot,Et,x.normalized,x.colorSpace,x.isVideoTexture);Jt(H,x);let lt,Ct=x.mipmaps,Nt=x.isVideoTexture!==!0,zt=rt.__version===void 0||Y===!0,L=st.dataReady,at=A(x,Q);if(x.isDepthTexture)ft=E(x.format===Ra,x.type),zt&&(Nt?n.texStorage2D(e.TEXTURE_2D,1,ft,Q.width,Q.height):n.texImage2D(e.TEXTURE_2D,0,ft,Q.width,Q.height,0,ot,Et,null));else if(x.isDataTexture)if(Ct.length>0){Nt&&zt&&n.texStorage2D(e.TEXTURE_2D,at,ft,Ct[0].width,Ct[0].height);for(let j=0,ct=Ct.length;j<ct;j++)lt=Ct[j],Nt?L&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,lt.width,lt.height,ot,Et,lt.data):n.texImage2D(e.TEXTURE_2D,j,ft,lt.width,lt.height,0,ot,Et,lt.data);x.generateMipmaps=!1}else Nt?(zt&&n.texStorage2D(e.TEXTURE_2D,at,ft,Q.width,Q.height),L&&et(x,Q,ot,Et)):n.texImage2D(e.TEXTURE_2D,0,ft,Q.width,Q.height,0,ot,Et,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Nt&&zt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,at,ft,Ct[0].width,Ct[0].height,Q.depth);for(let j=0,ct=Ct.length;j<ct;j++)if(lt=Ct[j],x.format!==Mi)if(ot!==null)if(Nt){if(L)if(x.layerUpdates.size>0){let gt=C0(lt.width,lt.height,x.format,x.type);for(let tt of x.layerUpdates){let Mt=lt.data.subarray(tt*gt/lt.data.BYTES_PER_ELEMENT,(tt+1)*gt/lt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,tt,lt.width,lt.height,1,ot,Mt)}x.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,0,lt.width,lt.height,Q.depth,ot,lt.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,j,ft,lt.width,lt.height,Q.depth,0,lt.data,0,0);else wt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Nt?L&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,0,lt.width,lt.height,Q.depth,ot,Et,lt.data):n.texImage3D(e.TEXTURE_2D_ARRAY,j,ft,lt.width,lt.height,Q.depth,0,ot,Et,lt.data)}else{Nt&&zt&&n.texStorage2D(e.TEXTURE_2D,at,ft,Ct[0].width,Ct[0].height);for(let j=0,ct=Ct.length;j<ct;j++)lt=Ct[j],x.format!==Mi?ot!==null?Nt?L&&n.compressedTexSubImage2D(e.TEXTURE_2D,j,0,0,lt.width,lt.height,ot,lt.data):n.compressedTexImage2D(e.TEXTURE_2D,j,ft,lt.width,lt.height,0,lt.data):wt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Nt?L&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,lt.width,lt.height,ot,Et,lt.data):n.texImage2D(e.TEXTURE_2D,j,ft,lt.width,lt.height,0,ot,Et,lt.data)}else if(x.isDataArrayTexture)if(Nt){if(zt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,at,ft,Q.width,Q.height,Q.depth),L)if(x.layerUpdates.size>0){let j=C0(Q.width,Q.height,x.format,x.type);for(let ct of x.layerUpdates){let gt=Q.data.subarray(ct*j/Q.data.BYTES_PER_ELEMENT,(ct+1)*j/Q.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ct,Q.width,Q.height,1,ot,Et,gt)}x.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ot,Et,Q.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ft,Q.width,Q.height,Q.depth,0,ot,Et,Q.data);else if(x.isData3DTexture)Nt?(zt&&n.texStorage3D(e.TEXTURE_3D,at,ft,Q.width,Q.height,Q.depth),L&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ot,Et,Q.data)):n.texImage3D(e.TEXTURE_3D,0,ft,Q.width,Q.height,Q.depth,0,ot,Et,Q.data);else if(x.isFramebufferTexture){if(zt)if(Nt)n.texStorage2D(e.TEXTURE_2D,at,ft,Q.width,Q.height);else{let j=Q.width,ct=Q.height;for(let gt=0;gt<at;gt++)n.texImage2D(e.TEXTURE_2D,gt,ft,j,ct,0,ot,Et,null),j>>=1,ct>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in e){let j=e.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),p.add(x),j.onpaint=ct=>{let gt=ct.changedElements;for(let tt of p)gt.includes(tt.image)&&(tt.needsUpdate=!0)},j.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,Q);else{let gt=e.RGBA,tt=e.RGBA,Mt=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,gt,tt,Mt,Q)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Ct.length>0){if(Nt&&zt){let j=se(Ct[0]);n.texStorage2D(e.TEXTURE_2D,at,ft,j.width,j.height)}for(let j=0,ct=Ct.length;j<ct;j++)lt=Ct[j],Nt?L&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,ot,Et,lt):n.texImage2D(e.TEXTURE_2D,j,ft,ot,Et,lt);x.generateMipmaps=!1}else if(Nt){if(zt){let j=se(Q);n.texStorage2D(e.TEXTURE_2D,at,ft,j.width,j.height)}L&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,ot,Et,Q)}else n.texImage2D(e.TEXTURE_2D,0,ft,ot,Et,Q);h(x)&&_(H),rt.__version=st.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Bt(C,x,B){if(x.image.length!==6)return;let H=J(C,x),Y=x.source;n.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+B);let st=i.get(Y);if(Y.version!==st.__version||H===!0){n.activeTexture(e.TEXTURE0+B);let rt=Zt.getPrimaries(Zt.workingColorSpace),Z=x.colorSpace===Is?null:Zt.getPrimaries(x.colorSpace),Q=x.colorSpace===Is||rt===Z?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ot=x.isCompressedTexture||x.image[0].isCompressedTexture,Et=x.image[0]&&x.image[0].isDataTexture,ft=[];for(let tt=0;tt<6;tt++)!ot&&!Et?ft[tt]=m(x.image[tt],!0,s.maxCubemapSize):ft[tt]=Et?x.image[tt].image:x.image[tt],ft[tt]=On(x,ft[tt]);let lt=ft[0],Ct=a.convert(x.format,x.colorSpace),Nt=a.convert(x.type),zt=y(x.internalFormat,Ct,Nt,x.normalized,x.colorSpace),L=x.isVideoTexture!==!0,at=st.__version===void 0||H===!0,j=Y.dataReady,ct=A(x,lt);Jt(e.TEXTURE_CUBE_MAP,x);let gt;if(ot){L&&at&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ct,zt,lt.width,lt.height);for(let tt=0;tt<6;tt++){gt=ft[tt].mipmaps;for(let Mt=0;Mt<gt.length;Mt++){let xt=gt[Mt];x.format!==Mi?Ct!==null?L?j&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt,0,0,xt.width,xt.height,Ct,xt.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt,zt,xt.width,xt.height,0,xt.data):wt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt,0,0,xt.width,xt.height,Ct,Nt,xt.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt,zt,xt.width,xt.height,0,Ct,Nt,xt.data)}}}else{if(gt=x.mipmaps,L&&at){gt.length>0&&ct++;let tt=se(ft[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ct,zt,tt.width,tt.height)}for(let tt=0;tt<6;tt++)if(Et){L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,ft[tt].width,ft[tt].height,Ct,Nt,ft[tt].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,zt,ft[tt].width,ft[tt].height,0,Ct,Nt,ft[tt].data);for(let Mt=0;Mt<gt.length;Mt++){let Oe=gt[Mt].image[tt].image;L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt+1,0,0,Oe.width,Oe.height,Ct,Nt,Oe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt+1,zt,Oe.width,Oe.height,0,Ct,Nt,Oe.data)}}else{L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,Ct,Nt,ft[tt]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,zt,Ct,Nt,ft[tt]);for(let Mt=0;Mt<gt.length;Mt++){let xt=gt[Mt];L?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt+1,0,0,Ct,Nt,xt.image[tt]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+tt,Mt+1,zt,Ct,Nt,xt.image[tt])}}}h(x)&&_(e.TEXTURE_CUBE_MAP),st.__version=Y.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Dt(C,x,B,H,Y,st){let rt=a.convert(B.format,B.colorSpace),Z=a.convert(B.type),Q=y(B.internalFormat,rt,Z,B.normalized,B.colorSpace),ot=i.get(x),Et=i.get(B);if(Et.__renderTarget=x,!ot.__hasExternalTextures){let ft=Math.max(1,x.width>>st),lt=Math.max(1,x.height>>st);Y===e.TEXTURE_3D||Y===e.TEXTURE_2D_ARRAY?n.texImage3D(Y,st,Q,ft,lt,x.depth,0,rt,Z,null):n.texImage2D(Y,st,Q,ft,lt,0,rt,Z,null)}n.bindFramebuffer(e.FRAMEBUFFER,C),Xe(x)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,H,Y,Et.__webglTexture,0,Le(x)):(Y===e.TEXTURE_2D||Y>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,H,Y,Et.__webglTexture,st),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ze(C,x,B){if(e.bindRenderbuffer(e.RENDERBUFFER,C),x.depthBuffer){let H=x.depthTexture,Y=H&&H.isDepthTexture?H.type:null,st=E(x.stencilBuffer,Y),rt=x.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Xe(x)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Le(x),st,x.width,x.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,Le(x),st,x.width,x.height):e.renderbufferStorage(e.RENDERBUFFER,st,x.width,x.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,rt,e.RENDERBUFFER,C)}else{let H=x.textures;for(let Y=0;Y<H.length;Y++){let st=H[Y],rt=a.convert(st.format,st.colorSpace),Z=a.convert(st.type),Q=y(st.internalFormat,rt,Z,st.normalized,st.colorSpace);Xe(x)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Le(x),Q,x.width,x.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,Le(x),Q,x.width,x.height):e.renderbufferStorage(e.RENDERBUFFER,Q,x.width,x.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function qt(C,x,B){let H=x.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Y=i.get(x.depthTexture);if(Y.__renderTarget=x,(!Y.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),H){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,x.depthTexture.addEventListener("dispose",w)),Y.__webglTexture===void 0){Y.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,Y.__webglTexture),Jt(e.TEXTURE_CUBE_MAP,x.depthTexture);let ot=a.convert(x.depthTexture.format),Et=a.convert(x.depthTexture.type),ft;x.depthTexture.format===Ji?ft=e.DEPTH_COMPONENT24:x.depthTexture.format===Ra&&(ft=e.DEPTH24_STENCIL8);for(let lt=0;lt<6;lt++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,ft,x.width,x.height,0,ot,Et,null)}}else K(x.depthTexture,0);let st=Y.__webglTexture,rt=Le(x),Z=H?e.TEXTURE_CUBE_MAP_POSITIVE_X+B:e.TEXTURE_2D,Q=x.depthTexture.format===Ra?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(x.depthTexture.format===Ji)Xe(x)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Q,Z,st,0,rt):e.framebufferTexture2D(e.FRAMEBUFFER,Q,Z,st,0);else if(x.depthTexture.format===Ra)Xe(x)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Q,Z,st,0,rt):e.framebufferTexture2D(e.FRAMEBUFFER,Q,Z,st,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function de(C){let x=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){let H=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),H){let Y=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,H.removeEventListener("dispose",Y)};H.addEventListener("dispose",Y),x.__depthDisposeCallback=Y}x.__boundDepthTexture=H}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let H=0;H<6;H++)qt(x.__webglFramebuffer[H],C,H);else{let H=C.texture.mipmaps;H&&H.length>0?qt(x.__webglFramebuffer[0],C,0):qt(x.__webglFramebuffer,C,0)}else if(B){x.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(n.bindFramebuffer(e.FRAMEBUFFER,x.__webglFramebuffer[H]),x.__webglDepthbuffer[H]===void 0)x.__webglDepthbuffer[H]=e.createRenderbuffer(),ze(x.__webglDepthbuffer[H],C,!1);else{let Y=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,st=x.__webglDepthbuffer[H];e.bindRenderbuffer(e.RENDERBUFFER,st),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,st)}}else{let H=C.texture.mipmaps;if(H&&H.length>0?n.bindFramebuffer(e.FRAMEBUFFER,x.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=e.createRenderbuffer(),ze(x.__webglDepthbuffer,C,!1);else{let Y=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,st=x.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,st),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,st)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function te(C,x,B){let H=i.get(C);x!==void 0&&Dt(H.__webglFramebuffer,C,C.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),B!==void 0&&de(C)}function Qt(C){let x=C.texture,B=i.get(C),H=i.get(x);C.addEventListener("dispose",v);let Y=C.textures,st=C.isWebGLCubeRenderTarget===!0,rt=Y.length>1;if(rt||(H.__webglTexture===void 0&&(H.__webglTexture=e.createTexture()),H.__version=x.version,r.memory.textures++),st){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let Q=0;Q<x.mipmaps.length;Q++)B.__webglFramebuffer[Z][Q]=e.createFramebuffer()}else B.__webglFramebuffer[Z]=e.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<x.mipmaps.length;Z++)B.__webglFramebuffer[Z]=e.createFramebuffer()}else B.__webglFramebuffer=e.createFramebuffer();if(rt)for(let Z=0,Q=Y.length;Z<Q;Z++){let ot=i.get(Y[Z]);ot.__webglTexture===void 0&&(ot.__webglTexture=e.createTexture(),r.memory.textures++)}if(C.samples>0&&Xe(C)===!1){B.__webglMultisampledFramebuffer=e.createFramebuffer(),B.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<Y.length;Z++){let Q=Y[Z];B.__webglColorRenderbuffer[Z]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);let ot=a.convert(Q.format,Q.colorSpace),Et=a.convert(Q.type),ft=y(Q.internalFormat,ot,Et,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),lt=Le(C);e.renderbufferStorageMultisample(e.RENDERBUFFER,lt,ft,C.width,C.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Z,e.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}e.bindRenderbuffer(e.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=e.createRenderbuffer(),ze(B.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(st){n.bindTexture(e.TEXTURE_CUBE_MAP,H.__webglTexture),Jt(e.TEXTURE_CUBE_MAP,x);for(let Z=0;Z<6;Z++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Dt(B.__webglFramebuffer[Z][Q],C,x,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Z,Q);else Dt(B.__webglFramebuffer[Z],C,x,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);h(x)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(rt){for(let Z=0,Q=Y.length;Z<Q;Z++){let ot=Y[Z],Et=i.get(ot),ft=e.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ft=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(ft,Et.__webglTexture),Jt(ft,ot),Dt(B.__webglFramebuffer,C,ot,e.COLOR_ATTACHMENT0+Z,ft,0),h(ot)&&_(ft)}n.unbindTexture()}else{let Z=e.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Z=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(Z,H.__webglTexture),Jt(Z,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Dt(B.__webglFramebuffer[Q],C,x,e.COLOR_ATTACHMENT0,Z,Q);else Dt(B.__webglFramebuffer,C,x,e.COLOR_ATTACHMENT0,Z,0);h(x)&&_(Z),n.unbindTexture()}C.depthBuffer&&de(C)}function ke(C){let x=C.textures;for(let B=0,H=x.length;B<H;B++){let Y=x[B];if(h(Y)){let st=S(C),rt=i.get(Y).__webglTexture;n.bindTexture(st,rt),_(st),n.unbindTexture()}}}let je=[],sn=[];function fn(C){if(C.samples>0){if(Xe(C)===!1){let x=C.textures,B=C.width,H=C.height,Y=e.COLOR_BUFFER_BIT,st=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,rt=i.get(C),Z=x.length>1;if(Z)for(let ot=0;ot<x.length;ot++)n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ot,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ot,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,rt.__webglMultisampledFramebuffer);let Q=C.texture.mipmaps;Q&&Q.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglFramebuffer);for(let ot=0;ot<x.length;ot++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Y|=e.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Y|=e.STENCIL_BUFFER_BIT)),Z){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,rt.__webglColorRenderbuffer[ot]);let Et=i.get(x[ot]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Et,0)}e.blitFramebuffer(0,0,B,H,0,0,B,H,Y,e.NEAREST),l===!0&&(je.length=0,sn.length=0,je.push(e.COLOR_ATTACHMENT0+ot),C.depthBuffer&&C.resolveDepthBuffer===!1&&(je.push(st),sn.push(st),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,sn)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,je))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),Z)for(let ot=0;ot<x.length;ot++){n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ot,e.RENDERBUFFER,rt.__webglColorRenderbuffer[ot]);let Et=i.get(x[ot]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,rt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ot,e.TEXTURE_2D,Et,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,rt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let x=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[x])}}}function Le(C){return Math.min(s.maxSamples,C.samples)}function Xe(C){let x=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function O(C){let x=r.render.frame;f.get(C)!==x&&(f.set(C,x),C.update())}function On(C,x){let B=C.colorSpace,H=C.format,Y=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==ac&&B!==Is&&(Zt.getTransfer(B)===ie?(H!==Mi||Y!==Gn)&&wt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Rt("WebGLTextures: Unsupported texture color space:",B)),x}function se(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=P,this.getTextureUnits=G,this.setTextureUnits=z,this.setTexture2D=K,this.setTexture2DArray=nt,this.setTexture3D=ut,this.setTextureCube=ht,this.rebindTextures=te,this.setupRenderTarget=Qt,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=fn,this.setupDepthRenderbuffer=de,this.setupFrameBufferTexture=Dt,this.useMultisampledRTT=Xe,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function F3(e,t){function n(i,s=Is){let a,r=Zt.getTransfer(s);if(i===Gn)return e.UNSIGNED_BYTE;if(i===Hf)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Gf)return e.UNSIGNED_SHORT_5_5_5_1;if(i===_0)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===v0)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===m0)return e.BYTE;if(i===g0)return e.SHORT;if(i===Go)return e.UNSIGNED_SHORT;if(i===Vf)return e.INT;if(i===Li)return e.UNSIGNED_INT;if(i===Oi)return e.FLOAT;if(i===ts)return e.HALF_FLOAT;if(i===y0)return e.ALPHA;if(i===x0)return e.RGB;if(i===Mi)return e.RGBA;if(i===Ji)return e.DEPTH_COMPONENT;if(i===Ra)return e.DEPTH_STENCIL;if(i===S0)return e.RED;if(i===kf)return e.RED_INTEGER;if(i===Da)return e.RG;if(i===Xf)return e.RG_INTEGER;if(i===Wf)return e.RGBA_INTEGER;if(i===Bc||i===zc||i===Fc||i===Vc)if(r===ie)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===Bc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===zc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Fc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Vc)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===Bc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===zc)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Fc)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Vc)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===qf||i===Yf||i===Zf||i===Kf)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===qf)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Yf)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Zf)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Kf)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Jf||i===jf||i===Qf||i===$f||i===td||i===Hc||i===ed)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Jf||i===jf)return r===ie?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Qf)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===$f)return a.COMPRESSED_R11_EAC;if(i===td)return a.COMPRESSED_SIGNED_R11_EAC;if(i===Hc)return a.COMPRESSED_RG11_EAC;if(i===ed)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===nd||i===id||i===sd||i===ad||i===rd||i===od||i===ld||i===cd||i===ud||i===hd||i===fd||i===dd||i===pd||i===md)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===nd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===id)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===sd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ad)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===rd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===od)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ld)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===cd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ud)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===hd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===fd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===dd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===pd)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===md)return r===ie?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===gd||i===_d||i===vd)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===gd)return r===ie?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===_d)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===vd)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===yd||i===xd||i===Gc||i===Sd)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===yd)return a.COMPRESSED_RED_RGTC1_EXT;if(i===xd)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Gc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Sd)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ko?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var V3=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,H3=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,G0=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new vc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new ri({vertexShader:V3,fragmentShader:H3,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Je(new Mc(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},k0=class extends Ni{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,f=null,p=null,u=null,d=null,g=null,M=typeof XRWebGLBinding<"u",m=new G0,h={},_=n.getContextAttributes(),S=null,y=null,E=[],A=[],w=new bt,v=null,T=new vn;T.viewport=new Ue;let D=new vn;D.viewport=new Ue;let N=[T,D],R=new If,P=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let it=E[J];return it===void 0&&(it=new Uo,E[J]=it),it.getTargetRaySpace()},this.getControllerGrip=function(J){let it=E[J];return it===void 0&&(it=new Uo,E[J]=it),it.getGripSpace()},this.getHand=function(J){let it=E[J];return it===void 0&&(it=new Uo,E[J]=it),it.getHandSpace()};function z(J){let it=A.indexOf(J.inputSource);if(it===-1)return;let et=E[it];et!==void 0&&(et.update(J.inputSource,J.frame,c||r),et.dispatchEvent({type:J.type,data:J.inputSource}))}function k(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",q);for(let J=0;J<E.length;J++){let it=A[J];it!==null&&(A[J]=null,E[J].disconnect(it))}P=null,G=null,m.reset();for(let J in h)delete h[J];t.setRenderTarget(S),d=null,u=null,p=null,s=null,y=null,Jt.stop(),i.isPresenting=!1,t.setPixelRatio(v),t.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){a=J,i.isPresenting===!0&&wt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,i.isPresenting===!0&&wt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return p===null&&M&&(p=new XRWebGLBinding(s,n)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",k),s.addEventListener("inputsourceschange",q),_.xrCompatible!==!0&&await n.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(w),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let et=null,Lt=null,Bt=null;_.depth&&(Bt=_.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,et=_.stencil?Ra:Ji,Lt=_.stencil?ko:Li);let Dt={colorFormat:n.RGBA8,depthFormat:Bt,scaleFactor:a};p=this.getBinding(),u=p.createProjectionLayer(Dt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new ai(u.textureWidth,u.textureHeight,{format:Mi,type:Gn,depthTexture:new Os(u.textureWidth,u.textureHeight,Lt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let et={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,n,et),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new ai(d.framebufferWidth,d.framebufferHeight,{format:Mi,type:Gn,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),Jt.setContext(s),Jt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q(J){for(let it=0;it<J.removed.length;it++){let et=J.removed[it],Lt=A.indexOf(et);Lt>=0&&(A[Lt]=null,E[Lt].disconnect(et))}for(let it=0;it<J.added.length;it++){let et=J.added[it],Lt=A.indexOf(et);if(Lt===-1){for(let Dt=0;Dt<E.length;Dt++)if(Dt>=A.length){A.push(et),Lt=Dt;break}else if(A[Dt]===null){A[Dt]=et,Lt=Dt;break}if(Lt===-1)break}let Bt=E[Lt];Bt&&Bt.connect(et)}}let K=new U,nt=new U;function ut(J,it,et){K.setFromMatrixPosition(it.matrixWorld),nt.setFromMatrixPosition(et.matrixWorld);let Lt=K.distanceTo(nt),Bt=it.projectionMatrix.elements,Dt=et.projectionMatrix.elements,ze=Bt[14]/(Bt[10]-1),qt=Bt[14]/(Bt[10]+1),de=(Bt[9]+1)/Bt[5],te=(Bt[9]-1)/Bt[5],Qt=(Bt[8]-1)/Bt[0],ke=(Dt[8]+1)/Dt[0],je=ze*Qt,sn=ze*ke,fn=Lt/(-Qt+ke),Le=fn*-Qt;if(it.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(Le),J.translateZ(fn),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Bt[10]===-1)J.projectionMatrix.copy(it.projectionMatrix),J.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{let Xe=ze+fn,O=qt+fn,On=je-Le,se=sn+(Lt-Le),C=de*qt/O*Xe,x=te*qt/O*Xe;J.projectionMatrix.makePerspective(On,se,C,x,Xe,O),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function ht(J,it){it===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(it.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let it=J.near,et=J.far;m.texture!==null&&(m.depthNear>0&&(it=m.depthNear),m.depthFar>0&&(et=m.depthFar)),R.near=D.near=T.near=it,R.far=D.far=T.far=et,(P!==R.near||G!==R.far)&&(s.updateRenderState({depthNear:R.near,depthFar:R.far}),P=R.near,G=R.far),R.layers.mask=J.layers.mask|6,T.layers.mask=R.layers.mask&-5,D.layers.mask=R.layers.mask&-3;let Lt=J.parent,Bt=R.cameras;ht(R,Lt);for(let Dt=0;Dt<Bt.length;Dt++)ht(Bt[Dt],Lt);Bt.length===2?ut(R,T,D):R.projectionMatrix.copy(T.projectionMatrix),yt(J,R,Lt)};function yt(J,it,et){et===null?J.matrix.copy(it.matrixWorld):(J.matrix.copy(et.matrixWorld),J.matrix.invert(),J.matrix.multiply(it.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(it.projectionMatrix),J.projectionMatrixInverse.copy(it.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ro*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return R},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(R)},this.getCameraTexture=function(J){return h[J]};let jt=null;function Re(J,it){if(f=it.getViewerPose(c||r),g=it,f!==null){let et=f.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let Lt=!1;et.length!==R.cameras.length&&(R.cameras.length=0,Lt=!0);for(let qt=0;qt<et.length;qt++){let de=et[qt],te=null;if(d!==null)te=d.getViewport(de);else{let ke=p.getViewSubImage(u,de);te=ke.viewport,qt===0&&(t.setRenderTargetTextures(y,ke.colorTexture,ke.depthStencilTexture),t.setRenderTarget(y))}let Qt=N[qt];Qt===void 0&&(Qt=new vn,Qt.layers.enable(qt),Qt.viewport=new Ue,N[qt]=Qt),Qt.matrix.fromArray(de.transform.matrix),Qt.matrix.decompose(Qt.position,Qt.quaternion,Qt.scale),Qt.projectionMatrix.fromArray(de.projectionMatrix),Qt.projectionMatrixInverse.copy(Qt.projectionMatrix).invert(),Qt.viewport.set(te.x,te.y,te.width,te.height),qt===0&&(R.matrix.copy(Qt.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale)),Lt===!0&&R.cameras.push(Qt)}let Bt=s.enabledFeatures;if(Bt&&Bt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){p=i.getBinding();let qt=p.getDepthInformation(et[0]);qt&&qt.isValid&&qt.texture&&m.init(qt,s.renderState)}if(Bt&&Bt.includes("camera-access")&&M){t.state.unbindTexture(),p=i.getBinding();for(let qt=0;qt<et.length;qt++){let de=et[qt].camera;if(de){let te=h[de];te||(te=new vc,h[de]=te);let Qt=p.getCameraImage(de);te.sourceTexture=Qt}}}}for(let et=0;et<E.length;et++){let Lt=A[et],Bt=E[et];Lt!==null&&Bt!==void 0&&Bt.update(Lt,it,c||r)}jt&&jt(J,it),it.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:it}),g=null}let Jt=new Ib;Jt.setAnimationLoop(Re),this.setAnimationLoop=function(J){jt=J},this.dispose=function(){}}},G3=new Se,Hb=new Ot;Hb.set(-1,0,0,0,1,0,0,0,1);function k3(e,t){function n(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function i(m,h){h.color.getRGB(m.fogColor.value,T0(e)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function s(m,h,_,S,y){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?a(m,h):h.isMeshLambertMaterial?(a(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(a(m,h),p(m,h)):h.isMeshPhongMaterial?(a(m,h),f(m,h),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(a(m,h),u(m,h),h.isMeshPhysicalMaterial&&d(m,h,y)):h.isMeshMatcapMaterial?(a(m,h),g(m,h)):h.isMeshDepthMaterial?a(m,h):h.isMeshDistanceMaterial?(a(m,h),M(m,h)):h.isMeshNormalMaterial?a(m,h):h.isLineBasicMaterial?(r(m,h),h.isLineDashedMaterial&&o(m,h)):h.isPointsMaterial?l(m,h,_,S):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function a(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,n(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===Un&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,n(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===Un&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,n(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,n(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,n(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);let _=t.get(h),S=_.envMap,y=_.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(G3.makeRotationFromEuler(y)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Hb),m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,n(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,n(h.aoMap,m.aoMapTransform))}function r(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform))}function o(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,_,S){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*_,m.scale.value=S*.5,h.map&&(m.map.value=h.map,n(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,n(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,n(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function f(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function p(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function u(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,n(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,n(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function d(m,h,_){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,n(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,n(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,n(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,n(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,n(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Un&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,n(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,n(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,n(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,n(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,n(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,n(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,n(h.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,h){h.matcap&&(m.matcap.value=h.matcap)}function M(m,h){let _=t.get(h).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function X3(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){let A=E.program;i.uniformBlockBinding(y,A)}function c(y,E){let A=s[y.id];A===void 0&&(m(y),A=f(y),s[y.id]=A,y.addEventListener("dispose",_));let w=E.program;i.updateUBOMapping(y,w);let v=t.render.frame;a[y.id]!==v&&(u(y),a[y.id]=v)}function f(y){let E=p();y.__bindingPointIndex=E;let A=e.createBuffer(),w=y.__size,v=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,A),e.bufferData(e.UNIFORM_BUFFER,w,v),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,E,A),A}function p(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return Rt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let E=s[y.id],A=y.uniforms,w=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,E);for(let v=0,T=A.length;v<T;v++){let D=A[v];if(Array.isArray(D))for(let N=0,R=D.length;N<R;N++)d(D[N],v,N,w);else d(D,v,0,w)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(y,E,A,w){if(M(y,E,A,w)===!0){let v=y.__offset,T=y.value;if(Array.isArray(T)){let D=0;for(let N=0;N<T.length;N++){let R=T[N],P=h(R);g(R,y.__data,D),typeof R!="number"&&typeof R!="boolean"&&!R.isMatrix3&&!ArrayBuffer.isView(R)&&(D+=P.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,v,y.__data)}}function g(y,E,A){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,A)}function M(y,E,A,w){let v=y.value,T=E+"_"+A;if(w[T]===void 0)return typeof v=="number"||typeof v=="boolean"?w[T]=v:ArrayBuffer.isView(v)?w[T]=v.slice():w[T]=v.clone(),!0;{let D=w[T];if(typeof v=="number"||typeof v=="boolean"){if(D!==v)return w[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(D.equals(v)===!1)return D.copy(v),!0}}return!1}function m(y){let E=y.uniforms,A=0,w=16;for(let T=0,D=E.length;T<D;T++){let N=Array.isArray(E[T])?E[T]:[E[T]];for(let R=0,P=N.length;R<P;R++){let G=N[R],z=Array.isArray(G.value)?G.value:[G.value];for(let k=0,q=z.length;k<q;k++){let K=z[k],nt=h(K),ut=A%w,ht=ut%nt.boundary,yt=ut+ht;A+=ht,yt!==0&&w-yt<nt.storage&&(A+=w-yt),G.__data=new Float32Array(nt.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=A,A+=nt.storage}}}let v=A%w;return v>0&&(A+=w-v),y.__size=A,y.__cache={},this}function h(y){let E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?wt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):wt("WebGLRenderer: Unsupported uniform value type.",y),E}function _(y){let E=y.target;E.removeEventListener("dispose",_);let A=r.indexOf(E.__bindingPointIndex);r.splice(A,1),e.deleteBuffer(s[E.id]),delete s[E.id],delete a[E.id]}function S(){for(let y in s)e.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:S}}var W3=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),es=null;function q3(){return es===null&&(es=new mf(W3,16,16,Da,ts),es.name="DFG_LUT",es.minFilter=yn,es.magFilter=yn,es.wrapS=Zi,es.wrapT=Zi,es.generateMipmaps=!1,es.needsUpdate=!0),es}var Rd=class{constructor(t={}){let{canvas:n=ab(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:d=Gn}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=r;let M=d,m=new Set([Wf,Xf,kf]),h=new Set([Gn,Li,Go,ko,Hf,Gf]),_=new Uint32Array(4),S=new Int32Array(4),y=new U,E=null,A=null,w=[],v=[],T=null;this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let D=this,N=!1,R=null,P=null,G=null,z=null;this._outputColorSpace=En;let k=0,q=0,K=null,nt=-1,ut=null,ht=new Ue,yt=new Ue,jt=null,Re=new It(0),Jt=0,J=n.width,it=n.height,et=1,Lt=null,Bt=null,Dt=new Ue(0,0,J,it),ze=new Ue(0,0,J,it),qt=!1,de=new Oo,te=!1,Qt=!1,ke=new Se,je=new U,sn=new Ue,fn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Le=!1;function Xe(){return K===null?et:1}let O=i;function On(b,I){return n.getContext(b,I)}try{let b={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"185"}`),n.addEventListener("webglcontextlost",Oe,!1),n.addEventListener("webglcontextrestored",ve,!1),n.addEventListener("webglcontextcreationerror",Ii,!1),O===null){let I="webgl2";if(O=On(I,b),O===null)throw On(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(b){throw Rt("WebGLRenderer: "+b.message),b}let se,C,x,B,H,Y,st,rt,Z,Q,ot,Et,ft,lt,Ct,Nt,zt,L,at,j,ct,gt,tt;function Mt(){se=new $R(O),se.init(),ct=new F3(O,se),C=new WR(O,se,t,ct),x=new B3(O,se),C.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),P=O.createFramebuffer(),G=O.createFramebuffer(),z=O.createFramebuffer(),B=new n2(O),H=new b3,Y=new z3(O,se,x,H,C,ct,B),st=new QR(D),rt=new rw(O),gt=new kR(O,rt),Z=new t2(O,rt,B,gt),Q=new s2(O,Z,rt,gt,B),L=new i2(O,C,Y),Ct=new qR(H),ot=new M3(D,st,se,C,gt,Ct),Et=new k3(D,H),ft=new T3,lt=new N3(se),zt=new GR(D,st,x,Q,g,l),Nt=new P3(D,Q,C),tt=new X3(O,B,C,x),at=new XR(O,se,B),j=new e2(O,se,B),B.programs=ot.programs,D.capabilities=C,D.extensions=se,D.properties=H,D.renderLists=ft,D.shadowMap=Nt,D.state=x,D.info=B}Mt(),M!==Gn&&(T=new r2(M,n.width,n.height,o,s,a));let xt=new k0(D,O);this.xr=xt,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let b=se.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=se.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(b){b!==void 0&&(et=b,this.setSize(J,it,!1))},this.getSize=function(b){return b.set(J,it)},this.setSize=function(b,I,X=!0){if(xt.isPresenting){wt("WebGLRenderer: Can't change size while VR device is presenting.");return}J=b,it=I,n.width=Math.floor(b*et),n.height=Math.floor(I*et),X===!0&&(n.style.width=b+"px",n.style.height=I+"px"),T!==null&&T.setSize(n.width,n.height),this.setViewport(0,0,b,I)},this.getDrawingBufferSize=function(b){return b.set(J*et,it*et).floor()},this.setDrawingBufferSize=function(b,I,X){J=b,it=I,et=X,n.width=Math.floor(b*X),n.height=Math.floor(I*X),this.setViewport(0,0,b,I)},this.setEffects=function(b){if(M===Gn){Rt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let I=0;I<b.length;I++)if(b[I].isOutputPass===!0){wt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ht)},this.getViewport=function(b){return b.copy(Dt)},this.setViewport=function(b,I,X,F){b.isVector4?Dt.set(b.x,b.y,b.z,b.w):Dt.set(b,I,X,F),x.viewport(ht.copy(Dt).multiplyScalar(et).round())},this.getScissor=function(b){return b.copy(ze)},this.setScissor=function(b,I,X,F){b.isVector4?ze.set(b.x,b.y,b.z,b.w):ze.set(b,I,X,F),x.scissor(yt.copy(ze).multiplyScalar(et).round())},this.getScissorTest=function(){return qt},this.setScissorTest=function(b){x.setScissorTest(qt=b)},this.setOpaqueSort=function(b){Lt=b},this.setTransparentSort=function(b){Bt=b},this.getClearColor=function(b){return b.copy(zt.getClearColor())},this.setClearColor=function(){zt.setClearColor(...arguments)},this.getClearAlpha=function(){return zt.getClearAlpha()},this.setClearAlpha=function(){zt.setClearAlpha(...arguments)},this.clear=function(b=!0,I=!0,X=!0){let F=0;if(b){let V=!1;if(K!==null){let mt=K.texture.format;V=m.has(mt)}if(V){let mt=K.texture.type,vt=h.has(mt),pt=zt.getClearColor(),St=zt.getClearAlpha(),Tt=pt.r,Ft=pt.g,Gt=pt.b;vt?(_[0]=Tt,_[1]=Ft,_[2]=Gt,_[3]=St,O.clearBufferuiv(O.COLOR,0,_)):(S[0]=Tt,S[1]=Ft,S[2]=Gt,S[3]=St,O.clearBufferiv(O.COLOR,0,S))}else F|=O.COLOR_BUFFER_BIT}I&&(F|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(F|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F!==0&&O.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),R=b},this.dispose=function(){n.removeEventListener("webglcontextlost",Oe,!1),n.removeEventListener("webglcontextrestored",ve,!1),n.removeEventListener("webglcontextcreationerror",Ii,!1),zt.dispose(),ft.dispose(),lt.dispose(),H.dispose(),st.dispose(),Q.dispose(),gt.dispose(),tt.dispose(),ot.dispose(),xt.dispose(),xt.removeEventListener("sessionstart",J0),xt.removeEventListener("sessionend",j0),Ua.stop()};function Oe(b){b.preventDefault(),lc("WebGLRenderer: Context Lost."),N=!0}function ve(){lc("WebGLRenderer: Context Restored."),N=!1;let b=B.autoReset,I=Nt.enabled,X=Nt.autoUpdate,F=Nt.needsUpdate,V=Nt.type;Mt(),B.autoReset=b,Nt.enabled=I,Nt.autoUpdate=X,Nt.needsUpdate=F,Nt.type=V}function Ii(b){Rt("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Pi(b){let I=b.target;I.removeEventListener("dispose",Pi),t1(I)}function t1(b){e1(b),H.remove(b)}function e1(b){let I=H.get(b).programs;I!==void 0&&(I.forEach(function(X){ot.releaseProgram(X)}),b.isShaderMaterial&&ot.releaseShaderCache(b))}this.renderBufferDirect=function(b,I,X,F,V,mt){I===null&&(I=fn);let vt=V.isMesh&&V.matrixWorld.determinantAffine()<0,pt=s1(b,I,X,F,V);x.setMaterial(F,vt);let St=X.index,Tt=1;if(F.wireframe===!0){if(St=Z.getWireframeAttribute(X),St===void 0)return;Tt=2}let Ft=X.drawRange,Gt=X.attributes.position,At=Ft.start*Tt,le=(Ft.start+Ft.count)*Tt;mt!==null&&(At=Math.max(At,mt.start*Tt),le=Math.min(le,(mt.start+mt.count)*Tt)),St!==null?(At=Math.max(At,0),le=Math.min(le,St.count)):Gt!=null&&(At=Math.max(At,0),le=Math.min(le,Gt.count));let Fe=le-At;if(Fe<0||Fe===1/0)return;gt.setup(V,F,pt,X,St);let Ie,pe=at;if(St!==null&&(Ie=rt.get(St),pe=j,pe.setIndex(Ie)),V.isMesh)F.wireframe===!0?(x.setLineWidth(F.wireframeLinewidth*Xe()),pe.setMode(O.LINES)):pe.setMode(O.TRIANGLES);else if(V.isLine){let xn=F.linewidth;xn===void 0&&(xn=1),x.setLineWidth(xn*Xe()),V.isLineSegments?pe.setMode(O.LINES):V.isLineLoop?pe.setMode(O.LINE_LOOP):pe.setMode(O.LINE_STRIP)}else V.isPoints?pe.setMode(O.POINTS):V.isSprite&&pe.setMode(O.TRIANGLES);if(V.isBatchedMesh)if(se.get("WEBGL_multi_draw"))pe.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let xn=V._multiDrawStarts,_t=V._multiDrawCounts,Wn=V._multiDrawCount,$t=St?rt.get(St).bytesPerElement:1,li=H.get(F).currentProgram.getUniforms();for(let Bi=0;Bi<Wn;Bi++)li.setValue(O,"_gl_DrawID",Bi),pe.render(xn[Bi]/$t,_t[Bi])}else if(V.isInstancedMesh)pe.renderInstances(At,Fe,V.count);else if(X.isInstancedBufferGeometry){let xn=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,_t=Math.min(X.instanceCount,xn);pe.renderInstances(At,Fe,_t)}else pe.render(At,Fe)};function K0(b,I,X){b.transparent===!0&&b.side===Qi&&b.forceSinglePass===!1?(b.side=Un,b.needsUpdate=!0,Yc(b,I,X),b.side=Ns,b.needsUpdate=!0,Yc(b,I,X),b.side=Qi):Yc(b,I,X)}this.compile=function(b,I,X=null){X===null&&(X=b),A=lt.get(X),A.init(I),v.push(A),X.traverseVisible(function(V){V.isLight&&V.layers.test(I.layers)&&(A.pushLight(V),V.castShadow&&A.pushShadow(V))}),b!==X&&b.traverseVisible(function(V){V.isLight&&V.layers.test(I.layers)&&(A.pushLight(V),V.castShadow&&A.pushShadow(V))}),A.setupLights();let F=new Set;return b.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let mt=V.material;if(mt)if(Array.isArray(mt))for(let vt=0;vt<mt.length;vt++){let pt=mt[vt];K0(pt,X,V),F.add(pt)}else K0(mt,X,V),F.add(mt)}),A=v.pop(),F},this.compileAsync=function(b,I,X=null){let F=this.compile(b,I,X);return new Promise(V=>{function mt(){if(F.forEach(function(vt){H.get(vt).currentProgram.isReady()&&F.delete(vt)}),F.size===0){V(b);return}setTimeout(mt,10)}se.get("KHR_parallel_shader_compile")!==null?mt():setTimeout(mt,10)})};let Id=null;function n1(b){Id&&Id(b)}function J0(){Ua.stop()}function j0(){Ua.start()}let Ua=new Ib;Ua.setAnimationLoop(n1),typeof self<"u"&&Ua.setContext(self),this.setAnimationLoop=function(b){Id=b,xt.setAnimationLoop(b),b===null?Ua.stop():Ua.start()},xt.addEventListener("sessionstart",J0),xt.addEventListener("sessionend",j0),this.render=function(b,I){if(I!==void 0&&I.isCamera!==!0){Rt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;R!==null&&R.renderStart(b,I);let X=xt.enabled===!0&&xt.isPresenting===!0,F=T!==null&&(K===null||X)&&T.begin(D,K);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),xt.enabled===!0&&xt.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(xt.cameraAutoUpdate===!0&&xt.updateCamera(I),I=xt.getCamera()),b.isScene===!0&&b.onBeforeRender(D,b,I,K),A=lt.get(b,v.length),A.init(I),A.state.textureUnits=Y.getTextureUnits(),v.push(A),ke.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),de.setFromProjectionMatrix(ke,Di,I.reversedDepth),Qt=this.localClippingEnabled,te=Ct.init(this.clippingPlanes,Qt),E=ft.get(b,w.length),E.init(),w.push(E),xt.enabled===!0&&xt.isPresenting===!0){let vt=D.xr.getDepthSensingMesh();vt!==null&&Pd(vt,I,-1/0,D.sortObjects)}Pd(b,I,0,D.sortObjects),E.finish(),D.sortObjects===!0&&E.sort(Lt,Bt,I.reversedDepth),Le=xt.enabled===!1||xt.isPresenting===!1||xt.hasDepthSensing()===!1,Le&&zt.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),te===!0&&Ct.beginShadows();let V=A.state.shadowsArray;if(Nt.render(V,b,I),te===!0&&Ct.endShadows(),(F&&T.hasRenderPass())===!1){let vt=E.opaque,pt=E.transmissive;if(A.setupLights(),I.isArrayCamera){let St=I.cameras;if(pt.length>0)for(let Tt=0,Ft=St.length;Tt<Ft;Tt++){let Gt=St[Tt];$0(vt,pt,b,Gt)}Le&&zt.render(b);for(let Tt=0,Ft=St.length;Tt<Ft;Tt++){let Gt=St[Tt];Q0(E,b,Gt,Gt.viewport)}}else pt.length>0&&$0(vt,pt,b,I),Le&&zt.render(b),Q0(E,b,I)}K!==null&&q===0&&(Y.updateMultisampleRenderTarget(K),Y.updateRenderTargetMipmap(K)),F&&T.end(D),b.isScene===!0&&b.onAfterRender(D,b,I),gt.resetDefaultState(),nt=-1,ut=null,v.pop(),v.length>0?(A=v[v.length-1],Y.setTextureUnits(A.state.textureUnits),te===!0&&Ct.setGlobalState(D.clippingPlanes,A.state.camera)):A=null,w.pop(),w.length>0?E=w[w.length-1]:E=null,R!==null&&R.renderEnd()};function Pd(b,I,X,F){if(b.visible===!1)return;if(b.layers.test(I.layers)){if(b.isGroup)X=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(I);else if(b.isLightProbeGrid)A.pushLightProbeGrid(b);else if(b.isLight)A.pushLight(b),b.castShadow&&A.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||de.intersectsSprite(b)){F&&sn.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ke);let vt=Q.update(b),pt=b.material;pt.visible&&E.push(b,vt,pt,X,sn.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||de.intersectsObject(b))){let vt=Q.update(b),pt=b.material;if(F&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),sn.copy(b.boundingSphere.center)):(vt.boundingSphere===null&&vt.computeBoundingSphere(),sn.copy(vt.boundingSphere.center)),sn.applyMatrix4(b.matrixWorld).applyMatrix4(ke)),Array.isArray(pt)){let St=vt.groups;for(let Tt=0,Ft=St.length;Tt<Ft;Tt++){let Gt=St[Tt],At=pt[Gt.materialIndex];At&&At.visible&&E.push(b,vt,At,X,sn.z,Gt)}}else pt.visible&&E.push(b,vt,pt,X,sn.z,null)}}let mt=b.children;for(let vt=0,pt=mt.length;vt<pt;vt++)Pd(mt[vt],I,X,F)}function Q0(b,I,X,F){let{opaque:V,transmissive:mt,transparent:vt}=b;A.setupLightsView(X),te===!0&&Ct.setGlobalState(D.clippingPlanes,X),F&&x.viewport(ht.copy(F)),V.length>0&&qc(V,I,X),mt.length>0&&qc(mt,I,X),vt.length>0&&qc(vt,I,X),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function $0(b,I,X,F){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[F.id]===void 0){let At=se.has("EXT_color_buffer_half_float")||se.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[F.id]=new ai(1,1,{generateMipmaps:!0,type:At?ts:Gn,minFilter:Ca,samples:Math.max(4,C.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Zt.workingColorSpace})}let mt=A.state.transmissionRenderTarget[F.id],vt=F.viewport||ht;mt.setSize(vt.z*D.transmissionResolutionScale,vt.w*D.transmissionResolutionScale);let pt=D.getRenderTarget(),St=D.getActiveCubeFace(),Tt=D.getActiveMipmapLevel();D.setRenderTarget(mt),D.getClearColor(Re),Jt=D.getClearAlpha(),Jt<1&&D.setClearColor(16777215,.5),D.clear(),Le&&zt.render(X);let Ft=D.toneMapping;D.toneMapping=Ui;let Gt=F.viewport;if(F.viewport!==void 0&&(F.viewport=void 0),A.setupLightsView(F),te===!0&&Ct.setGlobalState(D.clippingPlanes,F),qc(b,X,F),Y.updateMultisampleRenderTarget(mt),Y.updateRenderTargetMipmap(mt),se.has("WEBGL_multisampled_render_to_texture")===!1){let At=!1;for(let le=0,Fe=I.length;le<Fe;le++){let Ie=I[le],{object:pe,geometry:xn,material:_t,group:Wn}=Ie;if(_t.side===Qi&&pe.layers.test(F.layers)){let $t=_t.side;_t.side=Un,_t.needsUpdate=!0,t_(pe,X,F,xn,_t,Wn),_t.side=$t,_t.needsUpdate=!0,At=!0}}At===!0&&(Y.updateMultisampleRenderTarget(mt),Y.updateRenderTargetMipmap(mt))}D.setRenderTarget(pt,St,Tt),D.setClearColor(Re,Jt),Gt!==void 0&&(F.viewport=Gt),D.toneMapping=Ft}function qc(b,I,X){let F=I.isScene===!0?I.overrideMaterial:null;for(let V=0,mt=b.length;V<mt;V++){let vt=b[V],{object:pt,geometry:St,group:Tt}=vt,Ft=vt.material;Ft.allowOverride===!0&&F!==null&&(Ft=F),pt.layers.test(X.layers)&&t_(pt,I,X,St,Ft,Tt)}}function t_(b,I,X,F,V,mt){b.onBeforeRender(D,I,X,F,V,mt),b.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),V.onBeforeRender(D,I,X,F,b,mt),V.transparent===!0&&V.side===Qi&&V.forceSinglePass===!1?(V.side=Un,V.needsUpdate=!0,D.renderBufferDirect(X,I,F,V,b,mt),V.side=Ns,V.needsUpdate=!0,D.renderBufferDirect(X,I,F,V,b,mt),V.side=Qi):D.renderBufferDirect(X,I,F,V,b,mt),b.onAfterRender(D,I,X,F,V,mt)}function Yc(b,I,X){I.isScene!==!0&&(I=fn);let F=H.get(b),V=A.state.lights,mt=A.state.shadowsArray,vt=V.state.version,pt=ot.getParameters(b,V.state,mt,I,X,A.state.lightProbeGridArray),St=ot.getProgramCacheKey(pt),Tt=F.programs;F.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?I.environment:null,F.fog=I.fog;let Ft=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;F.envMap=st.get(b.envMap||F.environment,Ft),F.envMapRotation=F.environment!==null&&b.envMap===null?I.environmentRotation:b.envMapRotation,Tt===void 0&&(b.addEventListener("dispose",Pi),Tt=new Map,F.programs=Tt);let Gt=Tt.get(St);if(Gt!==void 0){if(F.currentProgram===Gt&&F.lightsStateVersion===vt)return n_(b,pt),Gt}else pt.uniforms=ot.getUniforms(b),R!==null&&b.isNodeMaterial&&R.build(b,X,pt),b.onBeforeCompile(pt,D),Gt=ot.acquireProgram(pt,St),Tt.set(St,Gt),F.uniforms=pt.uniforms;let At=F.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(At.clippingPlanes=Ct.uniform),n_(b,pt),F.needsLights=r1(b),F.lightsStateVersion=vt,F.needsLights&&(At.ambientLightColor.value=V.state.ambient,At.lightProbe.value=V.state.probe,At.directionalLights.value=V.state.directional,At.directionalLightShadows.value=V.state.directionalShadow,At.spotLights.value=V.state.spot,At.spotLightShadows.value=V.state.spotShadow,At.rectAreaLights.value=V.state.rectArea,At.ltc_1.value=V.state.rectAreaLTC1,At.ltc_2.value=V.state.rectAreaLTC2,At.pointLights.value=V.state.point,At.pointLightShadows.value=V.state.pointShadow,At.hemisphereLights.value=V.state.hemi,At.directionalShadowMatrix.value=V.state.directionalShadowMatrix,At.spotLightMatrix.value=V.state.spotLightMatrix,At.spotLightMap.value=V.state.spotLightMap,At.pointShadowMatrix.value=V.state.pointShadowMatrix),F.lightProbeGrid=A.state.lightProbeGridArray.length>0,F.currentProgram=Gt,F.uniformsList=null,Gt}function e_(b){if(b.uniformsList===null){let I=b.currentProgram.getUniforms();b.uniformsList=Wo.seqWithValue(I.seq,b.uniforms)}return b.uniformsList}function n_(b,I){let X=H.get(b);X.outputColorSpace=I.outputColorSpace,X.batching=I.batching,X.batchingColor=I.batchingColor,X.instancing=I.instancing,X.instancingColor=I.instancingColor,X.instancingMorph=I.instancingMorph,X.skinning=I.skinning,X.morphTargets=I.morphTargets,X.morphNormals=I.morphNormals,X.morphColors=I.morphColors,X.morphTargetsCount=I.morphTargetsCount,X.numClippingPlanes=I.numClippingPlanes,X.numIntersection=I.numClipIntersection,X.vertexAlphas=I.vertexAlphas,X.vertexTangents=I.vertexTangents,X.toneMapping=I.toneMapping}function i1(b,I){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;y.setFromMatrixPosition(I.matrixWorld);for(let X=0,F=b.length;X<F;X++){let V=b[X];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function s1(b,I,X,F,V){I.isScene!==!0&&(I=fn),Y.resetTextureUnits();let mt=I.fog,vt=F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial?I.environment:null,pt=K===null?D.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:Zt.workingColorSpace,St=F.isMeshStandardMaterial||F.isMeshLambertMaterial&&!F.envMap||F.isMeshPhongMaterial&&!F.envMap,Tt=st.get(F.envMap||vt,St),Ft=F.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Gt=!!X.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),At=!!X.morphAttributes.position,le=!!X.morphAttributes.normal,Fe=!!X.morphAttributes.color,Ie=Ui;F.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Ie=D.toneMapping);let pe=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,xn=pe!==void 0?pe.length:0,_t=H.get(F),Wn=A.state.lights;if(te===!0&&(Qt===!0||b!==ut)){let ye=b===ut&&F.id===nt;Ct.setState(F,b,ye)}let $t=!1;F.version===_t.__version?(_t.needsLights&&_t.lightsStateVersion!==Wn.state.version||_t.outputColorSpace!==pt||V.isBatchedMesh&&_t.batching===!1||!V.isBatchedMesh&&_t.batching===!0||V.isBatchedMesh&&_t.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&_t.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&_t.instancing===!1||!V.isInstancedMesh&&_t.instancing===!0||V.isSkinnedMesh&&_t.skinning===!1||!V.isSkinnedMesh&&_t.skinning===!0||V.isInstancedMesh&&_t.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&_t.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&_t.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&_t.instancingMorph===!1&&V.morphTexture!==null||_t.envMap!==Tt||F.fog===!0&&_t.fog!==mt||_t.numClippingPlanes!==void 0&&(_t.numClippingPlanes!==Ct.numPlanes||_t.numIntersection!==Ct.numIntersection)||_t.vertexAlphas!==Ft||_t.vertexTangents!==Gt||_t.morphTargets!==At||_t.morphNormals!==le||_t.morphColors!==Fe||_t.toneMapping!==Ie||_t.morphTargetsCount!==xn||!!_t.lightProbeGrid!=A.state.lightProbeGridArray.length>0)&&($t=!0):($t=!0,_t.__version=F.version);let li=_t.currentProgram;$t===!0&&(li=Yc(F,I,V),R&&F.isNodeMaterial&&R.onUpdateProgram(F,li,_t));let Bi=!1,Ps=!1,pr=!1,me=li.getUniforms(),Ve=_t.uniforms;if(x.useProgram(li.program)&&(Bi=!0,Ps=!0,pr=!0),F.id!==nt&&(nt=F.id,Ps=!0),_t.needsLights){let ye=i1(A.state.lightProbeGridArray,V);_t.lightProbeGrid!==ye&&(_t.lightProbeGrid=ye,Ps=!0)}if(Bi||ut!==b){x.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),me.setValue(O,"projectionMatrix",b.projectionMatrix),me.setValue(O,"viewMatrix",b.matrixWorldInverse);let zs=me.map.cameraPosition;zs!==void 0&&zs.setValue(O,je.setFromMatrixPosition(b.matrixWorld)),C.logarithmicDepthBuffer&&me.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&me.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),ut!==b&&(ut=b,Ps=!0,pr=!0)}if(_t.needsLights&&(Wn.state.directionalShadowMap.length>0&&me.setValue(O,"directionalShadowMap",Wn.state.directionalShadowMap,Y),Wn.state.spotShadowMap.length>0&&me.setValue(O,"spotShadowMap",Wn.state.spotShadowMap,Y),Wn.state.pointShadowMap.length>0&&me.setValue(O,"pointShadowMap",Wn.state.pointShadowMap,Y)),V.isSkinnedMesh){me.setOptional(O,V,"bindMatrix"),me.setOptional(O,V,"bindMatrixInverse");let ye=V.skeleton;ye&&(ye.boneTexture===null&&ye.computeBoneTexture(),me.setValue(O,"boneTexture",ye.boneTexture,Y))}V.isBatchedMesh&&(me.setOptional(O,V,"batchingTexture"),me.setValue(O,"batchingTexture",V._matricesTexture,Y),me.setOptional(O,V,"batchingIdTexture"),me.setValue(O,"batchingIdTexture",V._indirectTexture,Y),me.setOptional(O,V,"batchingColorTexture"),V._colorsTexture!==null&&me.setValue(O,"batchingColorTexture",V._colorsTexture,Y));let Bs=X.morphAttributes;if((Bs.position!==void 0||Bs.normal!==void 0||Bs.color!==void 0)&&L.update(V,X,li),(Ps||_t.receiveShadow!==V.receiveShadow)&&(_t.receiveShadow=V.receiveShadow,me.setValue(O,"receiveShadow",V.receiveShadow)),(F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial)&&F.envMap===null&&I.environment!==null&&(Ve.envMapIntensity.value=I.environmentIntensity),Ve.dfgLUT!==void 0&&(Ve.dfgLUT.value=q3()),Ps){if(me.setValue(O,"toneMappingExposure",D.toneMappingExposure),_t.needsLights&&a1(Ve,pr),mt&&F.fog===!0&&Et.refreshFogUniforms(Ve,mt),Et.refreshMaterialUniforms(Ve,F,et,it,A.state.transmissionRenderTarget[b.id]),_t.needsLights&&_t.lightProbeGrid){let ye=_t.lightProbeGrid;Ve.probesSH.value=ye.texture,Ve.probesMin.value.copy(ye.boundingBox.min),Ve.probesMax.value.copy(ye.boundingBox.max),Ve.probesResolution.value.copy(ye.resolution)}Wo.upload(O,e_(_t),Ve,Y)}if(F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(Wo.upload(O,e_(_t),Ve,Y),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&me.setValue(O,"center",V.center),me.setValue(O,"modelViewMatrix",V.modelViewMatrix),me.setValue(O,"normalMatrix",V.normalMatrix),me.setValue(O,"modelMatrix",V.matrixWorld),F.uniformsGroups!==void 0){let ye=F.uniformsGroups;for(let zs=0,mr=ye.length;zs<mr;zs++){let i_=ye[zs];tt.update(i_,li),tt.bind(i_,li)}}return li}function a1(b,I){b.ambientLightColor.needsUpdate=I,b.lightProbe.needsUpdate=I,b.directionalLights.needsUpdate=I,b.directionalLightShadows.needsUpdate=I,b.pointLights.needsUpdate=I,b.pointLightShadows.needsUpdate=I,b.spotLights.needsUpdate=I,b.spotLightShadows.needsUpdate=I,b.rectAreaLights.needsUpdate=I,b.hemisphereLights.needsUpdate=I}function r1(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(b,I,X){let F=H.get(b);F.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,F.__autoAllocateDepthBuffer===!1&&(F.__useRenderToTexture=!1),H.get(b.texture).__webglTexture=I,H.get(b.depthTexture).__webglTexture=F.__autoAllocateDepthBuffer?void 0:X,F.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,I){let X=H.get(b);X.__webglFramebuffer=I,X.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(b,I=0,X=0){K=b,k=I,q=X;let F=null,V=!1,mt=!1;if(b){let pt=H.get(b);if(pt.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(O.FRAMEBUFFER,pt.__webglFramebuffer),ht.copy(b.viewport),yt.copy(b.scissor),jt=b.scissorTest,x.viewport(ht),x.scissor(yt),x.setScissorTest(jt),nt=-1;return}else if(pt.__webglFramebuffer===void 0)Y.setupRenderTarget(b);else if(pt.__hasExternalTextures)Y.rebindTextures(b,H.get(b.texture).__webglTexture,H.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Ft=b.depthTexture;if(pt.__boundDepthTexture!==Ft){if(Ft!==null&&H.has(Ft)&&(b.width!==Ft.image.width||b.height!==Ft.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(b)}}let St=b.texture;(St.isData3DTexture||St.isDataArrayTexture||St.isCompressedArrayTexture)&&(mt=!0);let Tt=H.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Tt[I])?F=Tt[I][X]:F=Tt[I],V=!0):b.samples>0&&Y.useMultisampledRTT(b)===!1?F=H.get(b).__webglMultisampledFramebuffer:Array.isArray(Tt)?F=Tt[X]:F=Tt,ht.copy(b.viewport),yt.copy(b.scissor),jt=b.scissorTest}else ht.copy(Dt).multiplyScalar(et).floor(),yt.copy(ze).multiplyScalar(et).floor(),jt=qt;if(X!==0&&(F=P),x.bindFramebuffer(O.FRAMEBUFFER,F)&&x.drawBuffers(b,F),x.viewport(ht),x.scissor(yt),x.setScissorTest(jt),V){let pt=H.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+I,pt.__webglTexture,X)}else if(mt){let pt=I;for(let St=0;St<b.textures.length;St++){let Tt=H.get(b.textures[St]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+St,Tt.__webglTexture,X,pt)}}else if(b!==null&&X!==0){let pt=H.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,pt.__webglTexture,X)}nt=-1},this.readRenderTargetPixels=function(b,I,X,F,V,mt,vt,pt=0){if(!(b&&b.isWebGLRenderTarget)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let St=H.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&vt!==void 0&&(St=St[vt]),St){x.bindFramebuffer(O.FRAMEBUFFER,St);try{let Tt=b.textures[pt],Ft=Tt.format,Gt=Tt.type;if(b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+pt),!C.textureFormatReadable(Ft)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(Gt)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=b.width-F&&X>=0&&X<=b.height-V&&O.readPixels(I,X,F,V,ct.convert(Ft),ct.convert(Gt),mt)}finally{let Tt=K!==null?H.get(K).__webglFramebuffer:null;x.bindFramebuffer(O.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(b,I,X,F,V,mt,vt,pt=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let St=H.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&vt!==void 0&&(St=St[vt]),St)if(I>=0&&I<=b.width-F&&X>=0&&X<=b.height-V){x.bindFramebuffer(O.FRAMEBUFFER,St);let Tt=b.textures[pt],Ft=Tt.format,Gt=Tt.type;if(b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+pt),!C.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let At=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,At),O.bufferData(O.PIXEL_PACK_BUFFER,mt.byteLength,O.STREAM_READ),O.readPixels(I,X,F,V,ct.convert(Ft),ct.convert(Gt),0);let le=K!==null?H.get(K).__webglFramebuffer:null;x.bindFramebuffer(O.FRAMEBUFFER,le);let Fe=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await ob(O,Fe,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,At),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,mt),O.deleteBuffer(At),O.deleteSync(Fe),mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,I=null,X=0){let F=Math.pow(2,-X),V=Math.floor(b.image.width*F),mt=Math.floor(b.image.height*F),vt=I!==null?I.x:0,pt=I!==null?I.y:0;Y.setTexture2D(b,0),O.copyTexSubImage2D(O.TEXTURE_2D,X,0,0,vt,pt,V,mt),x.unbindTexture()},this.copyTextureToTexture=function(b,I,X=null,F=null,V=0,mt=0){let vt,pt,St,Tt,Ft,Gt,At,le,Fe,Ie=b.isCompressedTexture?b.mipmaps[mt]:b.image;if(X!==null)vt=X.max.x-X.min.x,pt=X.max.y-X.min.y,St=X.isBox3?X.max.z-X.min.z:1,Tt=X.min.x,Ft=X.min.y,Gt=X.isBox3?X.min.z:0;else{let Ve=Math.pow(2,-V);vt=Math.floor(Ie.width*Ve),pt=Math.floor(Ie.height*Ve),b.isDataArrayTexture?St=Ie.depth:b.isData3DTexture?St=Math.floor(Ie.depth*Ve):St=1,Tt=0,Ft=0,Gt=0}F!==null?(At=F.x,le=F.y,Fe=F.z):(At=0,le=0,Fe=0);let pe=ct.convert(I.format),xn=ct.convert(I.type),_t;I.isData3DTexture?(Y.setTexture3D(I,0),_t=O.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(Y.setTexture2DArray(I,0),_t=O.TEXTURE_2D_ARRAY):(Y.setTexture2D(I,0),_t=O.TEXTURE_2D),x.activeTexture(O.TEXTURE0),x.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,I.flipY),x.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),x.pixelStorei(O.UNPACK_ALIGNMENT,I.unpackAlignment);let Wn=x.getParameter(O.UNPACK_ROW_LENGTH),$t=x.getParameter(O.UNPACK_IMAGE_HEIGHT),li=x.getParameter(O.UNPACK_SKIP_PIXELS),Bi=x.getParameter(O.UNPACK_SKIP_ROWS),Ps=x.getParameter(O.UNPACK_SKIP_IMAGES);x.pixelStorei(O.UNPACK_ROW_LENGTH,Ie.width),x.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ie.height),x.pixelStorei(O.UNPACK_SKIP_PIXELS,Tt),x.pixelStorei(O.UNPACK_SKIP_ROWS,Ft),x.pixelStorei(O.UNPACK_SKIP_IMAGES,Gt);let pr=b.isDataArrayTexture||b.isData3DTexture,me=I.isDataArrayTexture||I.isData3DTexture;if(b.isDepthTexture){let Ve=H.get(b),Bs=H.get(I),ye=H.get(Ve.__renderTarget),zs=H.get(Bs.__renderTarget);x.bindFramebuffer(O.READ_FRAMEBUFFER,ye.__webglFramebuffer),x.bindFramebuffer(O.DRAW_FRAMEBUFFER,zs.__webglFramebuffer);for(let mr=0;mr<St;mr++)pr&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,H.get(b).__webglTexture,V,Gt+mr),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,H.get(I).__webglTexture,mt,Fe+mr)),O.blitFramebuffer(Tt,Ft,vt,pt,At,le,vt,pt,O.DEPTH_BUFFER_BIT,O.NEAREST);x.bindFramebuffer(O.READ_FRAMEBUFFER,null),x.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(V!==0||b.isRenderTargetTexture||H.has(b)){let Ve=H.get(b),Bs=H.get(I);x.bindFramebuffer(O.READ_FRAMEBUFFER,G),x.bindFramebuffer(O.DRAW_FRAMEBUFFER,z);for(let ye=0;ye<St;ye++)pr?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ve.__webglTexture,V,Gt+ye):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ve.__webglTexture,V),me?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Bs.__webglTexture,mt,Fe+ye):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Bs.__webglTexture,mt),V!==0?O.blitFramebuffer(Tt,Ft,vt,pt,At,le,vt,pt,O.COLOR_BUFFER_BIT,O.NEAREST):me?O.copyTexSubImage3D(_t,mt,At,le,Fe+ye,Tt,Ft,vt,pt):O.copyTexSubImage2D(_t,mt,At,le,Tt,Ft,vt,pt);x.bindFramebuffer(O.READ_FRAMEBUFFER,null),x.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else me?b.isDataTexture||b.isData3DTexture?O.texSubImage3D(_t,mt,At,le,Fe,vt,pt,St,pe,xn,Ie.data):I.isCompressedArrayTexture?O.compressedTexSubImage3D(_t,mt,At,le,Fe,vt,pt,St,pe,Ie.data):O.texSubImage3D(_t,mt,At,le,Fe,vt,pt,St,pe,xn,Ie):b.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,mt,At,le,vt,pt,pe,xn,Ie.data):b.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,mt,At,le,Ie.width,Ie.height,pe,Ie.data):O.texSubImage2D(O.TEXTURE_2D,mt,At,le,vt,pt,pe,xn,Ie);x.pixelStorei(O.UNPACK_ROW_LENGTH,Wn),x.pixelStorei(O.UNPACK_IMAGE_HEIGHT,$t),x.pixelStorei(O.UNPACK_SKIP_PIXELS,li),x.pixelStorei(O.UNPACK_SKIP_ROWS,Bi),x.pixelStorei(O.UNPACK_SKIP_IMAGES,Ps),mt===0&&I.generateMipmaps&&O.generateMipmap(_t),x.unbindTexture()},this.initRenderTarget=function(b){H.get(b).__webglFramebuffer===void 0&&Y.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Y.setTextureCube(b,0):b.isData3DTexture?Y.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Y.setTexture2DArray(b,0):Y.setTexture2D(b,0),x.unbindTexture()},this.resetState=function(){k=0,q=0,K=null,x.reset(),gt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Di}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=Zt._getDrawingBufferColorSpace(t),n.unpackColorSpace=Zt._getUnpackColorSpace()}};var Gb={type:"change"},W0={type:"start"},Xb={type:"end"},Ud=new xa,kb=new Si,Z3=Math.cos(70*E0.DEG2RAD),nn=new U,kn=2*Math.PI,fe={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},X0=1e-6,Ld=class extends Uc{constructor(t,n=null){super(t,n),this.state=fe.NONE,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ta.ROTATE,MIDDLE:Ta.DOLLY,RIGHT:Ta.PAN},this.touches={ONE:Aa.ROTATE,TWO:Aa.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new U,this._lastQuaternion=new si,this._lastTargetPosition=new U,this._quat=new si().setFromUnitVectors(t.up,new U(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Vo,this._sphericalDelta=new Vo,this._scale=1,this._panOffset=new U,this._rotateStart=new bt,this._rotateEnd=new bt,this._rotateDelta=new bt,this._panStart=new bt,this._panEnd=new bt,this._panDelta=new bt,this._dollyStart=new bt,this._dollyEnd=new bt,this._dollyDelta=new bt,this._dollyDirection=new U,this._mouse=new bt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=J3.bind(this),this._onPointerDown=K3.bind(this),this._onPointerUp=j3.bind(this),this._onContextMenu=sD.bind(this),this._onMouseWheel=tD.bind(this),this._onKeyDown=eD.bind(this),this._onTouchStart=nD.bind(this),this._onTouchMove=iD.bind(this),this._onMouseDown=Q3.bind(this),this._onMouseMove=$3.bind(this),this._interceptControlDown=aD.bind(this),this._interceptControlUp=rD.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Gb),this.update(),this.state=fe.NONE}pan(t,n){this._pan(t,n),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let n=this.object.position;nn.copy(n).sub(this.target),nn.applyQuaternion(this._quat),this._spherical.setFromVector3(nn),this.autoRotate&&this.state===fe.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=kn:i>Math.PI&&(i-=kn),s<-Math.PI?s+=kn:s>Math.PI&&(s-=kn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let a=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let r=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),a=r!=this._spherical.radius}if(nn.setFromSpherical(this._spherical),nn.applyQuaternion(this._quatInverse),n.copy(this.target).add(nn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let r=null;if(this.object.isPerspectiveCamera){let o=nn.length();r=this._clampDistance(o*this._scale);let l=o-r;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),a=!!l}else if(this.object.isOrthographicCamera){let o=new U(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),a=l!==this.object.zoom;let c=new U(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),r=nn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;r!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(r).add(this.object.position):(Ud.origin.copy(this.object.position),Ud.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ud.direction))<Z3?this.object.lookAt(this.target):(kb.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ud.intersectPlane(kb,this.target))))}else if(this.object.isOrthographicCamera){let r=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),r!==this.object.zoom&&(this.object.updateProjectionMatrix(),a=!0)}return this._scale=1,this._performCursorZoom=!1,a||this._lastPosition.distanceToSquared(this.object.position)>X0||8*(1-this._lastQuaternion.dot(this.object.quaternion))>X0||this._lastTargetPosition.distanceToSquared(this.target)>X0?(this.dispatchEvent(Gb),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?kn/60*this.autoRotateSpeed*t:kn/60/60*this.autoRotateSpeed}_getZoomScale(t){let n=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*n)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,n){nn.setFromMatrixColumn(n,0),nn.multiplyScalar(-t),this._panOffset.add(nn)}_panUp(t,n){this.screenSpacePanning===!0?nn.setFromMatrixColumn(n,1):(nn.setFromMatrixColumn(n,0),nn.crossVectors(this.object.up,nn)),nn.multiplyScalar(t),this._panOffset.add(nn)}_pan(t,n){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;nn.copy(s).sub(this.target);let a=nn.length();a*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*a/i.clientHeight,this.object.matrix),this._panUp(2*n*a/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(n*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,n){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=t-i.left,a=n-i.top,r=i.width,o=i.height;this._mouse.x=s/r*2-1,this._mouse.y=-(a/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let n=this.domElement;this._rotateLeft(kn*this._rotateDelta.x/n.clientHeight),this._rotateUp(kn*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let n=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(kn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),n=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-kn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),n=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(kn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),n=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-kn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),n=!0;break}n&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),i=.5*(t.pageX+n.x),s=.5*(t.pageY+n.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),i=.5*(t.pageX+n.x),s=.5*(t.pageY+n.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){let n=this._getSecondPointerPosition(t),i=t.pageX-n.x,s=t.pageY-n.y,a=Math.sqrt(i*i+s*s);this._dollyStart.set(0,a)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),a=.5*(t.pageY+i.y);this._rotateEnd.set(s,a)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let n=this.domElement;this._rotateLeft(kn*this._rotateDelta.x/n.clientHeight),this._rotateUp(kn*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),i=.5*(t.pageX+n.x),s=.5*(t.pageY+n.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let n=this._getSecondPointerPosition(t),i=t.pageX-n.x,s=t.pageY-n.y,a=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,a),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let r=(t.pageX+n.x)*.5,o=(t.pageY+n.y)*.5;this._updateZoomParameters(r,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==t.pointerId){this._pointers.splice(n,1);return}}_isTrackingPointer(t){for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==t.pointerId)return!0;return!1}_trackPointer(t){let n=this._pointerPositions[t.pointerId];n===void 0&&(n=new bt,this._pointerPositions[t.pointerId]=n),n.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let n=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[n]}_customWheelEvent(t){let n=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(n){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function K3(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType==="touch"?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function J3(e){this.enabled!==!1&&(e.pointerType==="touch"?this._onTouchMove(e):this._onMouseMove(e))}function j3(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Xb),this.state=fe.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y});break}}function Q3(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ta.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=fe.DOLLY;break;case Ta.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=fe.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=fe.ROTATE}break;case Ta.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=fe.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=fe.PAN}break;default:this.state=fe.NONE}this.state!==fe.NONE&&this.dispatchEvent(W0)}function $3(e){switch(this.state){case fe.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case fe.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case fe.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e);break}}function tD(e){this.enabled===!1||this.enableZoom===!1||this.state!==fe.NONE||(e.preventDefault(),this.dispatchEvent(W0),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(Xb))}function eD(e){this.enabled!==!1&&this._handleKeyDown(e)}function nD(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case Aa.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=fe.TOUCH_ROTATE;break;case Aa.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=fe.TOUCH_PAN;break;default:this.state=fe.NONE}break;case 2:switch(this.touches.TWO){case Aa.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=fe.TOUCH_DOLLY_PAN;break;case Aa.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=fe.TOUCH_DOLLY_ROTATE;break;default:this.state=fe.NONE}break;default:this.state=fe.NONE}this.state!==fe.NONE&&this.dispatchEvent(W0)}function iD(e){switch(this._trackPointer(e),this.state){case fe.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case fe.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case fe.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case fe.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=fe.NONE}}function sD(e){this.enabled!==!1&&e.preventDefault()}function aD(e){e.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function rD(e){e.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var W=Fi(dr(),1),Ln=[{id:"feet",code:"RB-01",name:"\u8DB3\u90E8\u7A33\u5B9A\u7EC4\u4EF6",group:"\u8FD0\u52A8\u7CFB\u7EDF",description:"\u5BBD\u578B\u590D\u5408\u8DB3\u5E95\u4E0E\u51CF\u9707\u8E1D\u5173\u8282\uFF0C\u4E3A\u673A\u5668\u4EBA\u63D0\u4F9B\u7A33\u5B9A\u652F\u6491\u3002",position:[0,0,0],explode:[0,-1.8,.4],color:2370098},{id:"calves",code:"RB-02",name:"\u5C0F\u817F\u9A71\u52A8\u6A21\u7EC4",group:"\u8FD0\u52A8\u7CFB\u7EDF",description:"\u96C6\u6210\u53CC\u8F74\u4F3A\u670D\u3001\u7535\u673A\u7F16\u7801\u5668\u4E0E\u78B3\u7EA4\u7EF4\u627F\u529B\u7ED3\u6784\u3002",position:[0,0,0],explode:[0,-1.2,.8],color:14278113},{id:"thighs",code:"RB-03",name:"\u5927\u817F\u6267\u884C\u7EC4\u4EF6",group:"\u8FD0\u52A8\u7CFB\u7EDF",description:"\u9AD8\u626D\u77E9\u5173\u8282\u6267\u884C\u5668\u8D1F\u8D23\u6B65\u6001\u8F93\u51FA\u548C\u59FF\u6001\u8C03\u6574\u3002",position:[0,0,0],explode:[0,-.5,1.4],color:15067370},{id:"pelvis",code:"RB-04",name:"\u9AA8\u76C6\u6838\u5FC3\u6846\u67B6",group:"\u627F\u8F7D\u7CFB\u7EDF",description:"\u8FDE\u63A5\u53CC\u817F\u4E0E\u8EAF\u5E72\u7684\u4E3B\u627F\u529B\u8282\u70B9\uFF0C\u5185\u7F6E\u60EF\u6027\u6D4B\u91CF\u5355\u5143\u3002",position:[0,0,0],explode:[0,.2,1.8],color:3422787},{id:"torso",code:"RB-05",name:"\u8EAF\u5E72\u8BA1\u7B97\u8231",group:"\u611F\u77E5\u4E0E\u8BA1\u7B97",description:"\u5BB9\u7EB3\u4E3B\u63A7\u8BA1\u7B97\u5355\u5143\u3001\u51B7\u5374\u56DE\u8DEF\u4E0E\u5168\u8EAB\u901A\u4FE1\u603B\u7EBF\u3002",position:[0,0,0],explode:[0,.9,2.1],color:15264491},{id:"left-arm",code:"RB-06L",name:"\u5DE6\u81C2\u4F5C\u4E1A\u6A21\u7EC4",group:"\u4F5C\u4E1A\u7CFB\u7EDF",description:"\u516D\u81EA\u7531\u5EA6\u8F7B\u91CF\u673A\u68B0\u81C2\uFF0C\u652F\u6301\u672B\u7AEF\u529B\u63A7\u4E0E\u5FEB\u901F\u6362\u88C5\u3002",position:[0,0,0],explode:[-2.4,.5,.5],color:14146269},{id:"right-arm",code:"RB-06R",name:"\u53F3\u81C2\u4F5C\u4E1A\u6A21\u7EC4",group:"\u4F5C\u4E1A\u7CFB\u7EDF",description:"\u516D\u81EA\u7531\u5EA6\u8F7B\u91CF\u673A\u68B0\u81C2\uFF0C\u5177\u5907\u78B0\u649E\u68C0\u6D4B\u4E0E\u67D4\u987A\u63A7\u5236\u3002",position:[0,0,0],explode:[2.4,.5,.5],color:14146269},{id:"head",code:"RB-07",name:"\u5934\u90E8\u611F\u77E5\u9635\u5217",group:"\u611F\u77E5\u4E0E\u8BA1\u7B97",description:"\u878D\u5408\u53CC\u76EE\u76F8\u673A\u3001\u6DF1\u5EA6\u4F20\u611F\u5668\u3001\u9EA6\u514B\u98CE\u9635\u5217\u4E0E\u72B6\u6001\u706F\u3002",position:[0,0,0],explode:[0,2.2,.8],color:15790835},{id:"battery",code:"RB-08",name:"\u80CC\u90E8\u80FD\u6E90\u6A21\u5757",group:"\u80FD\u6E90\u7CFB\u7EDF",description:"\u53EF\u5FEB\u62C6\u9AD8\u5BC6\u5EA6\u7535\u6C60\u5305\uFF0C\u914D\u7F6E\u70ED\u7BA1\u7406\u4E0E\u5B89\u5168\u9694\u79BB\u5355\u5143\u3002",position:[0,0,0],explode:[0,.8,-2.4],color:12134190}],Zb=new U(7.4,4.8,9.2),Kb=new U(0,2.55,0);function Jb(e,t=0,n=1){return Math.max(t,Math.min(n,e))}function jb(e,t=.62,n=.32){return new Po({color:e,metalness:t,roughness:n})}function we(e,t,n,i,s=0){let a=s>0?new yc(s,Math.max(.01,t[1]-s*2),5,10):new Sa(...t),r=new Je(a,jb(i));return r.position.set(...n),r.castShadow=!0,r.receiveShadow=!0,e.add(r),r}function Xn(e,t,n,i,s,a=[0,0,0]){let r=new Je(new Sc(t,t,n,24),jb(s));return r.position.set(...i),r.rotation.set(...a),r.castShadow=!0,r.receiveShadow=!0,e.add(r),r}function cD(e){let t=new Ki;t.name=e.id,t.userData.partId=e.id;let n=12134190,i=2238513,s=1119515,a=e.color;if(e.id==="feet"&&[-.55,.55].forEach(r=>{we(t,[.74,.22,1.18],[r,.17,.18],i),we(t,[.58,.12,.64],[r,.34,.05],n),Xn(t,.22,.24,[r,.54,0],s,[0,0,Math.PI/2])}),e.id==="calves"&&[-.55,.55].forEach(r=>{we(t,[.48,1.25,.5],[r,1.15,0],a,.2),we(t,[.18,.7,.58],[r,1.14,-.18],i),Xn(t,.27,.6,[r,1.82,0],s,[0,0,Math.PI/2]),Xn(t,.11,.66,[r,1.82,0],n,[0,0,Math.PI/2])}),e.id==="thighs"&&[-.55,.55].forEach(r=>{we(t,[.55,1.38,.62],[r,2.55,0],a,.23),we(t,[.64,.35,.7],[r,2.52,.03],i),Xn(t,.3,.65,[r,3.3,0],s,[0,0,Math.PI/2]),Xn(t,.11,.7,[r,3.3,0],n,[0,0,Math.PI/2])}),e.id==="pelvis"&&(we(t,[1.75,.62,.8],[0,3.72,0],a),we(t,[1.15,.42,.9],[0,4.06,-.02],i),Xn(t,.28,.7,[-.75,3.65,0],s,[0,0,Math.PI/2]),Xn(t,.28,.7,[.75,3.65,0],s,[0,0,Math.PI/2]),we(t,[.5,.1,.9],[0,4.25,0],n)),e.id==="torso"){we(t,[2.15,1.68,1.05],[0,5.1,0],a),we(t,[1.38,1,.16],[0,5.15,.57],i),we(t,[.86,.46,.11],[0,5.35,.67],s),we(t,[.55,.12,.08],[0,5.62,.73],n),Xn(t,.18,1.55,[0,4.43,0],s,[0,0,Math.PI/2]);for(let r=-2;r<=2;r+=1)we(t,[.12,.3,.08],[r*.24,4.82,.68],6515314)}if(e.id==="left-arm"||e.id==="right-arm"){let r=e.id==="left-arm"?-1:1;Xn(t,.33,.5,[r*1.34,5.66,0],s,[0,0,Math.PI/2]),we(t,[.5,1.18,.54],[r*1.4,4.94,0],a,.2),Xn(t,.25,.54,[r*1.41,4.26,0],i,[0,0,Math.PI/2]),we(t,[.42,1,.48],[r*1.42,3.65,0],a,.18),Xn(t,.2,.48,[r*1.42,3.08,0],s,[0,0,Math.PI/2]),we(t,[.5,.38,.7],[r*1.42,2.82,.12],i),we(t,[.12,.36,.58],[r*1.65,4.95,0],n)}return e.id==="head"&&(Xn(t,.2,.38,[0,6.13,0],i),we(t,[1.05,.72,.78],[0,6.62,.02],a),we(t,[.82,.28,.1],[0,6.66,.45],s),we(t,[.46,.1,.06],[0,6.66,.52],6215935),Xn(t,.08,.4,[-.28,7.06,0],n),Xn(t,.08,.22,[.3,6.98,0],i)),e.id==="battery"&&(we(t,[1.25,1.5,.48],[0,5.1,-.78],a),we(t,[.9,.92,.12],[0,5.12,-1.05],i),we(t,[.56,.1,.08],[0,5.5,-1.14],n),we(t,[.36,.14,.08],[0,4.76,-1.14],6215935)),t.traverse(r=>{r instanceof Je&&(r.userData.partId=e.id,r.userData.baseColor=r.material.color.getHex())}),t}function uD(e){let t=document.createElement("canvas");t.width=440,t.height=104;let n=t.getContext("2d");if(!n)return new lr;n.clearRect(0,0,t.width,t.height),n.fillStyle="rgba(10, 14, 19, 0.92)",n.fillRect(0,0,t.width,t.height),n.strokeStyle="#d6363d",n.lineWidth=5,n.strokeRect(2.5,2.5,t.width-5,t.height-5),n.font="600 34px sans-serif",n.fillStyle="#f5f7f8",n.textBaseline="middle",n.fillText(e,28,52);let i=new _c(t);i.colorSpace=En;let s=new lr(new Lo({map:i,depthTest:!1}));return s.scale.set(2.2,.52,1),s.renderOrder=20,s}function hD(e){let t=(0,Ce.useRef)(null),n=(0,Ce.useRef)(e);return(0,Ce.useEffect)(()=>{n.current=e},[e]),(0,Ce.useEffect)(()=>{let i=t.current;if(!i)return;let s=new hc;s.background=new It(724756),s.fog=new uc(724756,.034);let a=new vn(39,i.clientWidth/i.clientHeight,.1,100);a.position.copy(Zb);let r=()=>{let R=document.createElement("div");return R.className="webgl-fallback",R.innerHTML=`
        <div class="fallback-scan"><i></i><i></i><i></i></div>
        <div class="fallback-robot" aria-hidden="true">
          <span class="fb-head"></span><span class="fb-neck"></span><span class="fb-torso"></span>
          <span class="fb-core"></span><span class="fb-arm fb-arm-left"></span><span class="fb-arm fb-arm-right"></span>
          <span class="fb-leg fb-leg-left"></span><span class="fb-leg fb-leg-right"></span>
          <span class="fb-foot fb-foot-left"></span><span class="fb-foot fb-foot-right"></span>
        </div>
        <div class="fallback-note"><b>3D</b><span>\u5F53\u524D\u73AF\u5883\u672A\u542F\u7528\u56FE\u5F62\u52A0\u901F<br>\u8BF7\u5728\u652F\u6301 WebGL \u7684\u6D4F\u89C8\u5668\u4E2D\u67E5\u770B\u4EA4\u4E92\u6A21\u578B</span></div>
      `,i.appendChild(R),()=>{R.parentElement===i&&i.removeChild(R)}},o=document.createElement("canvas");if(!(o.getContext("webgl2")??o.getContext("webgl")))return r();let c;try{c=new Rd({antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch{return r()}c.setPixelRatio(Math.min(window.devicePixelRatio,2)),c.setSize(i.clientWidth,i.clientHeight),c.shadowMap.enabled=!0,c.shadowMap.type=Pf,c.outputColorSpace=En,c.toneMapping=Oc,c.toneMappingExposure=1.15,i.appendChild(c.domElement);let f=new Ld(a,c.domElement);f.target.copy(Kb),f.enableDamping=!0,f.dampingFactor=.075,f.minDistance=4.8,f.maxDistance=18,f.maxPolarAngle=Math.PI*.49,f.update(),s.add(new Tc(12114431,1513756,1.55));let p=new Fo(16777215,4.2);p.position.set(6,10,7),p.castShadow=!0,p.shadow.mapSize.set(2048,2048),p.shadow.camera.near=.1,p.shadow.camera.far=30,p.shadow.camera.left=-7,p.shadow.camera.right=7,p.shadow.camera.top=9,p.shadow.camera.bottom=-3,s.add(p);let u=new Fo(14038589,3.2);u.position.set(-7,5,-6),s.add(u);let d=new wc(6215935,18,11,2);d.position.set(3,4,4),s.add(d);let g=new Je(new xc(9.2,96),new Po({color:1251618,roughness:.82,metalness:.1}));g.rotation.x=-Math.PI/2,g.position.y=0,g.receiveShadow=!0,s.add(g);let M=new Dc(18,36,4016213,2107700);M.position.y=.012,M.material.transparent=!0,M.material.opacity=.55,s.add(M);let m=new Je(new bc(3.1,.035,12,120),new cr({color:12134190,transparent:!0,opacity:.5}));m.rotation.x=Math.PI/2,m.position.y=.035,s.add(m);let h=new Ki;h.rotation.y=-.22,s.add(h);let _=new Map,S=new Map;Ln.forEach(R=>{let P=cD(R);P.position.set(...R.position),h.add(P),_.set(R.id,P);let G=uD(`${R.code}  ${R.name}`);G.position.set(R.explode[0]*.64,4+R.explode[1]*.6,R.explode[2]*.5+.9),G.visible=!1,s.add(G),S.set(R.id,G)});let y=new Nc(void 0,14891328);y.visible=!1,s.add(y);let E=new Cc,A=new bt,w=R=>{let P=c.domElement.getBoundingClientRect();A.x=(R.clientX-P.left)/P.width*2-1,A.y=-((R.clientY-P.top)/P.height)*2+1,E.setFromCamera(A,a);let z=E.intersectObjects([..._.values()],!0)[0]?.object.userData.partId;z&&n.current.onSelect(z)};c.domElement.addEventListener("pointerdown",w);let v=n.current.resetSignal,T=new Rc;c.setAnimationLoop(()=>{let R=Math.min(T.getDelta(),.05),P=n.current,G=100/Ln.length;Ln.forEach((k,q)=>{let K=_.get(k.id);if(!K)return;let nt=Jb((P.progress-q*G)/G),ht=1-(1-Math.pow(1-nt,3)),yt=k.position[0]+k.explode[0]*(ht*1.28+P.exploded),jt=k.position[1]+k.explode[1]*(ht*1.28+P.exploded),Re=k.position[2]+k.explode[2]*(ht*1.28+P.exploded);K.position.lerp(new U(yt,jt,Re),1-Math.pow(.001,R));let Jt=nt>.012||P.progress>=99.9;K.visible=Jt,K.traverse(it=>{if(!(it instanceof Je))return;let et=it.material;et.transparent=P.xray,et.opacity=P.xray?k.id===P.selectedId?.88:.24:1,et.depthWrite=!P.xray,et.emissive.setHex(k.id===P.selectedId?4851979:0),et.emissiveIntensity=k.id===P.selectedId?.95:0});let J=S.get(k.id);if(J){J.visible=P.labels&&Jt;let it=new U;K.getWorldPosition(it),it.y+=k.id.includes("arm")?4.3:k.id==="head"?6.8:3.7,J.position.lerp(it.add(new U(k.explode[0]*.18,.35,.9)),.16)}});let z=_.get(P.selectedId);if(z&&z.visible?(y.setFromObject(z),y.visible=!P.xray):y.visible=!1,P.autoRotate&&(h.rotation.y+=R*.24),P.cameraFollow&&P.progress<99.8){let k=Math.min(Ln.length-1,Math.max(0,Math.floor(P.progress/G))),q=_.get(Ln[k].id);if(q){let K=new U;q.getWorldPosition(K),K.y=Jb(K.y+3.6,1.2,6.2),f.target.lerp(K,.035)}}P.resetSignal!==v&&(v=P.resetSignal,a.position.copy(Zb),f.target.copy(Kb),h.rotation.y=-.22,f.update()),m.rotation.z+=R*.06,f.update(),c.render(s,a)});let D=()=>{!i.clientWidth||!i.clientHeight||(a.aspect=i.clientWidth/i.clientHeight,a.updateProjectionMatrix(),c.setSize(i.clientWidth,i.clientHeight))},N=new ResizeObserver(D);return N.observe(i),()=>{N.disconnect(),c.setAnimationLoop(null),c.domElement.removeEventListener("pointerdown",w),f.dispose(),s.traverse(R=>{R instanceof Je&&(R.geometry.dispose(),(Array.isArray(R.material)?R.material:[R.material]).forEach(G=>G.dispose())),R instanceof lr&&(R.material.map?.dispose(),R.material.dispose())}),c.dispose(),c.domElement.parentElement===i&&i.removeChild(c.domElement)}},[]),(0,W.jsx)("div",{ref:t,className:"scene-mount","aria-label":"\u4E09\u7EF4\u673A\u5668\u4EBA\u62C6\u88C5\u573A\u666F"})}function fD({children:e}){return(0,W.jsx)("span",{className:"button-icon","aria-hidden":"true",children:e})}function q0(){let[e,t]=(0,Ce.useState)(100),[n,i]=(0,Ce.useState)(0),[s,a]=(0,Ce.useState)(1),[r,o]=(0,Ce.useState)(!1),[l,c]=(0,Ce.useState)("torso"),[f,p]=(0,Ce.useState)(!0),[u,d]=(0,Ce.useState)(!1),[g,M]=(0,Ce.useState)(!1),[m,h]=(0,Ce.useState)(!0),[_,S]=(0,Ce.useState)(0),[y,E]=(0,Ce.useState)(!1),A=(0,Ce.useMemo)(()=>Ln.find(R=>R.id===l)??Ln[4],[l]),w=Math.min(Ln.length,Math.floor(e/100*Ln.length+.001)),v=Math.min(Ln.length-1,Math.floor(e/100*Ln.length)),T=Ln[v];(0,Ce.useEffect)(()=>{if(!r)return;let R=window.setInterval(()=>{t(P=>{let G=Math.min(100,P+.22*s);return G>=100&&o(!1),G})},50);return()=>window.clearInterval(R)},[r,s]);let D=(0,Ce.useCallback)(()=>{if(e>=99.9){i(0),t(0),o(!0);return}o(R=>!R)},[e]),N=(0,Ce.useCallback)(()=>{o(!1),t(100),i(0),c("torso"),S(R=>R+1)},[]);return(0,Ce.useEffect)(()=>{let R=P=>{P.code==="Space"&&!(P.target instanceof HTMLInputElement)&&(P.preventDefault(),D()),P.key.toLowerCase()==="r"&&N(),P.key.toLowerCase()==="e"&&i(G=>G>.5?0:1)};return window.addEventListener("keydown",R),()=>window.removeEventListener("keydown",R)},[N,D]),(0,W.jsxs)("main",{className:"app-shell",children:[(0,W.jsxs)("header",{className:"topbar",children:[(0,W.jsxs)("div",{className:"brand-block",children:[(0,W.jsx)("div",{className:"brand-mark",children:(0,W.jsx)("span",{children:"R"})}),(0,W.jsxs)("div",{children:[(0,W.jsx)("p",{children:"ROBOT ASSEMBLY LAB"}),(0,W.jsx)("h1",{children:"\u5177\u8EAB\u673A\u5668\u4EBA \xB7 \u4EA4\u4E92\u5F0F\u62C6\u88C5\u8BAD\u7EC3"})]})]}),(0,W.jsxs)("div",{className:"top-status",children:[(0,W.jsx)("span",{className:"status-dot"}),(0,W.jsx)("span",{children:"\u8BAD\u7EC3\u573A\u666F\u5728\u7EBF"}),(0,W.jsx)("span",{className:"status-divider"}),(0,W.jsx)("span",{children:"\u6A21\u578B R-01"}),(0,W.jsx)("span",{className:"status-divider"}),(0,W.jsxs)("strong",{children:[Math.round(e),"%"]})]})]}),(0,W.jsxs)("section",{className:"workspace",children:[(0,W.jsxs)("aside",{className:"control-panel",children:[(0,W.jsxs)("section",{className:"robot-intro",children:[(0,W.jsxs)("div",{className:"eyebrow",children:[(0,W.jsx)("span",{})," R-01 / HUMANOID"]}),(0,W.jsxs)("h2",{children:["\u7075\u67A2",(0,W.jsx)("br",{}),(0,W.jsx)("em",{children:"\u4F5C\u4E1A\u673A\u5668\u4EBA"})]}),(0,W.jsx)("p",{children:"\u9762\u5411\u5DE5\u4E1A\u5DE1\u68C0\u4E0E\u67D4\u6027\u4F5C\u4E1A\u7684\u5168\u5C3A\u5BF8\u53CC\u8DB3\u673A\u5668\u4EBA"}),(0,W.jsxs)("div",{className:"spec-grid",children:[(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"1.72 m"}),"\u673A\u8EAB\u9AD8\u5EA6"]}),(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"58 kg"}),"\u6574\u673A\u8D28\u91CF"]}),(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"42 DoF"}),"\u81EA\u7531\u5EA6"]}),(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"4.5 h"}),"\u7EED\u822A\u65F6\u95F4"]})]})]}),(0,W.jsxs)("section",{className:"panel-section",children:[(0,W.jsxs)("div",{className:"section-title",children:[(0,W.jsx)("span",{children:"01"}),(0,W.jsx)("h3",{children:"\u88C5\u914D\u6D41\u7A0B"}),(0,W.jsx)("i",{})]}),(0,W.jsxs)("div",{className:"action-row",children:[(0,W.jsxs)("button",{className:"primary-action",onClick:D,children:[(0,W.jsx)(fD,{children:r?"\u2161":"\u25B6"}),r?"\u6682\u505C\u88C5\u914D":e>=99.9?"\u91CD\u65B0\u6F14\u793A":"\u7EE7\u7EED\u88C5\u914D"]}),(0,W.jsx)("button",{className:"secondary-action",onClick:N,children:"\u590D\u4F4D"})]}),(0,W.jsxs)("div",{className:"range-heading",children:[(0,W.jsx)("span",{children:r?`\u6B63\u5728\u5B89\u88C5 \xB7 ${T.name}`:e>=100?"\u88C5\u914D\u5DF2\u5B8C\u6210":"\u88C5\u914D\u5DF2\u6682\u505C"}),(0,W.jsxs)("b",{children:[Math.round(e),"%"]})]}),(0,W.jsx)("input",{className:"range-control",type:"range",min:"0",max:"100",value:e,"aria-label":"\u88C5\u914D\u8FDB\u5EA6",style:{"--range-progress":`${e}%`},onChange:R=>{o(!1),t(Number(R.target.value))}}),(0,W.jsxs)("div",{className:"inline-setting",children:[(0,W.jsx)("span",{children:"\u64AD\u653E\u901F\u5EA6"}),(0,W.jsx)("div",{className:"segmented",children:[.5,1,2].map(R=>(0,W.jsxs)("button",{className:s===R?"active":"",onClick:()=>a(R),children:[R,"\xD7"]},R))})]}),(0,W.jsxs)("label",{className:"toggle-row",children:[(0,W.jsx)("span",{children:"\u955C\u5934\u8DDF\u968F\u88C5\u914D\u90E8\u4EF6"}),(0,W.jsx)("input",{type:"checkbox",checked:m,onChange:R=>h(R.target.checked)}),(0,W.jsx)("i",{})]})]}),(0,W.jsxs)("section",{className:"panel-section",children:[(0,W.jsxs)("div",{className:"section-title",children:[(0,W.jsx)("span",{children:"02"}),(0,W.jsx)("h3",{children:"\u7206\u70B8\u89C6\u56FE"}),(0,W.jsx)("i",{})]}),(0,W.jsxs)("div",{className:"range-heading",children:[(0,W.jsx)("span",{children:"\u62C6\u89E3\u8DDD\u79BB"}),(0,W.jsxs)("b",{children:[Math.round(n*100),"%"]})]}),(0,W.jsx)("input",{className:"range-control",type:"range",min:"0",max:"100",value:n*100,"aria-label":"\u62C6\u89E3\u8DDD\u79BB",style:{"--range-progress":`${n*100}%`},onChange:R=>{o(!1),t(100),i(Number(R.target.value)/100)}}),(0,W.jsxs)("div",{className:"action-row compact",children:[(0,W.jsx)("button",{className:"secondary-action",onClick:()=>{t(100),i(1)},children:"\u5168\u90E8\u62C6\u89E3"}),(0,W.jsx)("button",{className:"secondary-action",onClick:()=>i(0),children:"\u6536\u62E2\u6A21\u578B"})]}),(0,W.jsxs)("label",{className:"toggle-row",children:[(0,W.jsx)("span",{children:"\u663E\u793A\u96F6\u4EF6\u6807\u7B7E"}),(0,W.jsx)("input",{type:"checkbox",checked:f,onChange:R=>p(R.target.checked)}),(0,W.jsx)("i",{})]})]}),(0,W.jsxs)("section",{className:"panel-section view-section",children:[(0,W.jsxs)("div",{className:"section-title",children:[(0,W.jsx)("span",{children:"03"}),(0,W.jsx)("h3",{children:"\u89C6\u56FE\u4E0E\u5206\u6790"}),(0,W.jsx)("i",{})]}),(0,W.jsxs)("label",{className:"toggle-row",children:[(0,W.jsx)("span",{children:"\u81EA\u52A8\u65CB\u8F6C"}),(0,W.jsx)("input",{type:"checkbox",checked:u,onChange:R=>d(R.target.checked)}),(0,W.jsx)("i",{})]}),(0,W.jsxs)("label",{className:"toggle-row",children:[(0,W.jsx)("span",{children:"\u900F\u89C6\u7ED3\u6784"}),(0,W.jsx)("input",{type:"checkbox",checked:g,onChange:R=>M(R.target.checked)}),(0,W.jsx)("i",{})]}),(0,W.jsx)("button",{className:"wide-action",onClick:()=>S(R=>R+1),children:"\u2316\u3000\u6062\u590D\u6700\u4F73\u89C6\u89D2"})]})]}),(0,W.jsxs)("div",{className:"stage",children:[(0,W.jsx)(hD,{progress:e,exploded:n,selectedId:l,labels:f,autoRotate:u,xray:g,cameraFollow:m,resetSignal:_,onSelect:c}),(0,W.jsxs)("div",{className:"assembly-banner",children:[(0,W.jsx)("div",{className:"banner-index",children:String(v+1).padStart(2,"0")}),(0,W.jsxs)("div",{children:[(0,W.jsx)("span",{children:r?"ASSEMBLING / \u6B63\u5728\u88C5\u914D":"DIGITAL ASSEMBLY / \u6570\u5B57\u88C5\u914D"}),(0,W.jsx)("b",{children:e>=100?"\u5168\u673A\u88C5\u914D\u5B8C\u6210":T.name})]}),(0,W.jsx)("div",{className:"banner-line",children:(0,W.jsx)("i",{style:{width:`${e}%`}})})]}),(0,W.jsxs)("div",{className:"view-hint",children:[(0,W.jsx)("span",{children:"\u25C9 \u5DE6\u952E\u9009\u62E9"}),(0,W.jsx)("span",{children:"\u21BB \u62D6\u62FD\u65CB\u8F6C"}),(0,W.jsx)("span",{children:"\u2301 \u6EDA\u8F6E\u7F29\u653E"}),(0,W.jsx)("span",{children:"SPACE \u64AD\u653E"})]}),(0,W.jsxs)("aside",{className:"part-card",children:[(0,W.jsxs)("div",{className:"part-card-head",children:[(0,W.jsx)("span",{children:"\u5F53\u524D\u90E8\u4EF6"}),(0,W.jsx)("b",{children:A.code})]}),(0,W.jsx)("div",{className:"part-visual",children:(0,W.jsx)("div",{className:"part-orbit",children:(0,W.jsx)("span",{})})}),(0,W.jsx)("p",{className:"part-group",children:A.group}),(0,W.jsx)("h3",{children:A.name}),(0,W.jsx)("p",{className:"part-description",children:A.description}),(0,W.jsxs)("div",{className:"part-meta",children:[(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"\u72B6\u6001"}),"\u5DF2\u6821\u51C6"]}),(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:"\u8FDE\u63A5"}),"CAN-FD"]})]}),(0,W.jsxs)("button",{onClick:()=>E(!0),children:["\u67E5\u770B\u90E8\u4EF6\u6863\u6848 ",(0,W.jsx)("span",{children:"\u2192"})]})]}),(0,W.jsxs)("button",{className:"parts-dock",onClick:()=>E(!0),children:[(0,W.jsxs)("b",{children:[w,"/",Ln.length]}),(0,W.jsx)("span",{children:"\u5DF2\u88C5\u914D\u90E8\u4EF6"}),(0,W.jsx)("i",{children:"\uFF0B"})]})]})]}),(0,W.jsxs)("div",{className:`parts-drawer ${y?"open":""}`,"aria-hidden":!y,children:[(0,W.jsx)("button",{className:"drawer-backdrop","aria-label":"\u5173\u95ED\u90E8\u4EF6\u6863\u6848",onClick:()=>E(!1)}),(0,W.jsxs)("aside",{children:[(0,W.jsxs)("div",{className:"drawer-head",children:[(0,W.jsxs)("div",{children:[(0,W.jsx)("span",{children:"PART DOSSIERS"}),(0,W.jsx)("h2",{children:"\u90E8\u4EF6\u88C5\u914D\u6863\u6848"})]}),(0,W.jsx)("button",{onClick:()=>E(!1),children:"\xD7"})]}),(0,W.jsx)("p",{className:"drawer-summary",children:"\u9009\u62E9\u4EFB\u610F\u90E8\u4EF6\uFF0C\u4E09\u7EF4\u573A\u666F\u4F1A\u540C\u6B65\u5B9A\u4F4D\u5E76\u9AD8\u4EAE\u3002\u88C5\u914D\u987A\u5E8F\u6309\u7167\u627F\u8F7D\u3001\u9A71\u52A8\u3001\u8BA1\u7B97\u3001\u4F5C\u4E1A\u4E0E\u80FD\u6E90\u7CFB\u7EDF\u5C55\u5F00\u3002"}),(0,W.jsx)("div",{className:"parts-list",children:Ln.map((R,P)=>{let G=e>=(P+1)/Ln.length*100-.1;return(0,W.jsxs)("button",{className:l===R.id?"selected":"",onClick:()=>{c(R.id),E(!1)},children:[(0,W.jsx)("span",{className:"part-number",children:String(P+1).padStart(2,"0")}),(0,W.jsxs)("span",{children:[(0,W.jsx)("b",{children:R.name}),(0,W.jsxs)("small",{children:[R.code," \xB7 ",R.group]})]}),(0,W.jsx)("i",{className:G?"done":"",children:G?"\u2713":"\u25CB"})]},R.id)})})]})]})]})}var Qb=Fi(dr(),1);function Y0(){return(0,Qb.jsx)(q0,{})}var Z0=Fi(dr());(0,$b.createRoot)(document.getElementById("root")).render((0,Z0.jsx)(QS,{attribute:"class",defaultTheme:"light",enableSystem:!1,children:(0,Z0.jsx)(Y0,{})}));
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
